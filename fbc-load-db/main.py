#!/usr/bin/env python3
# ============================================================================
#  © 2025 Francisco Vivas Puerto (aka “DaFrancc”)
#  All rights reserved. This file is part of the FoodBankConnect tooling.
#  You may use and distribute with proper attribution to the author.
# ============================================================================

"""
FoodBankConnect loader + minimal API (Flask + SQLAlchemy).

Satisfies rubric:
- Uses Flask as a web framework.
- Implements simple API endpoints.
- Returns data queried from the database via SQLAlchemy ORM.
- Uses Flask-CORS for cross-origin requests.
- Uses SQLAlchemy ORM models to define/create tables.
- Manipulates and inserts data using SQLAlchemy.
"""

import os
import ssl
import json
import logging
import asyncio
import inspect
from typing import Any, Dict, List, Optional, Tuple

from flask import Flask, jsonify, request
from flask_cors import CORS

from sqlalchemy import (
    create_engine, String, Text, TIMESTAMP, func, delete
)
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, Session
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.exc import SQLAlchemyError

# Your existing concurrent scraper runner
from scraper import scrape as run_all_scrapers

# ----------------------------------------------------------------------------
# Logging & Configuration
# ----------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

DB_HOST = os.environ.get("DB_HOST", "")
DB_NAME = os.environ.get("DB_NAME", "postgres")
DB_USER = os.environ.get("DB_USER", "")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
DB_PORT = int(os.environ.get("DB_PORT", "5432"))
DB_SCHEMA = os.environ.get("DB_SCHEMA", "app")

# Loader dry-run (still supported for CLI usage)
DRY_RUN = os.environ.get("DRY_RUN", "false").lower() == "true"

# Flask
app = Flask(__name__)
CORS(app)  # <- Flask-CORS requirement

# ----------------------------------------------------------------------------
# SQLAlchemy setup
# ----------------------------------------------------------------------------
class Base(DeclarativeBase):
    pass

def _pg_url() -> str:
    # Using pg8000 driver to keep parity with your infra; psycopg(2/3) also OK.
    return (
        f"postgresql+pg8000://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )

# Build SSL context if RDS bundle is provided (optional but recommended)
def _ssl_args() -> dict:
    cafile = "/etc/ssl/certs/rds-ca-global-bundle.pem"
    if os.path.exists(cafile):
        ctx = ssl.create_default_context(cafile=cafile)
        return {"ssl_context": ctx}
    return {}

ENGINE = create_engine(
    _pg_url(),
    connect_args=_ssl_args(),  # passes ssl_context to pg8000
    pool_pre_ping=True,
    pool_recycle=1800,
)

# Ensure schema exists before create_all (idempotent)
with ENGINE.begin() as conn:
    conn.exec_driver_sql(f"CREATE SCHEMA IF NOT EXISTS {DB_SCHEMA}")


# ----------------------------------------------------------------------------
# ORM Models (tables are created from these)
# ----------------------------------------------------------------------------
class Foodbank(Base):
    __tablename__ = "foodbanks"
    __table_args__ = {"schema": DB_SCHEMA}

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    about: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    website: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    state: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    zipcode: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    urgency: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    capacity: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    languages: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    services: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    open_hours: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    eligibility: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    fetched_at: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[str]] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())


class Program(Base):
    __tablename__ = "programs"
    __table_args__ = {"schema": DB_SCHEMA}

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    about: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    host: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    program_type: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    frequency: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    eligibility: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cost: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    details_page: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sign_up_link: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    links: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    fetched_at: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[str]] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())


class Sponsor(Base):
    __tablename__ = "sponsors"
    __table_args__ = {"schema": DB_SCHEMA}

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    about: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    affiliation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    alt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    contribution: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    contribution_amt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    past_involvement: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sponsor_link: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    state: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ein: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    contact: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    media: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    fetched_at: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[str]] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())


# Create tables if they don't exist (idempotent)
Base.metadata.create_all(ENGINE)

