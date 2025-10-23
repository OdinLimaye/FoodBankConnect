import requests
import json
import time
import re

BASE_URL = "https://projects.propublica.org/nonprofits/api/v2"
MAX_RESULTS = 3

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


def safe_request(url, params=None, max_retries=3, sleep_base=2):
    """Perform GET with retries, backoff, and safe timeout."""
    for attempt in range(1, max_retries + 1):
        try:
            resp = requests.get(url, params=params, headers=HEADERS, timeout=15)
            if resp.status_code == 429:
                wait = sleep_base * attempt
                print(f"⚠️ Rate limited on {url}, sleeping {wait}s...")
                time.sleep(wait)
                continue
            resp.raise_for_status()
            return resp
        except (requests.exceptions.RequestException, ConnectionResetError) as e:
            wait = sleep_base * attempt
            print(f"Attempt {attempt} failed for {url}: {e}. Retrying in {wait}s...")
            time.sleep(wait)
    print(f"❌ Failed to fetch after {max_retries} attempts: {url}")
    return None


def fetch_logo(name: str) -> str:
    """Safely fetch first image URL from Google Custom Search."""
    if not name:
        return "N/A"

    query = f"{name} logo"
    url = (
        f"https://www.googleapis.com/customsearch/v1"
        f"?q={query}&cx={GOOGLE_CX}&key={GOOGLE_API_KEY}"
        f"&searchType=image&num=1"
    )

    resp = safe_request(url)
    if not resp:
        return "N/A"

    try:
        data = resp.json()
        if "items" in data and len(data["items"]) > 0:
            return data["items"][0]["link"]
    except Exception as e:
        print(f"Error parsing Google response for '{name}': {e}")

    return "N/A"


def fetch_tax_exempt_date(ein: str) -> str:
    """Return 'Tax-exempt since YYYY' from ProPublica EIN page."""
    if not ein:
        return "This is a nonprofit, tax exempt."

    url = f"https://projects.propublica.org/nonprofits/organizations/{ein}"
    resp = safe_request(url)
    if not resp:
        return "This is a nonprofit, tax exempt."

    match = re.search(r"Tax-exempt since ([A-Za-z0-9 ,]+)", resp.text)
    if match:
        tax_str = match.group(1)
        if re.search(r"\b\d{4}\b", tax_str):
            return f"Tax-exempt since {tax_str}"
    return "This is a nonprofit, tax exempt."


def fetch_grants(ein: str) -> str:
    """Get first relevant grant recipient."""
    url = f"{BASE_URL}/organizations/{ein}.json"
    resp = safe_request(url)
    if not resp:
        return "N/A"

    try:
        data = resp.json()
        filings = data.get("filings_with_data", [])
        for filing in filings:
            grants = filing.get("grants", [])
            if not grants:
                continue
            for grant in grants:
                recipient = grant.get("recipient_name", "")
                if any(keyword in recipient.lower() for keyword in FOOD_RELATED_KEYWORDS):
                    return recipient
            return grants[0].get("recipient_name", "N/A")
    except Exception as e:
        print(f"Error parsing grants for EIN {ein}: {e}")
    return "N/A"


# ---------------------- Main Scraper ----------------------

def scrape(max_results=MAX_RESULTS):
    all_results = []
    for keyword in KEYWORDS:
        page = 0
        while len(all_results) < max_results:
            params = {"q": keyword, "page": page}
            resp = safe_request(f"{BASE_URL}/search.json", params=params)
            if not resp:
                break

            data = resp.json()
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
                detail_resp = safe_request(f"{BASE_URL}/organizations/{ein}.json")
                detail_json = detail_resp.json() if detail_resp else {}
                detail = detail_json.get("organization", {})

                about = fetch_tax_exempt_date(ein)
                affiliation = classify_affiliation(name, detail)
                past_involvement = fetch_grants(ein)
                sponsor_link = f"https://projects.propublica.org/nonprofits/organizations/{ein}" if ein else "N/A"

                logo_url = fetch_logo(name)
                time.sleep(1.5)  # prevent Google rate limits

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
            time.sleep(1)

        if len(all_results) >= max_results:
            break

    return all_results


# ---------------------- Run ----------------------

if __name__ == "__main__":
    donors = scrape()
    print(f"✅ Scraped {len(donors)} donors total")
