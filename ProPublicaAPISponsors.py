import requests
import json
import time
import re

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

GOOGLE_API_KEY = "AIzaSyCaX5owOlwzJq59MYdCl6lV5BKt3W3K-KE"
GOOGLE_CX = "47dcfe213c7274b68"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; DataFetcherBot/1.0; +https://example.com/bot)"
}

# ---------------------- Helpers ----------------------

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
        return "This is a nonprofit, tax exempt."
    url = f"https://projects.propublica.org/nonprofits/organizations/{ein}"
    try:
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code != 200:
            return "This is a nonprofit, tax exempt."
        match = re.search(r"Tax-exempt since ([A-Za-z0-9 ,]+)", resp.text)
        if match and re.search(r"\b\d{4}\b", match.group(1)):
            return f"Tax-exempt since {match.group(1)}"
    except Exception:
        pass
    return "This is a nonprofit, tax exempt."


def fetch_grants(ein: str) -> str:
    url = f"{BASE_URL}/organizations/{ein}.json"
    try:
        resp = requests.get(url, headers=HEADERS)
        if resp.status_code != 200:
            return "N/A"
        data = resp.json()
        filings = data.get("filings_with_data", [])
        for filing in filings:
            grants = filing.get("grants", [])
            if not grants:
                continue
            for grant in grants:
                recipient = grant.get("recipient_name", "")
                return recipient or "N/A"
    except Exception:
        pass
    return "N/A"


def fetch_logo(name: str) -> str:
    """Simple Google image fetch (no retries)."""
    if not name:
        return "N/A"
    query = f"{name} logo"
    url = (
        f"https://www.googleapis.com/customsearch/v1"
        f"?q={query}&cx={GOOGLE_CX}&key={GOOGLE_API_KEY}"
        f"&searchType=image&num=1"
    )
    try:
        resp = requests.get(url)
        if resp.status_code != 200:
            return "N/A"
        data = resp.json()
        if "items" in data and len(data["items"]) > 0:
            return data["items"][0]["link"]
    except Exception:
        pass
    return "N/A"


# ---------------------- Main Scraper ----------------------

def scrape_sponsors(max_results=MAX_RESULTS):
    all_results = []
    for keyword in KEYWORDS:
        page = 0
        while len(all_results) < max_results:
            params = {"q": keyword, "page": page}
            try:
                resp = requests.get(f"{BASE_URL}/search.json", params=params, headers=HEADERS)
                if resp.status_code != 200:
                    break
                data = resp.json()
            except Exception:
                break

            orgs = data.get("organizations", [])
            if not orgs:
                break

            for org in orgs:
                if len(all_results) >= max_results:
                    break

                name = org.get("name", "N/A")
                ein = org.get("ein", "N/A")
                city = org.get("city", "N/A")
                state_code = org.get("state", "N/A")

                # details
                try:
                    detail_resp = requests.get(f"{BASE_URL}/organizations/{ein}.json", headers=HEADERS)
                    detail_json = detail_resp.json() if detail_resp.status_code == 200 else {}
                    detail = detail_json.get("organization", {})
                except Exception:
                    detail = {}

                about = fetch_tax_exempt_date(ein)
                affiliation = classify_affiliation(name, detail)
                past_involvement = fetch_grants(ein)
                sponsor_link = f"https://projects.propublica.org/nonprofits/organizations/{ein}" if ein else "N/A"

                logo_url = fetch_logo(name)
                time.sleep(0.3)  # short sleep

                donor_json = {
                    "name": name,
                    "image": logo_url,
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

                all_results.append(donor_json)

            page += 1
            if page >= data.get("num_pages", 0):
                break
            time.sleep(0.3)

        if len(all_results) >= max_results:
            break

    return all_results


# ---------------------- Run ----------------------

if __name__ == "__main__":
    sponsors = scrape_sponsors()
    print(f"✅ Scraped {len(sponsors)} sponsors total")

    with open("sponsors.json", "w", encoding="utf-8") as f:
        json.dump(sponsors, f, indent=2, ensure_ascii=False)

    print("✅ Saved to 'sponsors.json'.")
