# ============================================================= #
# Copyright (c) 2025 Francisco Vivas Puerto (aka "DaFrancc").
# All rights reserved.
# ============================================================= #

from typing import Any, Dict, List, Optional, Tuple, Iterable
import os
import sys
import json
import hashlib
import logging

from sqlalchemy import String, Float, Integer, TIMESTAMP, create_engine, func, cast, Sequence
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column
from sqlalchemy.dialects.postgresql import JSONB, TEXT

from scraper import scrape as run_all_scrapers

global_foodbank_id = 1
global_program_id = 1
global_sponsor_id = 1


class Base(DeclarativeBase):
    """
     Serves as the SQLAlchemy metadata base.
    """


class FoodBank(Base):
    """
     Food banks table. Matches persisted record shape.
    """
    __tablename__ = "foodbanks"

    id: Mapped[str] = mapped_column(String, primary_key=True, server_default=cast(func.nextval("foodbanks_id_seq"), TEXT))
    name: Mapped[Optional[str]] = mapped_column(String(256))
    about: Mapped[Optional[str]] = mapped_column(String)
    address: Mapped[Optional[str]] = mapped_column(String(256))
    capacity: Mapped[Optional[str]] = mapped_column(String(64))
    city: Mapped[Optional[str]] = mapped_column(String(128))
    state: Mapped[Optional[str]] = mapped_column(String(8))
    eligibility: Mapped[Optional[str]] = mapped_column(String(128))
    image: Mapped[Optional[str]] = mapped_column(String)
    languages: Mapped[Optional[list[str]]] = mapped_column(JSONB, default=list)
    open_hours: Mapped[Optional[Any]] = mapped_column(JSONB, default=None)
    phone: Mapped[Optional[str]] = mapped_column(String(32))
    services: Mapped[Optional[list[str]]] = mapped_column(JSONB, default=list)
    urgency: Mapped[Optional[str]] = mapped_column(String(64))
    website: Mapped[Optional[str]] = mapped_column(String)
    zipcode: Mapped[Optional[str]] = mapped_column(String(16))
    fetched_at: Mapped[Optional[Any]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    created_at: Mapped[Any] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())




class Program(Base):
    """
    Programs table. Matches persisted record shape.
    """
    __tablename__ = "programs"

    id: Mapped[str] = mapped_column(String, primary_key=True, server_default=cast(func.nextval("programs_id_seq"), TEXT))
    name: Mapped[Optional[str]] = mapped_column(String(256))
    program_type: Mapped[Optional[str]] = mapped_column(String(64))
    eligibility: Mapped[Optional[str]] = mapped_column(String(128))
    frequency: Mapped[Optional[str]] = mapped_column(String(64))
    cost: Mapped[Optional[str]] = mapped_column(String(64))
    host: Mapped[Optional[str]] = mapped_column(String(256))
    details_page: Mapped[Optional[str]] = mapped_column(String(256))
    about: Mapped[Optional[str]] = mapped_column(String)
    sign_up_link: Mapped[Optional[str]] = mapped_column(String)
    image: Mapped[Optional[str]] = mapped_column(String)
    links: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)           # null or object/array
    fetched_at: Mapped[Optional[Any]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    created_at: Mapped[Any] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())


class Sponsor(Base):
    """
    Sponsors table. Matches persisted record shape.
    """
    __tablename__ = "sponsors"

    id: Mapped[str] = mapped_column(String, primary_key=True, server_default=cast(func.nextval("sponsors_id_seq"), TEXT))
    name: Mapped[Optional[str]] = mapped_column(String(256))
    image: Mapped[Optional[str]] = mapped_column(String)
    alt: Mapped[Optional[str]] = mapped_column(String(256))
    contribution: Mapped[Optional[str]] = mapped_column(String(128))
    contribution_amt: Mapped[Optional[str]] = mapped_column(String(64))          # "N/A" etc -> String
    affiliation: Mapped[Optional[str]] = mapped_column(String(256))
    past_involvement: Mapped[Optional[str]] = mapped_column(String)
    about: Mapped[Optional[str]] = mapped_column(String)
    sponsor_link: Mapped[Optional[str]] = mapped_column(String)
    city: Mapped[Optional[str]] = mapped_column(String(128))
    state: Mapped[Optional[str]] = mapped_column(String(8))
    contact: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)        # null or object
    media: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)          # null or array/object
    ein: Mapped[Optional[str]] = mapped_column(String(256))
    fetched_at: Mapped[Optional[Any]] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    created_at: Mapped[Any] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())




