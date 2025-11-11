# -*- coding: utf-8 -*-
# ============================================================================
#  © 2025 Francisco Vivas Puerto (aka “DaFrancc”)
#  All rights reserved. This file is part of the FoodBankConnect API.
#  Use and distribution permitted with attribution to the author.
# ============================================================================

#!/usr/bin/env python3
"""
FoodBankConnect API (Serverless-ready)
--------------------------------------
Read-only REST API exposing /v1/<resource> and /v1/<resource>/<id>.

Technologies:
- Flask for request routing
- Flask-CORS for cross-origin support
- SQLAlchemy (Core) for pooled, parameterized DB access
- awsgi adapter for AWS Lambda compatibility

Behavior:
- Returns compact lists and single-object reads from the configured schema.
- Produces descriptive, structured JSON errors on invalid input and runtime issues.
"""

from __future__ import annotations

import os
import re
import uuid
import logging
from typing import Any, Dict, List, Optional, Tuple

from flask import Flask, jsonify, request, g
from flask_cors import CORS
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine, Row
from sqlalchemy.exc import (
    OperationalError,
    ProgrammingError,
    IntegrityError,
    TimeoutError as SQLAlchemyTimeout,
)

# -------------------------------------------------------------------------
# Configuration
# -------------------------------------------------------------------------
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql+psycopg://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME')}"
    f"{'?sslmode=require' if os.getenv('DATABASE_URL') is None else ''}"
)

DB_SCHEMA = os.getenv("DB_SCHEMA", "app")
MAX_PAGE_SIZE = int(os.getenv("MAX_REQUESTS", "50"))
REQUEST_LOG_LEVEL = os.getenv("REQUEST_LOG_LEVEL", "INFO").upper()

ALLOWED_TYPES: Dict[str, str] = {
    "foodbanks": "foodbank",
    "programs": "program",
    "sponsors": "sponsor",
}

_IDENT_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


# ------------------------------------------------------------------------------
# Application / engine / logging
# ------------------------------------------------------------------------------

app = Flask(__name__)
CORS(app)

engine: Engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    future=True,
)

logger = logging.getLogger("fbc.api")
logger.setLevel(getattr(logging, REQUEST_LOG_LEVEL, logging.INFO))


# ------------------------------------------------------------------------------
# Utilities: request ids, JSON error format, schema/table helpers
# ------------------------------------------------------------------------------

def _request_id() -> str:
    """
    Returns the per-request id. Creates one if not present.
    """
    rid = getattr(g, "request_id", None)
    if not rid:
        rid = uuid.uuid4().hex
        g.request_id = rid
    return rid


def json_error(status: int, code: str, message: str, *, details: Dict[str, Any] | None = None):
    """
    Builds a consistent JSON error response body with an HTTP status code.
    """
    payload: Dict[str, Any] = {
        "error": code,
        "message": message,
        "request_id": _request_id(),
    }
    if details:
        payload["details"] = details
    return jsonify(payload), status


def _validate_ident(name: str) -> str:
    """
    Validates that the provided name is a simple, unquoted PostgreSQL identifier.
    """
    if not _IDENT_RE.match(name or ""):
        raise ValueError("DB_SCHEMA must be a simple identifier (e.g., 'app' or 'public').")
    return name


SCHEMA = _validate_ident(DB_SCHEMA)


def _table_qualified(resource: str) -> str:
    """
    Returns the schema-qualified table name for a resource.
    """
    return f"{SCHEMA}.{resource}"


def _table_exists(table_qualified: string) -> bool:
    """
    Returns True if the schema-qualified table exists.
    """
    schema, table = table_qualified.split(".", 1)
    sql = text(
        """
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = :schema AND table_name = :table
        )
        """
    )
    with engine.connect() as conn:
        return bool(conn.execute(sql, {"schema": schema, "table": table}).scalar())


# ------------------------------------------------------------------------------
# Row mappers
# ------------------------------------------------------------------------------

def _row_to_dict(row: Row) -> Dict[str, Any]:
    """
    Converts a SQLAlchemy Row to a plain dictionary.
    """
    return dict(row._mapping)


