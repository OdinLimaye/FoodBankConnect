# scripts/parse_foodbanks_and_details.py
"""
Run:
    python3 scripts/parse_foodbanks_html.py
"""

import re
import json
from pathlib import Path
from datetime import datetime
from bs4 import BeautifulSoup

ROOT = Path.cwd()
SRC_MAIN = ROOT / "public" / "foodbanks" / "foodbanks.html"
DETAILS_DIR = ROOT / "public" / "foodbanks"
OUT_DIR = ROOT / "data" / "normalized"
OUT_DIR.mkdir(parents=True, exist_ok=True)

PHONE_RE = re.compile(r"(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}")
CAPACITY_MEALS_RE = re.compile(r"([\d,]+)\s*meals", re.I)

URGENCY_MAP = {
    "very high": "Very High",
    "very_high": "Very High",
    "high": "High",
    "medium": "Medium",
    "med": "Medium",
    "low": "Low",
    "unknown": "Unknown"
}

SITE_IMG_BASE = "https://foodbankconnect.me"  # used to convert local image paths to absolute if needed

def slugify(text: str) -> str:
    s = (text or "").lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "foodbank"

def canonicalize_urgency(raw):
    if not raw:
        return "Unknown"
    s = raw.strip().lower().replace("_", " ").replace("-", " ")
    return URGENCY_MAP.get(s, raw.strip())

def parse_lat_lng_from_maps_src(src):
    if not src:
        return None, None
    m2 = re.search(r"!2d([-0-9\.]+)!3d([-0-9\.]+)", src)
    if m2:
        lng = float(m2.group(1)); lat = float(m2.group(2)); return lat, lng
    m3 = re.search(r"!3d([-0-9\.]+)!2d([-0-9\.]+)", src)
    if m3:
        lat = float(m3.group(1)); lng = float(m3.group(2)); return lat, lng
    mq = re.search(r"[?&]q=([-0-9\.]+),([-0-9\.]+)", src)
    if mq:
        return float(mq.group(1)), float(mq.group(2))
    return None, None

