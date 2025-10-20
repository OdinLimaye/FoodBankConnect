import requests
import json
import time

BASE_URL = "https://projects.propublica.org/nonprofits/api/v2"

def fetch_search(q="food bank", state=None, page=0):
    url = f"{BASE_URL}/search.json"
    params = {"q": q, "page": page}
    if state:
        params["state[id]"] = state
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    return resp.json()

def fetch_organization(ein: str):
    url = f"{BASE_URL}/organizations/{ein}.json"
    resp = requests.get(url)
    if resp.status_code != 200:
        return None
    return resp.json()

def infer_services(text):
    """
    Infer services based on keywords in the about/mission text.
    """
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

def scrape(q="food bank", state=None, max_results=100):
    """
    Returns a list of JSON objects formatted for the FoodBank schema.
    Automatically fetches pages until max_results or API runs out.
    Missing fields are filled with 'N/A'.
    """
    results = []
    page = 0

    while len(results) < max_results:
        search_json = fetch_search(q=q, state=state, page=page)
        orgs = search_json.get("organizations", [])
        if not orgs:
            break

        for org in orgs:
            if len(results) >= max_results:
                break

            ein = org.get("ein")
            name = org.get("name", "N/A")
            city = org.get("city", "N/A")
            website = org.get("website", "N/A")

            detail = fetch_organization(ein)
            if detail and "organization" in detail:
                org_detail = detail["organization"]
                about = (
                    org_detail.get("mission")
                    or org_detail.get("ntee_description")
                    or org_detail.get("purpose")
                    or "N/A"
                )
                address = org_detail.get("street", "N/A")
                zipcode = org_detail.get("zipcode", "N/A")
                phone = org_detail.get("telephone") or org_detail.get("phone") or "N/A"
            else:
                about = "N/A"
                address = "N/A"
                zipcode = "N/A"
                phone = "N/A"

            services = infer_services(about)

            foodbank_json = {
                "about": about,
                "address": address,
                "capacity": "N/A",
                "city": city,
                "eligibility": "N/A",
                "image": "N/A",
                "languages": ["English"],
                "name": name,
                "phone": phone,
                "services": services,
                "type": "foodbank",
                "urgency": "High",
                "website": website if website else "N/A",
                "zipcode": zipcode
            }

            results.append(foodbank_json)
            time.sleep(0.2)  # polite pause

        page += 1
        if page >= search_json.get("num_pages", 0):
            break

    return results

if __name__ == "__main__":
    # Example usage: fetch Texas food banks, up to 100 results
    data = scrape(q="food bank", state="TX", max_results=100)
    print(f"✅ Scraped {len(data)} food banks successfully.")
