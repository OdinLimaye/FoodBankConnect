import requests
import json
from bs4 import BeautifulSoup
from datetime import datetime
from pathlib import Path

OUT_DIR = Path("data/json_exports")
OUT_DIR.mkdir(parents=True, exist_ok=True)

def fetch_foodbanks():
    try:
        res = requests.get("http://api.foodbankconnect.me/foodbanks")
        if not res.ok:
            return []

        data = res.json()
        return [
            {
                "type": "foodbank",
                "name": fb.get("name"),
                "about": fb.get("about"),
                "address": fb.get("address"),
                "city": fb.get("city"),
                "zipcode": fb.get("zipcode"),
                "capacity": fb.get("capacity"),
                "capacity_unit": fb.get("capacity_unit"),
                "urgency": fb.get("urgency", "unknown").lower().replace(" ", "_"),
                "eligibility": fb.get("eligibility"),
                "phone": fb.get("phone"),
                "website": fb.get("website"),
                "image": fb.get("image"),
                "languages": fb.get("languages", []),
                "services": fb.get("services", []),
                "fetched_at": datetime.utcnow().isoformat() + "Z"
            }
            for fb in data
        ]
    except Exception as e:
        print(f"[foodbanks] ERROR: {e}")
        return []

def fetch_programs():
    try:
        res = requests.get("https://example.com/api/programs")
        if not res.ok:
            return []

        data = res.json()
        return [
            {
                "type": "program",
                "name": p.get("title"),
                "description": p.get("description"),
                "host": p.get("host_org"),
                "type_detail": p.get("category"),
                "frequency": p.get("frequency"),
                "eligibility": p.get("eligibility"),
                "cost": p.get("cost"),
                "image": p.get("image_url"),
                "links": {
                    "signup": p.get("signup_url"),
                    "map": p.get("map_url")
                },
                "fetched_at": datetime.utcnow().isoformat() + "Z"
            }
            for p in data
        ]
    except Exception as e:
        print(f"[programs] ERROR: {e}")
        return []

def fetch_sponsors():
    try:
        res = requests.get("https://example.com/sponsors")
        if not res.ok:
            return []

        soup = BeautifulSoup(res.text, "html.parser")
        entries = soup.select(".sponsor-entry")
        return [
            {
                "type": "sponsor",
                "name": entry.select_one("h3").text.strip(),
                "affiliation": entry.select_one(".affiliation").text.strip() if entry.select_one(".affiliation") else None,
                "contact": {
                    "website": entry.select_one("a[href]").get("href")
                },
                "media": {
                    "images": [entry.select_one("img").get("src")] if entry.select_one("img") else []
                },
                "fetched_at": datetime.utcnow().isoformat() + "Z"
            }
            for entry in entries
        ]
    except Exception as e:
        print(f"[sponsors] ERROR: {e}")
        return []

def scrape():
    all_data = []

    foodbanks = fetch_foodbanks()
    if foodbanks:
        with open(OUT_DIR / "foodbanks.json", "w") as f:
            json.dump(foodbanks, f, indent=2)
        print(f"Saved {len(foodbanks)} foodbanks")

    programs = fetch_programs()
    if programs:
        with open(OUT_DIR / "programs.json", "w") as f:
            json.dump(programs, f, indent=2)
        print(f"Saved {len(programs)} programs")

    sponsors = fetch_sponsors()
    if sponsors:
        with open(OUT_DIR / "sponsors.json", "w") as f:
            json.dump(sponsors, f, indent=2)
        print(f"Saved {len(sponsors)} sponsors")

    all_data += foodbanks + programs + sponsors
    return all_data

if __name__ == "__main__":
    all_results = scrape()
    print(f"Total entries fetched: {len(all_results)}")
