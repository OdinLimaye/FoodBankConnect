import requests
import json
import time
import re
from bs4 import BeautifulSoup

BASE_URL = "https://projects.propublica.org/nonprofits/api/v2"
MAX_RESULTS = 100

KEYWORDS = [
    "foundation",
    "philanthropy",
    "grant",
    "donor",
    "charity",
    "food donation",
    "corporate giving"
]

FOOD_RELATED_KEYWORDS = [
    "food bank",
    "pantry",
    "hunger",
    "meals",
    "feeding",
    "nutrition",
    "soup kitchen",
    "food insecurity"
]

GOOGLE_API_KEY = "AIzaSyCaX5owOlwzJq59MYdCl6lV5BKt3W3K-KE"
GOOGLE_CX = "47dcfe213c7274b68"

ABOUT_KEYWORDS = [
    "about",
    "mission",
    "our story",
    "vision",
    "who we are",
    "history",
    "community",
    "support"
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; DataFetcherBot/1.0; +https://example.com/bot)"
}

# -------------------------------------------------
# Small Delay
# -------------------------------------------------
def tiny_delay():
    time.sleep(0.25)


# -------------------------------------------------
# Google Helpers
# -------------------------------------------------
def fetch_google_website(query: str) -> str:
    """Return first Google web result (not image)."""
    tiny_delay()
    params = {"q": query, "cx": GOOGLE_CX, "key": GOOGLE_API_KEY, "num": 1}
    resp = requests.get("https://www.googleapis.com/customsearch/v1", params=params)
    data = resp.json()
    if "items" in data and data["items"]:
        return data["items"][0]["link"]
    return None


def fetch_google_description(query: str) -> str:
    """Return snippet from Google search result as fallback."""
    tiny_delay()
    params = {"q": query, "cx": GOOGLE_CX, "key": GOOGLE_API_KEY, "num": 1}
    resp = requests.get("https://www.googleapis.com/customsearch/v1", params=params)
    data = resp.json()
    if "items" in data and data["items"]:
        return data["items"][0].get("snippet", "")
    return None


def fetch_logo(name: str) -> str:
    """Fetch a clean Google image result."""
    if not name:
        return "N/A"
    tiny_delay()
    params = {
        "q": f"{name} logo",
        "cx": GOOGLE_CX,
        "key": GOOGLE_API_KEY,
        "searchType": "image",
        "num": 10
    }
    resp = requests.get("https://www.googleapis.com/customsearch/v1", params=params)
    try:
        items = resp.json().get("items", [])
        if not items:
            return "N/A"
        clean_exts = (".jpg", ".jpeg", ".png", ".gif", ".webp")
        for item in items:
            link = item.get("link", "")
            if isinstance(link, str) and link.lower().endswith(clean_exts):
                return link
        return items[0].get("link", "N/A")
    except Exception:
        return "N/A"


# -------------------------------------------------
# BeautifulSoup About Scraping
# -------------------------------------------------
def extract_about_from_url(url: str) -> str:
    """Extract meaningful about text from a page, avoiding JS-heavy tags."""
    if not url:
        return None
    try:
        tiny_delay()
        resp = requests.get(url, headers=HEADERS, timeout=8)
        if resp.status_code != 200:
            return None
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style", "noscript", "svg", "footer", "header", "nav"]):
            tag.decompose()

        # 1. Try headers
        for header in soup.find_all(["h1","h2","h3","h4"]):
            text = header.get_text(" ", strip=True)
            if any(kw in text.lower() for kw in ABOUT_KEYWORDS):
                collected = []
                for sib in header.find_next_siblings():
                    sib_text = sib.get_text(" ", strip=True)
                    if len(sib_text) > 40:
                        collected.append(sib_text)
                    if len(" ".join(collected)) > 300:
                        break
                if collected:
                    return " ".join(collected)

        # 2. Paragraph-like text blocks
        candidates = []
        for tag in soup.find_all(["p","div","span"]):
            text = tag.get_text(" ", strip=True)
            if len(text) < 40 or any(x in text.lower() for x in ["cookie","privacy","terms"]):
                continue
            candidates.append(text)
        if candidates:
            candidates.sort(key=len, reverse=True)
            return candidates[0]

        # 3. Meta description
        desc = soup.find("meta", attrs={"name": "description"})
        if desc and desc.get("content"):
            return desc["content"]

        return None
    except Exception:
        return None


