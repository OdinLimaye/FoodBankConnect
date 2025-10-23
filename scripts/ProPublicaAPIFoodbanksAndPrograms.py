import requests
import json
import time
import re
import random

BASE_URL = "https://projects.propublica.org/nonprofits/api/v2"
MAX_RESULTS = 100

GOOGLE_API_KEY = "AIzaSyCaX5owOlwzJq59MYdCl6lV5BKt3W3K-KE"
GOOGLE_CX = "47dcfe213c7274b68"

def fetch_google(query: str, search_type: str = None):
    """Fetch a Google Custom Search result (safe with retries and user-agent)."""
    params = {
        "q": query,
        "cx": GOOGLE_CX,
        "key": GOOGLE_API_KEY,
        "num": 1
    }
    if search_type == "image":
        params["searchType"] = "image"

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/122.0.0.0 Safari/537.36"
        )
    }

    for attempt in range(3):  # Retry up to 3 times
        try:
            time.sleep(1.5 + random.uniform(0.3, 0.8))  # Randomized delay
            resp = requests.get("https://www.googleapis.com/customsearch/v1", params=params, headers=headers, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            if "items" in data and len(data["items"]) > 0:
                return data["items"][0]["link"]
            return "N/A"
        except requests.exceptions.RequestException as e:
            print(f"[Attempt {attempt+1}/3] Google fetch failed for '{query}': {e}")
            time.sleep(2 ** attempt)  # exponential backoff
    return "N/A"

def fetch_search(q="food bank", state=None, page=0):
    url = f"{BASE_URL}/search.json"
    params = {"q": q, "page": page}
    if state:
        params["state[id]"] = state
    resp = requests.get(url, params=params, headers={"User-Agent": "Mozilla/5.0"})
    resp.raise_for_status()
    return resp.json()

def fetch_organization(ein: str):
    url = f"{BASE_URL}/organizations/{ein}.json"
    resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    if resp.status_code != 200:
        return None
    return resp.json()

def infer_services(text):
    text = text.lower()
    services = []
    if "nutrition" in text:
        services.append("Nutrition Education")
    if "meal" in text or "food" in text or "pantry" in text:
        services.append("Emergency Food Assistance")
    if "training" in text or "culinary" in text:
        services.append("Culinary Training Program")
    if "snap" in text:
        services.append("SNAP Outreach")
    if not services:
        services.append("Food Distribution")
    return services

def fetch_tax_exempt_date(ein: str):
    """Scrape the ProPublica page for tax-exempt info."""
    if not ein:
        return "This is a nonprofit, tax exempt."
    url = f"https://projects.propublica.org/nonprofits/organizations/{ein}"
    try:
        resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
        if resp.status_code != 200:
            return "This is a nonprofit, tax exempt."
        text = resp.text
        match = re.search(r"Tax-exempt since ([A-Za-z0-9 ,]+)", text)
        if match:
            tax_str = match.group(1)
            if re.search(r"\b\d{4}\b", tax_str):
                return f"Tax-exempt since {tax_str}"
        return "This is a nonprofit, tax exempt."
    except Exception:
        return "This is a nonprofit, tax exempt."

def scrape(q="food bank", state=None, max_results=MAX_RESULTS):
    """Fetches foodbanks and their related programs, returns one combined list."""
    combined = []
    page = 0

    while len(combined) < 2 * max_results:  # since each org adds 2 entries
        search_json = fetch_search(q=q, state=state, page=page)
        orgs = search_json.get("organizations", [])
        if not orgs:
            break

        for org in orgs:
            if len(combined) >= 2 * max_results:
                break

            ein = org.get("ein")
            name = org.get("name", "N/A")
            city = org.get("city", "N/A")
            state_code = org.get("state", "N/A")

            detail = fetch_organization(ein)
            if detail and "organization" in detail:
                org_detail = detail["organization"]
                about = fetch_tax_exempt_date(ein)
                zipcode = org_detail.get("zipcode") or org_detail.get("zip") or "N/A"
                phone = org_detail.get("telephone") or org_detail.get("phone") or "N/A"
            else:
                about = "This is a nonprofit, tax exempt."
                zipcode = "N/A"
                phone = "N/A"

            services_list = infer_services(about)

            # ✅ Safe Google fetch
            foodbank_image = fetch_google(f"{name} logo", search_type="image")
            program_image = fetch_google(f"{name} volunteer", search_type="image")

            propublica_url = f"https://projects.propublica.org/nonprofits/organizations/{ein}"
            program_name = f"{name} {' / '.join(services_list)} Program"

            # Foodbank entry
            foodbank_json = {
                "about": about,
                "capacity": "N/A",
                "city": city,
                "state": state_code,
                "eligibility": "N/A",
                "image": foodbank_image,
                "languages": ["English"],
                "name": name,
                "phone": phone,
                "services": [program_name],
                "type": "foodbank",
                "urgency": "High",
                "website": propublica_url,
                "zipcode": zipcode
            }

            # Program entry
            program_json = {
                "name": program_name,
                "program_type": "class" if "training" in program_name.lower() or "culinary" in program_name.lower() else "service",
                "eligibility": "N/A",
                "frequency": "Weekly",
                "cost": "Free",
                "host": name,
                "detailsPage": program_name.replace(" ", "-").lower(),
                "about": about,
                "sign_up_link": propublica_url,
                "type": "program",
                "image": program_image
            }

            combined.extend([foodbank_json, program_json])

        page += 1
        if page >= search_json.get("num_pages", 0):
            break

    return combined

if __name__ == "__main__":
    results = scrape()
    print(f"✅ Retrieved {len(results)} total entries (foodbanks + programs).")