def get_engine():
    """
    Builds Engine from discrete env vars; sets search_path via connect args.
    Required: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD.
    Optional: DB_PORT (5432), DB_SCHEMA (public).
    """
    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT", "5432")
    name = os.getenv("DB_NAME")
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    schema = os.getenv("DB_SCHEMA", "public")

    missing = [k for k in ("DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD") if not os.getenv(k)]
    if missing:
        raise RuntimeError(f"Missing required database env var(s): {', '.join(missing)}")

    conn_str = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{name}"
    return create_engine(
        conn_str,
        pool_pre_ping=True,
        future=True,
        connect_args={"options": f"-c search_path={schema}"},
    )


def get_session(engine) -> Session:
    """
    Returns a new Session bound to engine.
    """
    return Session(engine)


def normalize_buckets(rows):
    """
    /* Split into (foodbanks, programs, sponsors) without 'type'. */
    """
    fb, prg, spn = [], [], []
    def _classify(r):
        if any(k in r for k in ("program_type","details_page","sign_up_link","frequency","host")):
            return "program"
        if any(k in r for k in ("affiliation","contribution","contribution_amt","sponsor_link","ein","media","contact")):
            return "sponsor"
        return "foodbank"
    for r in rows:
        b = r.get("__bucket__") or _classify(r)
        (prg if b=="program" else spn if b=="sponsor" else fb).append(r)
    return fb, prg, spn



