# Odin wrote this

import requests
import json
import time
import os

BASE_URL = "https://projects.propublica.org/nonprofits/api/v2"
MAX_RESULTS = 100

def fetch_image(query: str) -> str:
    try:
        encoded_query = requests.utils.quote(query)
        url = (
            f"https://www.googleapis.com/customsearch/v1?"
            f"q={encoded_query}&cx=47dcfe213c7274b68&key=AIzaSyCaX5owOlwzJq59MYdCl6lV5BKt3W3K-KE"
            f"&searchType=image&num=1"
        )
        resp = requests.get(url)
        resp.raise_for_status()
        data = resp.json()
        if data.get("items") and len(data["items"]) > 0:
            return data["items"][0]["link"]
    except Exception as e:
        print(f"Error fetching image for '{query}': {e}")
    return "N/A"

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
    if not ein:
        return "This is a nonprofit, tax exempt."
    url = f"https://projects.propublica.org/nonprofits/organizations/{ein}"
    try:
        resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
        if resp.status_code != 200:
            return "This is a nonprofit, tax exempt."
        text = resp.text
        import re
        match = re.search(r"Tax-exempt since ([A-Za-z0-9 ,]+)", text)
        if match:
            tax_str = match.group(1)
            if re.search(r"\b\d{4}\b", tax_str):
                return f"Tax-exempt since {tax_str}"
        return "This is a nonprofit, tax exempt."
    except:
        return "This is a nonprofit, tax exempt."

def scrape(q="food bank", state=None, max_results=MAX_RESULTS):
    results = []
    page = 0

    while len(results)//2 < max_results:
        search_json = fetch_search(q=q, state=state, page=page)
        orgs = search_json.get("organizations", [])
        if not orgs:
            break

        for org in orgs:
            if len(results)//2 >= max_results:
                break

            ein = org.get("ein")
            name = org.get("name", "N/A")
            city = org.get("city", "N/A")
            state_code = org.get("state", "N/A")
            website = f"https://projects.propublica.org/nonprofits/organizations/{ein}" if ein else "N/A"

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

            # Foodbank image
            foodbank_image = fetch_image(name + " logo")
            time.sleep(0.2)

            # Build a unique program name using the foodbank name
            program_name = f"{name} {' / '.join(services_list)} Program"
            # Program image (search foodbank name + "volunteer")
            program_image = fetch_image(name + " volunteer")
            time.sleep(0.2)

            # Foodbank JSON
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

            # Program JSON
            program_json = {
                "name": program_name,
                "program_type": "class" if "training" in program_name.lower() or "culinary" in program_name.lower() else "service",
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

            results.append(foodbank_json)
            results.append(program_json)

            time.sleep(0.2)

        page += 1
        if page >= search_json.get("num_pages", 0):
            break

    return results

if __name__ == "__main__":
    data = scrape(q="food bank", state=None, max_results=MAX_RESULTS)
    with open("foodbanks_programs.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ Scraped {len(data)//2} food banks and programs successfully.")
