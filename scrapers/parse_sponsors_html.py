# scripts/parse_sponsors_html.py
"""
Run:
    python3 scripts/parse_sponsors_html.py
"""
import re
import json
import hashlib
from pathlib import Path
from datetime import datetime
from bs4 import BeautifulSoup

ROOT = Path.cwd()
SRC_MAIN = ROOT / "public" / "sponsors" / "sponsors.html"
DETAILS_DIR = ROOT / "public" / "sponsors"
OUT_DIR = ROOT / "data" / "normalized"
OUT_DIR.mkdir(parents=True, exist_ok=True)

EMAIL_RE = re.compile(r"[\w\.-]+@[\w\.-]+\.\w+")
PHONE_RE = re.compile(r"(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}")

def slugify(text: str) -> str:
    s = (text or "").lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "sponsor"

def read_detail_page(relative_href):
    """Return (html, Path) or (None, None) if not found."""
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
    """Extract images, description, website from a sponsor detail page."""
    out = {"images": [], "description": None, "website": None}
    if not html:
        return out
    soup = BeautifulSoup(html, "lxml")
    # images
    for img in soup.select("img"):
        src = img.get("src")
        if src:
            out["images"].append(src)
    # website (first http(s) absolute link)
    site = soup.find("a", href=lambda x: x and isinstance(x, str) and x.startswith("http"))
    if site:
        out["website"] = site.get("href")
    # description: take first meaningful paragraph
    p = soup.find("p")
    if p:
        # collapse whitespace
        desc = re.sub(r"\s+", " ", p.get_text(" ", strip=True)).strip()
        out["description"] = desc
    return out

def combine_amt_and_unit(amt_raw, unit_raw):
    if not amt_raw:
        return None
    val = str(amt_raw).strip()
    if not val or val.upper() in ("N/A", "NONE", "-", ""):
        return None
    unit = (unit_raw or "").strip()
    if unit:
        return f"{val} {unit}"
    return val

def normalize_to_final_shape(raw_attrs: dict, detail_meta: dict):
    """
    Convert sponsor-card attributes + detail page info into the final user-specified shape.
    Returns a dict (no id) matching the requested format.
    """
    name = (raw_attrs.get("name") or "").strip()
    image = raw_attrs.get("sponsor_img") or None
    alt = raw_attrs.get("sponsor_alt") or None
    contribution = raw_attrs.get("contribution") or None
    contributionAmt = combine_amt_and_unit(raw_attrs.get("contribution_amt"), raw_attrs.get("contribution_unit"))
    affiliation = raw_attrs.get("affiliation") or None
    pastInvolvement = raw_attrs.get("past_inv") or raw_attrs.get("pastInvolvement") or None
    about = detail_meta.get("description") or None
    sponsor_link = detail_meta.get("website") or raw_attrs.get("sponsor_page") or None

    obj = {
        "name": name or None,
        "image": image,
        "alt": alt,
        "contribution": contribution,
        "contributionAmt": contributionAmt,
        "affiliation": affiliation,
        "pastInvolvement": pastInvolvement,
        "about": about,
        "sponsor_link": sponsor_link,
        "type": "sponsor"
    }
    return obj

def main():
    if not SRC_MAIN.exists():
        print(f"ERROR: {SRC_MAIN} not found. Run script from repo root.")
        return

    html = SRC_MAIN.read_text(encoding="utf-8")
    soup = BeautifulSoup(html, "lxml")

    # Find all sponsor-card custom elements
    sponsor_elems = soup.find_all("sponsor-card")
    if not sponsor_elems:
        # fallback: some builds might inlined <div class="sponsor-card">, try that
        sponsor_elems = soup.select(".sponsor-card")
    if not sponsor_elems:
        print("No sponsor-card elements found in sponsors.html")
        return

    seen_names = set()
    written = []

    for elem in sponsor_elems:
        # attributes are available via .attrs or elem.get()
        raw = {k: elem.get(k) for k in elem.attrs.keys()}

        # dedupe by name (case-insensitive)
        name = (raw.get("name") or "").strip()
        if not name:
            # skip unnamed sponsor
            continue
        name_key = name.lower()
        if name_key in seen_names:
            continue
        seen_names.add(name_key)

        # attempt to read detail page (relative)
        detail_html, detail_path = read_detail_page(raw.get("sponsor_page"))
        detail_meta = parse_detail_fields(detail_html) if detail_html else {"images": [], "description": None, "website": None}

        final_obj = normalize_to_final_shape(raw, detail_meta)

        # write file - **one JSON array containing the single object**
        slug = slugify(name)
        out_path = OUT_DIR / f"sponsor_{slug}.json"
        with out_path.open("w", encoding="utf-8") as f:
            json.dump([final_obj], f, indent=2)
        written.append(out_path)
        print("WROTE:", out_path)

    print(f"\nWrote {len(written)} sponsor JSON files to {OUT_DIR.resolve()}")

if __name__ == "__main__":
    main()