def extract_about_section(website: str, org_name: str) -> str:
    """Try /about, /aboutus, then Google snippet fallback."""
    if not website:
        return fetch_google_description(org_name) or "This organization provides food assistance and community support."

    base = website.rstrip("/")
    for sub in ["/about", "/aboutus"]:
        text = extract_about_from_url(base + sub)
        if text and len(text) > 40:
            return text

    # Homepage headers/paragraphs skipped; go straight to Google snippet
    snippet = fetch_google_description(org_name)
    return snippet or "This organization provides food assistance and community support."


# -------------------------------------------------
# ProPublica Helpers
# -------------------------------------------------
def classify_affiliation(name: str, org_detail: dict = None) -> str:
    corp_terms = ["INC", "LLC", "CORP", "COMPANY", "CO.", "LTD", "CORPORATION"]
    if any(term in name.upper() for term in corp_terms):
        return "Private Corporation"
    if org_detail:
        ntype = org_detail.get("organization_type") or org_detail.get("ntee_code") or ""
        if ntype:
            return f"Nonprofit Foundation ({ntype})"
    return "Nonprofit Foundation"


def fetch_tax_exempt_date(ein: str) -> str:
    if not ein:
        return "This is a nonprofit, tax exempt organization."
    tiny_delay()
    url = f"https://projects.propublica.org/nonprofits/organizations/{ein}"
    resp = requests.get(url, headers=HEADERS)
    if resp.status_code != 200:
        return "This is a nonprofit, tax exempt organization."
    match = re.search(r"Tax-exempt since ([A-Za-z0-9 ,]+)", resp.text)
    if match:
        date = match.group(1)
        if re.search(r"\b\d{4}\b", date):
            return f"Tax-exempt since {date}"
    return "This is a nonprofit, tax exempt organization."


def fetch_grants(ein: str) -> str:
    tiny_delay()
    url = f"{BASE_URL}/organizations/{ein}.json"
    resp = requests.get(url, headers=HEADERS)
    if resp.status_code != 200:
        return "N/A"
    try:
        data = resp.json()
        filings = data.get("filings_with_data", [])
        for filing in filings:
            grants = filing.get("grants", [])
            if not grants:
                continue
            for g in grants:
                rname = g.get("recipient_name", "")
                if any(word in rname.lower() for word in FOOD_RELATED_KEYWORDS):
                    return rname
            return grants[0].get("recipient_name", "N/A")
    except Exception:
        return "N/A"
    return "N/A"


# -------------------------------------------------
# Main Scraper
# -------------------------------------------------
def scrape(max_results=MAX_RESULTS):
    print("Scraping for sponsors now.")
    out = []

    for keyword in KEYWORDS:
        page = 0
        while len(out) < max_results:
            tiny_delay()
            params = {"q": keyword, "page": page}
            resp = requests.get(f"{BASE_URL}/search.json", params=params, headers=HEADERS)
            if resp.status_code != 200:
                break

            data = resp.json()
            orgs = data.get("organizations", [])
            if not orgs:
                break

            for org in orgs:
                if len(out) >= max_results:
                    break

                name = org.get("name", "N/A")
                ein = org.get("ein", "N/A")
                city = org.get("city", "N/A")
                state_code = org.get("state", "N/A")

                tiny_delay()
                detail_resp = requests.get(f"{BASE_URL}/organizations/{ein}.json", headers=HEADERS)
                detail_json = detail_resp.json() if detail_resp.status_code == 200 else {}
                detail = detail_json.get("organization", {})

                # -------------------
                # Website + About
                # -------------------
                website = fetch_google_website(name)
                about = extract_about_section(website, name)

                # Use Google URL as sponsor_link
                sponsor_link = website or f"https://projects.propublica.org/nonprofits/organizations/{ein}"

                affiliation = classify_affiliation(name, detail)
                past_involvement = fetch_grants(ein)

                logo = fetch_logo(name)

                donor_json = {
                    "name": name,
                    "image": logo,
                    "alt": f"{name} Logo",
                    "contribution": "Donations / Grants",
                    "contributionAmt": "N/A",
                    "affiliation": affiliation,
                    "pastInvolvement": past_involvement,
                    "about": about,
                    "sponsor_link": sponsor_link,
                    "type": "sponsor",
                    "city": city,
                    "state": state_code,
                    "EIN": str(ein)
                }

                out.append(donor_json)

            page += 1
            if page >= data.get("num_pages", 0):
                break

    return out


# -------------------------------------------------
# Entry Point
# -------------------------------------------------
if __name__ == "__main__":
    sponsors = scrape()
    print(f"✅ Scraped {len(sponsors)} sponsors total")

    """
    debug_path = "sponsor_debug_output.json"
    with open(debug_path, "w", encoding="utf-8") as f:
        json.dump(sponsors, f, indent=2, ensure_ascii=False)

    print(f"📝 Debug file written to {debug_path}")
    """