def _dedup_rows(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Removes exact-duplicate dicts using canonical JSON serialization.
    """
    seen, out = set(), []
    for r in rows:
        key = json.dumps(r, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
        if key in seen:
            continue
        seen.add(key)
        out.append(r)
    return out


def _first_nonempty(rec: Dict[str, Any], keys: Iterable[str]) -> Optional[str]:
    """
    Returns the first non-empty value among the provided keys as str.
    """
    for k in keys:
        v = rec.get(k)
        if isinstance(v, str) and v.strip():
            return v.strip()
        if isinstance(v, (int, float)):
            return str(v)
    return None


def make_stable_id(rec: Dict[str, Any], bucket: str) -> str:
    """
    Returns a stable, deterministic ID when none is provided.
       Preference:
         1) Strong identifiers: id/uuid/slug/ein/program_id/sponsor_id/url
         2) Name + location tuple hash
         3) Canonical JSON hash of the whole record

    """
    by_domain = _first_nonempty(rec, ("id", "uuid", "slug", "ein", "program_id", "sponsor_id", "url"))
    if by_domain:
        return f"{bucket}:{by_domain}"

    parts = []
    for k in ("name", "title"):
        if rec.get(k):
            parts.append(str(rec[k]))
            break
    for k in ("city", "state", "zipcode", "zip", "country"):
        if rec.get(k):
            parts.append(str(rec[k]))
    if parts:
        joined = "|".join(parts)
        h = hashlib.sha256(joined.encode("utf-8")).hexdigest()[:24]
        return f"{bucket}:nm:{h}"

    canon = json.dumps(rec, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    h = hashlib.sha256((bucket + "|" + canon).encode("utf-8")).hexdigest()[:24]
    return f"{bucket}:h:{h}"

def _digits_only(s: object) -> Optional[str]:
    """
    /* Return s as a str if it is a non-empty sequence of digits; else None. */
    """
    if s is None:
        return None
    ss = str(s)
    return ss if ss.isdigit() else None


def _map_foodbank(rec: dict) -> dict:
    """
    Project a raw scraper record into FoodBank columns.
    """
    rid = _digits_only(rec.get("id"))     # only accept already-integer IDs
    out = {
        "name": rec.get("name"),
        "about": rec.get("about"),
        "address": rec.get("address"),
        "capacity": rec.get("capacity"),
        "city": rec.get("city"),
        "state": rec.get("state"),
        "eligibility": rec.get("eligibility"),
        "image": rec.get("image"),
        "languages": rec.get("languages") or [],
        "open_hours": rec.get("open_hours"),
        "phone": rec.get("phone"),
        "services": rec.get("services") or [],
        "urgency": rec.get("urgency"),
        "website": rec.get("website"),
        "zipcode": rec.get("zipcode"),
        "fetched_at": rec.get("fetched_at"),
    }
    if rid is not None:
        out["id"] = rid
    return out



def _map_program(rec: dict) -> dict:
    """
    Project a raw scraper record into Program columns.
    """
    rid = _digits_only(rec.get("id"))     # only accept already-integer IDs
    out = {
        "id": str(rid),
        "name": rec.get("name"),
        "program_type": rec.get("program_type"),
        "eligibility": rec.get("eligibility"),
        "frequency": rec.get("frequency"),
        "cost": rec.get("cost"),
        "host": rec.get("host"),
        "details_page": rec.get("details_page"),
        "about": rec.get("about"),
        "sign_up_link": rec.get("sign_up_link"),
        "image": rec.get("image"),
        "links": rec.get("links"),                 # leave as dict/list/None; ORM handles JSONB
        "fetched_at": rec.get("fetched_at"),
    }
    if rid is not None:
        out["id"] = rid
    return out


def _map_sponsor(rec: dict) -> dict:
    """
    Project a raw scraper record into Sponsor columns.
    """
    rid = _digits_only(rec.get("id"))     # only accept already-integer IDs
    out = {
        "id": str(rid),
        "name": rec.get("name") or rec.get("title"),
        "image": rec.get("image") or rec.get("logo"),
        "alt": rec.get("alt") or (f"{rec.get('name')} Logo" if rec.get("name") else None),
        "contribution": rec.get("contribution"),
        "contribution_amt": rec.get("contribution_amt") or "N/A",
        "affiliation": rec.get("affiliation"),
        "past_involvement": rec.get("past_involvement"),
        "about": rec.get("about"),
        "sponsor_link": rec.get("sponsor_link"),
        "city": rec.get("city"),
        "state": rec.get("state"),
        "contact": rec.get("contact"),             # dict/list/None
        "media": rec.get("media"),                 # dict/list/None
        "ein": rec.get("ein"),
        "fetched_at": rec.get("fetched_at"),
    }
    if rid is not None:
        out["id"] = rid
    return out



def coerce_kwargs(rec: Dict[str, Any], bucket: str) -> Dict[str, Any]:
    """
     Dispatch to the correct projector for the target table.
    """
    if bucket == "foodbank":
        return _map_foodbank(rec)
    if bucket == "program":
        return _map_program(rec)
    if bucket == "sponsor":
        return _map_sponsor(rec)
    rid = rec.get("id") or rec.get("uuid") or rec.get("slug") or make_stable_id(rec, bucket)
    return {"id": str(rid), "name": rec.get("name") or rec.get("title")}



def truncate_tables(session: Session) -> None:
    """
    Clears target tables inside current transaction.
    """
    session.query(FoodBank).delete()
    session.query(Program).delete()
    session.query(Sponsor).delete()


def bulk_insert(session, model, items, bucket):
    global global_foodbank_id, global_program_id, global_sponsor_id

    rows = []
    for r in items:
        r.pop("type", None)  # remove legacy key

        # Assign global ID as string if missing or invalid
        if "id" not in r or not str(r["id"]).isdigit():
            if model.__tablename__ == "foodbanks":
                r["id"] = str(global_foodbank_id)
                global_foodbank_id += 1
            elif model.__tablename__ == "programs":
                r["id"] = str(global_program_id)
                global_program_id += 1
            elif model.__tablename__ == "sponsors":
                r["id"] = str(global_sponsor_id)
                global_sponsor_id += 1

        rows.append(model(**r))

    session.bulk_save_objects(rows)
    session.commit()
    return len(rows)


def run_once() -> int:
    """
     Runs scrapers or dummy data, optionally simulates (no DB writes), else writes atomically and exits. 
    """
    logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
    simulate = os.getenv("SIMULATE_SUCCESS") == "1"
    dry_run = simulate or (os.getenv("DRY_RUN") == "1")
    do_truncate = os.getenv("TRUNCATE", "1") == "1"

    if os.getenv("SIMULATE_DUMMY") == "1":
        logging.info("Simulation mode: using preset dummy data (skipping scrapers).")
        payload = [
            {"name": "Austin Food Bank", "city": "Austin", "state": "TX"},
            {"name": "Community Outreach Program"},
            {"name": "Local Business Co."},
        ]
    else:
        logging.info("Starting scrape...")
        payload = run_all_scrapers()

    if isinstance(payload, list):
        rows, errors_count = payload, 0
    elif isinstance(payload, dict):
        rows, errors_count = payload.get("results", []) or [], len(payload.get("errors", []) or [])
    else:
        logging.warning("Unexpected scraper return type: %s; treating as empty list.", type(payload).__name__)
        rows, errors_count = [], 0
    if errors_count:
        logging.warning("Scraper errors detected: %d", errors_count)

    fb, prg, spn = normalize_buckets(rows)
    fb, prg, spn = _dedup_rows(fb), _dedup_rows(prg), _dedup_rows(spn)
    logging.info("Buckets: foodbanks=%d programs=%d sponsors=%d", len(fb), len(prg), len(spn))

    if dry_run:
        logging.info("Simulation/Dry run enabled; no database writes performed.")
        return 0

    try:
        engine = get_engine()
        Base.metadata.create_all(engine)
        with get_session(engine) as s:
            try:
                if do_truncate:
                    truncate_tables(s)
                n1 = bulk_insert(s, FoodBank, fb, "foodbank")
                n2 = bulk_insert(s, Program, prg, "program")
                n3 = bulk_insert(s, Sponsor, spn, "sponsor")
                s.commit()
                logging.info("Load complete. Inserted: fb=%d prg=%d spn=%d", n1, n2, n3)
                return 0
            except Exception:
                s.rollback()
                raise
    except Exception as exc:
        logging.exception("Load failed: %s", exc)
        return 1



if __name__ == "__main__":
    sys.exit(run_once())
