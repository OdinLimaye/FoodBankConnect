# scripts/parse_programs_html.py
"""
Run from repo root:
    python3 scripts/parse_programs_html.py
"""

import re
import json
import uuid
from pathlib import Path
from datetime import datetime
from bs4 import BeautifulSoup

ROOT = Path.cwd()
SRC_MAIN = ROOT / "public" / "programs" / "programs.html"
DETAILS_DIR = ROOT / "public" / "programs"
OUT_DIR = ROOT / "data" / "normalized"
OUT_DIR.mkdir(parents=True, exist_ok=True)

EMAIL_RE = re.compile(r"[\w\.-]+@[\w\.-]+\.\w+")
PHONE_RE = re.compile(r"(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}")

TYPE_MAP = {
    "distribution": "distribution",
    "Distribution": "distribution",
    "Volunteer": "volunteer",
    "Class": "class",
    "Training": "class",
    "Service": "service",
    "training": "class",
    "service": "service",
    "volunteer": "volunteer"
}

def slugify(text: str) -> str:
    s = (text or "").lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "program"

def read_detail_page(relative_href):
    if not relative_href:
        return None, None
    href = str(relative_href).split("#")[0].split("?")[0]
    candidate = DETAILS_DIR / href
    if candidate.exists():
        return candidate.read_text(encoding="utf-8"), candidate
    candidate2 = SRC_MAIN.parent / href
    if candidate2.exists():
        return candidate2.read_text(encoding="utf-8"), candidate2
    candidate3 = ROOT / href
    if candidate3.exists():
        return candidate3.read_text(encoding="utf-8"), candidate3
    return None, None

def parse_detail_fields(html):
    """
    Return dict {images:[], description: str|None, website: str|None}
    description is the first meaningful paragraph (whitespace collapsed).
    """
    out = {"images": [], "description": None, "website": None}
    if not html:
        return out
    soup = BeautifulSoup(html, "lxml")
    for img in soup.select("img"):
        src = img.get("src")
        if src:
            out["images"].append(src)
    site = soup.find("a", href=lambda x: x and isinstance(x, str) and x.startswith("http"))
    if site:
        out["website"] = site.get("href")
    p = soup.find("p")
    if p:
        desc = re.sub(r"\s+", " ", p.get_text(" ", strip=True)).strip()
        out["description"] = desc
    return out

def extract_card_fields(card):
    """
    Extract name, data_type (from ancestor data-type), fields dict, image, details_link.
    """
    data = {}
    title = card.select_one(".card-title")
    data["name"] = title.get_text(strip=True) if title else "Unnamed Program"
    ancestor = card.find_parent(attrs={"data-type": True})
    if ancestor and ancestor.get("data-type"):
        data["data_type"] = ancestor["data-type"]
    else:
        data["data_type"] = card.get("data-type") or card.get("data_type")
    fields = {}
    for p in card.select("p"):
        txt = p.get_text(" ", strip=True)
        if ":" in txt:
            k, v = [s.strip() for s in txt.split(":", 1)]
            fields[k.lower()] = v
    data["fields"] = fields
    img = card.select_one("img")
    if img and img.get("src"):
        data["image"] = img.get("src")
    a = card.find("a", href=True, string=re.compile(r"(See Details|View Details)", re.I))
    if a:
        data["details_link"] = a["href"]
    return data

def normalize_to_final_shape(raw, detail_meta):
    """
    Produce final object shape:
    {
      "name": "...",
      "program_type": "...",
      "eligibility": "...",
      "frequency": "...",
      "cost": "...",
      "host": "...",
      "detailsPage": "culinary-training",
      "about": "...",
      "sign_up_link": "https://...",
      "type": "program"
    }
    """
    name = raw.get("name")
    # program_type: prefer data_type (mapped) else fields.type
    typ_raw = raw.get("data_type") or raw.get("fields", {}).get("type") or raw.get("fields", {}).get("program type")
    program_type = TYPE_MAP.get(typ_raw, typ_raw.lower() if typ_raw else None)

    eligibility = raw.get("fields", {}).get("eligibility") or None
    frequency = raw.get("fields", {}).get("frequency") or None
    cost = raw.get("fields", {}).get("cost") or None
    host = raw.get("fields", {}).get("host") or None

    details_link = raw.get("details_link") or None
    # detailsPage: slug without extension; prefer details_link name else slugified name
    detailsPage = None
    if details_link:
        detailsPage = Path(details_link).stem
    else:
        detailsPage = slugify(name)

    about = detail_meta.get("description") or None
    # sign_up_link: prefer absolute website from detail page, otherwise fallback to relative details_link
    sign_up_link = detail_meta.get("website") or details_link or None

    obj = {
        "name": name,
        "program_type": program_type,
        "eligibility": eligibility,
        "frequency": frequency,
        "cost": cost,
        "host": host,
        "detailsPage": detailsPage,
        "about": about,
        "sign_up_link": sign_up_link,
        "type": "program"
    }
    return obj

def main():
    if not SRC_MAIN.exists():
        print(f"ERROR: {SRC_MAIN} not found. Run from repo root.")
        return

    html = SRC_MAIN.read_text(encoding="utf-8")
    soup = BeautifulSoup(html, "lxml")

    # Select top-level containers to avoid duplicate parsing
    containers = soup.select("#programCards .program-card")
    if not containers:
        containers = soup.select("#programCards .card")
    if not containers:
        print("No program cards found.")
        return

    seen = set()
    written = []

    for container in containers:
        card = container.select_one(".card") or container
        raw = extract_card_fields(card)
        dedupe_key = (raw.get("details_link") or "").strip() or (raw.get("name") or "").strip().lower()
        if not dedupe_key:
            dedupe_key = str(uuid.uuid4())
        if dedupe_key in seen:
            continue
        seen.add(dedupe_key)

        details_href = raw.get("details_link")
        detail_html, detail_path = read_detail_page(details_href) if details_href else (None, None)
        detail_meta = parse_detail_fields(detail_html) if detail_html else {"images": [], "description": None, "website": None}

        final_obj = normalize_to_final_shape(raw, detail_meta)

        # write out as program_<slug>.json (no id, single object)
        slug = slugify(final_obj.get("detailsPage") or final_obj.get("name"))
        out_path = OUT_DIR / f"program_{slug}.json"
        with out_path.open("w", encoding="utf-8") as f:
            json.dump(final_obj, f, indent=2)
        print("WROTE:", out_path)
        written.append(out_path)

    print(f"\nWrote {len(written)} program JSON files to {OUT_DIR.resolve()}")

if __name__ == "__main__":
    main()