def extract_card_fields(card_soup):
    data = {}
    h5 = card_soup.select_one(".card-title")
    data["name"] = h5.get_text(strip=True) if h5 else "Unknown"

    p = card_soup.select_one(".card-text")
    text_lines = []
    if p:
        for br in p.find_all("br"):
            br.replace_with("\n")
        text = p.get_text("\n", strip=True)
        text_lines = [line.strip() for line in text.splitlines() if line.strip()]

    for line in text_lines:
        low = line.lower()
        if low.startswith("address:"):
            data["address"] = line.split(":",1)[1].strip()
        elif low.startswith("city:"):
            data["city"] = line.split(":",1)[1].strip()
        elif low.startswith("zip") or low.startswith("zip code:"):
            data["zip"] = line.split(":",1)[1].strip() if ":" in line else line.split()[-1]
        elif low.startswith("capacity:"):
            raw = line.split(":",1)[1].strip()
            data["capacity_raw"] = raw
            m = CAPACITY_MEALS_RE.search(raw.replace("~",""))
            if m:
                try:
                    data["meals_per_week"] = int(m.group(1).replace(",",""))
                except Exception:
                    data["meals_per_week"] = None
        elif low.startswith("hours:"):
            data["hours"] = line.split(":",1)[1].strip()
        elif low.startswith("urgency:"):
            data["urgency"] = line.split(":",1)[1].strip()

    # details link (relative)
    a = card_soup.find("a", href=True, string=re.compile(r"View Details", re.I))
    if a:
        data["details_link"] = a["href"]

    iframe = card_soup.find("iframe")
    if iframe and iframe.get("src"):
        data["map_src"] = iframe.get("src")
        lat, lng = parse_lat_lng_from_maps_src(data["map_src"])
        if lat is not None and lng is not None:
            data["lat"] = lat
            data["lng"] = lng

    return data

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
    Return {phone, email, images[], programs[], description, website, languages[], eligibility}
    Best-effort heuristics.
    """
    out = {"phone": None, "email": None, "images": [], "programs": [], "description": None, "website": None, "languages": [], "eligibility": None}
    if not html:
        return out
    soup = BeautifulSoup(html, "lxml")

    # phone
    tel = soup.find("a", href=lambda x: x and isinstance(x, str) and x.startswith("tel:"))
    if tel:
        out["phone"] = tel.get_text(strip=True)
    else:
        txt = soup.get_text(" ", strip=True)
        m = PHONE_RE.search(txt)
        if m:
            out["phone"] = m.group(0)

    # email
    mail = soup.find("a", href=lambda x: x and isinstance(x, str) and x.startswith("mailto:"))
    if mail:
        out["email"] = mail.get("href").split(":",1)[1].split("?")[0]
    else:
        m = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", soup.get_text(" ", strip=True))
        if m:
            out["email"] = m.group(0)

    # images (keep order)
    for img in soup.select("img"):
        src = img.get("src")
        if src:
            out["images"].append(src)

    # website: first absolute http(s) link
    site = soup.find("a", href=lambda x: x and isinstance(x, str) and x.startswith("http"))
    if site:
        out["website"] = site.get("href")

    # programs/services detection: headings or lists containing program/service/volunteer
    for header in soup.find_all(re.compile("^h[1-6]$")):
        htxt = header.get_text(" ", strip=True).lower()
        if "program" in htxt or "service" in htxt or "volunteer" in htxt:
            next_el = header.find_next_sibling()
            if next_el:
                if next_el.name in ("ul","ol"):
                    items = [li.get_text(" ", strip=True) for li in next_el.find_all("li")]
                    out["programs"].extend(items)
                elif next_el.name == "p":
                    out["programs"].append(next_el.get_text(" ", strip=True))
    lists = soup.select("ul.programs, ul#programs, div.programs ul")
    for l in lists:
        out["programs"].extend([li.get_text(" ", strip=True) for li in l.find_all("li")])

    # languages: look for explicit language list or 'English, Spanish' pattern
    text_all = soup.get_text(" ", strip=True)
    lang_match = re.search(r"(Languages|Available in):\s*([A-Za-z,\s]+)", text_all, re.I)
    if lang_match:
        langs = [l.strip() for l in lang_match.group(2).split(",") if l.strip()]
        out["languages"] = langs
    else:
        # fallback: search for common languages in page
        langs = []
        for candidate in ["English", "Spanish"]:
            if re.search(r"\b" + re.escape(candidate) + r"\b", text_all):
                langs.append(candidate)
        out["languages"] = langs

    # eligibility: heuristic search for "ID" or "income" or "no ID"
    eli = None
    m_eli = re.search(r"(No ID required[^.]*|ID required[^.]*|income (guidelines|based)[^.]*)", text_all, re.I)
    if m_eli:
        eli = m_eli.group(0).strip()
    out["eligibility"] = eli

    # description: first meaningful paragraph
    p = soup.find("p")
    if p:
        out["description"] = re.sub(r"\s+", " ", p.get_text(" ", strip=True)).strip()

    return out

def normalize_foodbank(raw, detail_meta, detail_path):
    name = raw.get("name") or "Unknown Food Bank"
    # capacity: prefer parsed meals_per_week if present, else raw string
    cap = None
    if raw.get("meals_per_week"):
        cap = f"{raw['meals_per_week']} meals/week"
    elif raw.get("capacity_raw"):
        cap = raw.get("capacity_raw")
    else:
        cap = None

    # phone/email from detail page
    phone = detail_meta.get("phone")
    email = detail_meta.get("email")

    # services: programs list from detail page
    services = detail_meta.get("programs") or []

    # about from detail description
    about = detail_meta.get("description") or None

    # website: prefer absolute website from detail, else relative details_link if present
    website = detail_meta.get("website") or (raw.get("details_link") or None)

    # image: prefer first absolute image from detail_meta, else try to map first local image to SITE_IMG_BASE
    image = None
    for img in detail_meta.get("images", []):
        if isinstance(img, str) and img.startswith("http"):
            image = img
            break
    if not image:
        # try to map a local image (../images/whatever.jpg) to SITE_IMG_BASE + path
        if detail_meta.get("images"):
            first = detail_meta["images"][0]
            if isinstance(first, str):
                p = first.lstrip("./")
                image = SITE_IMG_BASE + "/" + p.lstrip("/")
    # city and zipcode
    city = raw.get("city")
    zipcode = raw.get("zip") or raw.get("zipcode") or None

    obj = {
        "about": about,
        "address": raw.get("address"),
        "capacity": cap,
        "city": city,
        "eligibility": detail_meta.get("eligibility") or raw.get("eligibility") or None,
        "image": image,
        "languages": detail_meta.get("languages") or [],
        "name": name,
        "phone": phone,
        "services": services,
        "type": "foodbank",
        "urgency": canonicalize_urgency(raw.get("urgency")),
        "website": website,
        "zipcode": zipcode
    }
    return obj

def main():
    if not SRC_MAIN.exists():
        print(f"ERROR: {SRC_MAIN} not found. Run script from repo root.")
        return

    html = SRC_MAIN.read_text(encoding="utf-8")
    soup = BeautifulSoup(html, "lxml")

    cards = soup.select(".row.g-4 .card")
    if not cards:
        print("No cards found.")
        return

    written = []
    for card in cards:
        raw = extract_card_fields(card)
        details_href = raw.get("details_link")
        detail_html, detail_path = read_detail_page(details_href) if details_href else (None, None)
        detail_meta = parse_detail_fields(detail_html) if detail_html else {"phone":None,"email":None,"images":[], "programs":[], "description": None, "website": None, "languages": [], "eligibility": None}
        normalized = normalize_foodbank(raw, detail_meta, detail_path)

        # deterministic filename: foodbank_<slug>.json
        slug = slugify(normalized.get("name") or raw.get("address") or details_href or "foodbank")
        out_path = OUT_DIR / f"foodbank_{slug}.json"
        with out_path.open("w", encoding="utf-8") as f:
            json.dump(normalized, f, indent=2)
        print("WROTE:", out_path)
        written.append(out_path)

    print(f"\nWrote {len(written)} normalized JSON files to {OUT_DIR.resolve()}")

if __name__ == "__main__":
    main()