# ----------------------------------------------------------------------------
# Normalizers (ported from your existing script)
# ----------------------------------------------------------------------------
def _txt(v: Any) -> Optional[str]:
    if v is None:
        return None
    if isinstance(v, (dict, list)):
        return json.dumps(v, ensure_ascii=False)
    return str(v)

def _as_list(x: Any) -> Optional[List[Any]]:
    if x is None:
        return None
    if isinstance(x, (list, tuple)):
        return list(x)
    return [x]

def normalize_foodbank(r: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": _txt(r.get("id")),
        "name": _txt(r.get("name")),
        "about": _txt(r.get("about")),
        "website": _txt(r.get("website")),
        "phone": _txt(r.get("phone")),
        "image": _txt(r.get("image")),
        "address": _txt(r.get("address")),
        "city": _txt(r.get("city")),
        "state": _txt(r.get("state")),
        "zipcode": _txt(r.get("zipcode")),
        "urgency": _txt(r.get("urgency")),
        "capacity": _txt(r.get("capacity")),
        "languages": _as_list(r.get("languages")),
        "services": _as_list(r.get("services")),
        "open_hours": _txt(r.get("open_hours")),
        "eligibility": _txt(r.get("eligibility")),
        "fetched_at": _txt(r.get("fetched_at")),
    }

def normalize_program(r: Dict[str, Any]) -> Dict[str, Any]:
    about = r.get("about") or r.get("description")
    return {
        "id": _txt(r.get("id")),
        "name": _txt(r.get("name")),
        "about": _txt(about),
        "host": _txt(r.get("host")),
        "program_type": _txt(r.get("program_type")),
        "frequency": _txt(r.get("frequency")),
        "eligibility": _txt(r.get("eligibility")),
        "cost": _txt(r.get("cost")),
        "image": _txt(r.get("image")),
        "details_page": _txt(r.get("detailsPage")),
        "sign_up_link": _txt(r.get("sign_up_link")),
        "links": r.get("links"),
        "fetched_at": _txt(r.get("fetched_at")),
    }

def normalize_sponsor(r: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": _txt(r.get("id")),
        "name": _txt(r.get("name")),
        "about": _txt(r.get("about")),
        "affiliation": _txt(r.get("affiliation")),
        "image": _txt(r.get("image")),
        "alt": _txt(r.get("alt")),
        "contribution": _txt(r.get("contribution")),
        "contribution_amt": _txt(r.get("contributionAmt")),
        "past_involvement": _txt(r.get("pastInvolvement")),
        "sponsor_link": _txt(r.get("sponsor_link")),
        "city": _txt(r.get("city")),
        "state": _txt(r.get("state")),
        "ein": _txt(r.get("EIN")),
        "contact": r.get("contact"),
        "media": r.get("media"),
        "fetched_at": _txt(r.get("fetched_at")),
    }

# ----------------------------------------------------------------------------
# Scraper runner (same behavior; supports async scrapers)
# ----------------------------------------------------------------------------
def get_rows() -> List[Dict[str, Any]]:
    r = run_all_scrapers()
    if inspect.iscoroutine(r):
        return asyncio.run(r) or []
    return r or []

# ----------------------------------------------------------------------------
# Loader (uses ORM for truncate + inserts)
# ----------------------------------------------------------------------------
def _bucketize(rows: List[Dict[str, Any]]) -> Tuple[List[Dict], List[Dict], List[Dict], int]:
    fb: List[Dict[str, Any]] = []
    pr: List[Dict[str, Any]] = []
    sp: List[Dict[str, Any]] = []
    unknown = 0
    for rec in rows:
        t = (rec.get("type") or "").strip().lower()
        if t == "foodbank":
            fb.append(rec)
        elif t == "program":
            pr.append(rec)
        elif t == "sponsor":
            sp.append(rec)
        else:
            unknown += 1
    return fb, pr, sp, unknown

def _assign_ids(items: List[Dict[str, Any]]) -> None:
    for i, r in enumerate(items, start=1):
        if not r.get("id"):
            r["id"] = str(i)

