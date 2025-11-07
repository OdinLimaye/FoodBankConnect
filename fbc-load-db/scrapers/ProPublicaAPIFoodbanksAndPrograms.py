import requests
import json
import re
import time

BASE_URL = "https://projects.propublica.org/nonprofits/api/v2"
MAX_RESULTS = 5

GOOGLE_API_KEY = "AIzaSyCaX5owOlwzJq59MYdCl6lV5BKt3W3K-KE"
GOOGLE_CX = "47dcfe213c7274b68"


def tiny_delay():
    """Small pause before every request."""
    time.sleep(0.25)  # 250 ms delay


# -------------------------------
# GOOGLE SEARCH HELPERS
# -------------------------------

def fetch_google_image(query: str):
    """Return the first clean Google image result, skipping lookasides."""
    tiny_delay()
    params = {
        "q": query,
        "cx": GOOGLE_CX,
        "key": GOOGLE_API_KEY,
        "num": 10,                 # fetch more results to filter
        "searchType": "image"
    }

    resp = requests.get("https://www.googleapis.com/customsearch/v1", params=params)
    data = resp.json()

    if "items" not in data or not data["items"]:
        return "N/A"

    clean_exts = (".jpg", ".jpeg", ".png", ".gif", ".webp")

    # ✅ 1. Scan for clean images
    for item in data["items"]:
        link = item.get("link", "")
        if isinstance(link, str) and link.lower().endswith(clean_exts):
            return link

    # ✅ 2. If no clean images found, return first result anyway
    return data["items"][0].get("link", "N/A")



def fetch_google_website(query: str):
    """Return first Google web result (not image)."""
    tiny_delay()
    params = {
        "q": query,
        "cx": GOOGLE_CX,
        "key": GOOGLE_API_KEY,
        "num": 1
    }
    resp = requests.get("https://www.googleapis.com/customsearch/v1", params=params)
    data = resp.json()
    if "items" in data and data["items"]:
        return data["items"][0]["link"]
    return "N/A"


# -------------------------------
# PROPUBLICA HELPERS
# -------------------------------

def fetch_search(q="food bank", state=None, page=0):
    """Search nonprofits from ProPublica."""
    tiny_delay()
    url = f"{BASE_URL}/search.json"
    params = {"q": q, "page": page}
    if state:
        params["state[id]"] = state
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    return resp.json()


def fetch_organization(ein: str):
    """Fetch detailed org data from ProPublica."""
    tiny_delay()
    url = f"{BASE_URL}/organizations/{ein}.json"
    resp = requests.get(url)
    if resp.status_code != 200:
        return None
    return resp.json()


def infer_services(text):
    """Infer service types from description text."""
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
    """Scrape ProPublica page for tax-exempt date."""
    tiny_delay()

    if not ein:
        return "This is a nonprofit, tax exempt."

    url = f"https://projects.propublica.org/nonprofits/organizations/{ein}"

    try:
        resp = requests.get(url)
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


# -------------------------------
# MAIN SCRAPER
# -------------------------------

def scrape(q="food bank", state=None, max_results=MAX_RESULTS):
    """Main scraper: fetch food banks + program entries."""
    combined = []
    page = 0

    while len(combined) < 2 * max_results:
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
                zipcode = org_detail.get("zipcode") or org_detail.get("zip") or "N/A"
                phone = org_detail.get("telephone") or org_detail.get("phone") or "N/A"
            else:
                zipcode = "N/A"
                phone = "N/A"

            # About: always tax-exempt info
            about = fetch_tax_exempt_date(ein)

            services_list = infer_services(about)
            program_name = f"{name} {' / '.join(services_list)} Program"

            # ---------------------------
            # GOOGLE SEARCH (ONLY 2 CALLS)
            # ---------------------------

            # 1. IMAGE for foodbank + program
            foodbank_image = fetch_google_image(f"{name} food bank")
            program_image = foodbank_image

            # 2. WEBSITE from first Google result
            website = fetch_google_website(name)

            # ---------------------------
            # ASSEMBLE JSON OBJECTS
            # ---------------------------

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
                "website": website,
                "zipcode": zipcode
            }

            # Program entry
            program_json = {
                "name": program_name,
                "program_type": (
                    "class"
                    if "training" in program_name.lower()
                    or "culinary" in program_name.lower()
                    else "service"
                ),
                "eligibility": "N/A",
                "frequency": "Weekly",
                "cost": "Free",
                "host": name,
                "detailsPage": program_name.replace(" ", "-").lower(),
                "about": about,
                "sign_up_link": website,
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

    # --- DEBUG OUTPUT ---
    """
    temp_path = "debug_output.json"
    with open(temp_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"📝 Debug file written to {temp_path}")
    """