# ------------------------------------------------------------------------------
# Data access
# ------------------------------------------------------------------------------

def fetch_one(resource: str, item_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves a single record by id from the specified resource table.
    Returns a dictionary if found, otherwise None.
    """
    sql = text(f"SELECT * FROM {_table_qualified(resource)} WHERE id = :item_id")
    with engine.connect() as conn:
        row = conn.execute(sql, {"item_id": item_id}).first()
    return _row_to_dict(row) if row else None


def fetch_list(resource: str, start: Optional[str], size: int,
               filters: Dict[str, Any] = None, sort: List[str] = None) -> Tuple[List[Dict[str, Any]], Optional[str]]:
    """
    Retrieves a page of items using optional filtering and sorting.
    Returns a list of dictionaries and a next_start cursor if available.
    """
    n = _clamp_page_size(size)
    base = f"SELECT * FROM {_table_qualified(resource)}"

    filters = filters or {}
    sort = sort or []

    # Build WHERE and ORDER BY dynamically
    filter_sort_sql, params = _apply_filters_and_sort(resource, filters, sort)

    sql_str = base + filter_sort_sql + "\nLIMIT :n"
    params["n"] = n

    with engine.connect() as conn:
        rows = conn.execute(text(sql_str), params).fetchall()

    items = [_row_to_dict(r) for r in rows]
    next_start = items[-1]["id"] if items else None
    return items, next_start


def _clamp_page_size(size: Optional[int]) -> int:
    """
    Clamps the page size to [1, MAX_PAGE_SIZE]. Raises ValueError on overflow.
    """
    n = MAX_PAGE_SIZE if size is None else int(size)
    if n < 1:
        n = 1
    if n > MAX_PAGE_SIZE:
        raise ValueError(f"Requested size exceeds maximum ({MAX_PAGE_SIZE}).")
    return n


def _order_numeric_first_sql() -> str:
    """
    ORDER BY clause that places numeric ids first (ascending as bigint), then lexicographic ids.
    """
    return """
        ORDER BY
            CASE WHEN id ~ '^[0-9]+$' THEN 0 ELSE 1 END,
            (CASE WHEN id ~ '^[0-9]+$' THEN id::bigint END),
            id
    """


def _apply_cursor(base_select: str, start: Optional[str], n: int) -> Tuple[str, Dict[str, Any]]:
    """
    Builds cursored list query:
      - No start: numeric-first from beginning
      - Numeric start: numeric ids >= start plus any non-numeric ids after
      - Non-numeric start: lexicographic WHERE id >= start
    """
    params: Dict[str, Any] = {"n": n}

    if start is None:
        return base_select + _order_numeric_first_sql() + "\nLIMIT :n", params

    if str(start).isdigit():
        params["start"] = start
        return (
            base_select
            + """
            WHERE
                (id ~ '^[0-9]+$' AND CAST(id AS BIGINT) >= CAST(:start AS BIGINT))
                OR (NOT id ~ '^[0-9]+$')
            """
            + _order_numeric_first_sql()
            + "\nLIMIT :n",
            params,
        )

    params["start"] = start
    return (
        base_select
        + """
        WHERE id >= :start
        ORDER BY id
        LIMIT :n
        """,
        params,
    )

# ------------------------------------------------------------------------------
# Filtering and sorting helper
# ------------------------------------------------------------------------------

def _apply_filters_and_sort(resource: str, filters: Dict[str, Any], sort: List[str]) -> Tuple[str, Dict[str, Any]]:
    """
    Builds dynamic SQL WHERE and ORDER BY clauses for filtering and sorting.
    """
    where_clauses = []
    order_clauses = []
    params: Dict[str, Any] = {}

    # --- Filters ---
    for i, (col, val) in enumerate(filters.items()):
        param = f"f{i}"

        if col == "languages":
            # Use JSON containment operator with a literal JSON array string
            where_clauses.append(f"{col} @> :{param}")
            params[param] = f'["{val}"]'  # valid JSON string, not casted

        elif "%" in val:
            where_clauses.append(f"{col} LIKE :{param}")
            params[param] = val

        else:
            where_clauses.append(f"{col} = :{param}")
            params[param] = val

    where_sql = ""
    if where_clauses:
        where_sql = " WHERE " + " AND ".join(where_clauses)

    # --- Sorting ---
    for s in sort:
        if s.startswith("-"):
            order_clauses.append(f"{s[1:]} DESC")
        else:
            order_clauses.append(f"{s} ASC")

    order_sql = ""
    if order_clauses:
        order_sql = " ORDER BY " + ", ".join(order_clauses)

    return where_sql + order_sql, params


# ------------------------------------------------------------------------------
# Request logging
# ------------------------------------------------------------------------------

@app.before_request
def _assign_request_id_and_log():
    """
    Assigns a per-request id and records a concise access log line.
    """
    _request_id()
    logger.info(
        "REQ %s %s %s %s",
        request.method,
        request.path,
        request.remote_addr,
        dict(request.args),
    )


@app.after_request
def _after(resp):
    """
    Adds request id header to all responses.
    """
    resp.headers["X-Request-Id"] = _request_id()
    return resp


# ------------------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------------------

@app.get("/health")
def health():
    """
    Performs a lightweight health check and returns the result.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return jsonify({"ok": True, "request_id": _request_id()})
    except Exception as e:
        logger.exception("health check failed")
        return json_error(500, "HealthCheckFailed", "Database connectivity check failed.", details={"reason": str(e)})


@app.get("/v1/<resource>")
@app.get("/v1/<resource>/<item_id>")
def handle_resource(resource: str, item_id: Optional[str] = None):
    """
    Serves a collection or a single item for the specified resource.
    """
    if resource not in ALLOWED_TYPES:
        return json_error(404, "NotFound", "Unknown resource.", details={"resource": resource})

    table = _table_qualified(resource)
    try:
        if not _table_exists(table):
            return json_error(
                503,
                "ServiceNotReady",
                "Required database table is missing.",
                details={"schema": SCHEMA, "missing": [table]},
            )

        if item_id:
            obj = fetch_one(resource, item_id)
            if not obj:
                singular = {"foodbanks": "Foodbank", "programs": "Program", "sponsors": "Sponsor"}.get(resource, "Item")
                return json_error(404, "NotFound", f"{singular} not found.", details={"id": item_id})
            return jsonify({"type": ALLOWED_TYPES[resource], **obj, "request_id": _request_id()})

        # -----------------------------
        # Filtering and sorting support
        # -----------------------------
        filters = {}
        sort = []

        for key, val in request.args.items():
            if key in ("start", "size"):
                continue
            elif key == "sort":
                sort = [s.strip() for s in val.split(",") if s.strip()]
            else:
                filters[key] = val

        try:
            size_str = request.args.get("size")
            size = int(size_str) if size_str else 25
        except ValueError:
            return json_error(400, "BadRequest", "Query parameter 'size' must be an integer.")

        try:
            items, next_start = fetch_list(resource, request.args.get("start"), size, filters, sort)
        except ValueError as ve:
            return json_error(400, "BadRequest", str(ve), details={"max_size": MAX_PAGE_SIZE})

        payload: Dict[str, Any] = {"items": items, "request_id": _request_id()}
        if next_start:
            payload["next_start"] = next_start
        return jsonify(payload)

    except ProgrammingError as e:
        # Handles missing relations and syntax errors; returns descriptive output.
        msg = str(e.__cause__ or e)
        logger.exception("programming error")
        return json_error(500, "DatabaseProgrammingError", "Database query failed.", details={"reason": msg, "table": table})
    except OperationalError as e:
        # Handles network, authentication, DNS, TLS errors.
        msg = str(e.__cause__ or e)
        logger.exception("operational error")
        return json_error(503, "DatabaseUnavailable", "Database connection failed.", details={"reason": msg})
    except SQLAlchemyTimeout as e:
        # Handles DB timeout while executing statements.
        logger.exception("database timeout")
        return json_error(504, "DatabaseTimeout", "Database operation timed out.")
    except IntegrityError as e:
        # Not expected in read-only paths, but included for completeness.
        msg = str(e.__cause__ or e)
        logger.exception("integrity error")
        return json_error(500, "DatabaseIntegrityError", "Database integrity error.", details={"reason": msg})
    except Exception as e:
        # Catch-all for unexpected errors; logs the stack trace and returns opaque details to clients.
        logger.exception("unhandled error")
        return json_error(500, "InternalServerError", "Unexpected error occurred.", details={"reason": str(e)})

# ------------------------------------------------------------------------------
# Full-site search endpoint
# ------------------------------------------------------------------------------

@app.get("/v1/search")
def search_all():
    """
    Performs a full-site text search across foodbanks, programs, and sponsors.
    Returns ranked results with snippets highlighting matches.
    """
    query = (request.args.get("q") or "").strip()
    if not query:
        return jsonify({"items": [], "request_id": _request_id()})

    q_lower = query.lower()
    query_terms = re.findall(r"\b\w+\b", q_lower)
    results: List[Dict[str, Any]] = []

    def relevance_score(text: str) -> int:
        """Compute a simple relevance score based on phrase and word frequency."""
        text_lower = text.lower()
        phrase_score = text_lower.count(q_lower) * 3
        word_score = sum(text_lower.count(term) for term in query_terms)
        return phrase_score + word_score

    def get_snippet(text: str) -> str:
        """Return ~80 chars of surrounding text around the first match."""
        text_lower = text.lower()
        for term in query_terms:
            idx = text_lower.find(term)
            if idx != -1:
                start = max(0, idx - 40)
                end = min(len(text), idx + 40)
                return text[start:end]
        return text[:80]

    with engine.connect() as conn:
        for model in ALLOWED_TYPES.keys():
            table = _table_qualified(model)
            try:
                # Get all rows and convert to searchable text
                sql = text(f"SELECT * FROM {table}")
                rows = conn.execute(sql).fetchall()

                for row in rows:
                    # Convert row to dict and create searchable text from all string fields
                    row_dict = _row_to_dict(row)
                    # Concatenate all text fields for searching
                    text_parts = []
                    for key, value in row_dict.items():
                        if value is not None:
                            if isinstance(value, (list, dict)):
                                text_parts.append(str(value))
                            else:
                                text_parts.append(str(value))
                    text_blob = " ".join(text_parts)
                    
                    score = relevance_score(text_blob)
                    if score > 0:
                        results.append({
                            "model": model.capitalize(),
                            "id": row_dict.get("id", ""),
                            "name": row_dict.get("name") or "(Unnamed)",
                            "snippet": get_snippet(text_blob),
                            "score": score,
                        })
            except Exception as e:
                logger.warning("Search failed for %s: %s", model, e)
                logger.exception("Full error details")
                continue

    # Sort by relevance (highest first)
    results.sort(key=lambda r: r["score"], reverse=True)

    return jsonify({
        "items": results,
        "query": query,
        "request_id": _request_id(),
    })

# ------------------------------------------------------------------------------
# AWS Lambda entrypoint
# ------------------------------------------------------------------------------

def _normalize_http_event(e: dict) -> dict:
    # If HTTP API v2 / Function URL
    if isinstance(e, dict) and e.get("version") == "2.0":
        http = (e.get("requestContext") or {}).get("http") or {}
        return {
            "resource": e.get("rawPath") or "/",
            "path": e.get("rawPath") or "/",
            "httpMethod": http.get("method", "GET"),
            "headers": e.get("headers") or {},
            "multiValueHeaders": {},
            "queryStringParameters": e.get("queryStringParameters"),
            "multiValueQueryStringParameters": None,
            "pathParameters": None,
            "stageVariables": None,
            "requestContext": e.get("requestContext") or {},
            "body": e.get("body"),
            "isBase64Encoded": e.get("isBase64Encoded", False),
        }
    return e  # already v1 or non-HTTP

def lambda_handler(event, context):
    import awsgi  # this is the module provided by aws-wsgi
    print("event version:", event.get("version"))
    return awsgi.response(app, _normalize_http_event(event), context)


# ------------------------------------------------------------------------------
# Local development entrypoint
# ------------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8000")), debug=False)