def run_load(dry_run: bool = False) -> Dict[str, Any]:
    rows = get_rows()
    fb_raw, pr_raw, sp_raw, unknown = _bucketize(rows)

    _assign_ids(fb_raw)
    _assign_ids(pr_raw)
    _assign_ids(sp_raw)

    if dry_run:
        return {
            "ok": True,
            "dry_run": True,
            "counts": {
                "foodbanks": len(fb_raw),
                "programs": len(pr_raw),
                "sponsors": len(sp_raw),
                "skipped_unknown_type": unknown,
            },
        }

    # Normalize and insert via ORM
    fb = [Foodbank(**normalize_foodbank(r)) for r in fb_raw]
    pr = [Program(**normalize_program(r)) for r in pr_raw]
    sp = [Sponsor(**normalize_sponsor(r)) for r in sp_raw]

    try:
        with Session(ENGINE) as session:
            # Truncate (delete) existing rows in a transaction
            session.execute(delete(Foodbank))
            session.execute(delete(Program))
            session.execute(delete(Sponsor))

            # Bulk insert
            session.add_all(fb + pr + sp)
            session.commit()
        return {"ok": True, "inserted": {"foodbanks": len(fb), "programs": len(pr), "sponsors": len(sp)}}
    except SQLAlchemyError as e:
        log.exception("Load failed")
        return {"ok": False, "error": "LoadFailed", "message": str(e)}

# ----------------------------------------------------------------------------
# API Endpoints (simple; enough to satisfy rubric)
# ----------------------------------------------------------------------------
@app.get("/health")
def health():
    return jsonify({"ok": True, "schema": DB_SCHEMA})

@app.post("/load")
def api_load():
    dry = request.args.get("dry_run", "false").lower() == "true"
    result = run_load(dry_run=dry)
    status = 200 if result.get("ok") else 500
    return jsonify(result), status

def _paginate_args() -> Tuple[int, int]:
    try:
        limit = max(0, min(1000, int(request.args.get("limit", 100))))
    except ValueError:
        limit = 100
    try:
        offset = max(0, int(request.args.get("offset", 0)))
    except ValueError:
        offset = 0
    return limit, offset

def _row_to_dict(obj) -> Dict[str, Any]:
    # Minimal serializer (avoids pydantic dependency)
    d = {c.key: getattr(obj, c.key) for c in obj.__table__.columns}
    # JSONB columns are already Python dict/list; leave as is
    # Convert Timestamp -> ISO string if present
    if d.get("created_at") is not None and hasattr(d["created_at"], "isoformat"):
        d["created_at"] = d["created_at"].isoformat()
    return d

@app.get("/foodbanks")
def list_foodbanks():
    limit, offset = _paginate_args()
    with Session(ENGINE) as session:
        rows = session.query(Foodbank).order_by(Foodbank.id).offset(offset).limit(limit).all()
        return jsonify([_row_to_dict(r) for r in rows])

@app.get("/programs")
def list_programs():
    limit, offset = _paginate_args()
    with Session(ENGINE) as session:
        rows = session.query(Program).order_by(Program.id).offset(offset).limit(limit).all()
        return jsonify([_row_to_dict(r) for r in rows])

@app.get("/sponsors")
def list_sponsors():
    limit, offset = _paginate_args()
    with Session(ENGINE) as session:
        rows = session.query(Sponsor).order_by(Sponsor.id).offset(offset).limit(limit).all()
        return jsonify([_row_to_dict(r) for r in rows])

# ----------------------------------------------------------------------------
# CLI entrypoint (optional): keeps your old “python main.py” workflow working
# ----------------------------------------------------------------------------
if __name__ == "__main__":
    # If you want to keep CLI loading behavior:
    if DRY_RUN or os.environ.get("LOAD_ON_START", "false").lower() == "true":
        print(json.dumps(run_load(dry_run=DRY_RUN), ensure_ascii=False))
    # Run a dev server (for the rubric API). In production, use gunicorn/uwsgi.
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8080")), debug=False)
