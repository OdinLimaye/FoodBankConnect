import requests
import json
import time

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

# Common keywords to recognize food-related recipients
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


def classify_affiliation(name: str) -> str:
    """Classify whether an organization is likely a private corporation or a nonprofit."""
    corp_terms = ["INC", "LLC", "CORP", "COMPANY", "CO.", "LTD", "CORPORATION"]
    if any(term in name.upper() for term in corp_terms):
        return "Private Corporation"
    return "Nonprofit Foundation"


def fetch_grants(ein: str) -> str:
    """
    Fetch the first food-related grant recipient (if any) from an organization's filings.
    Falls back to first grant if no food-related one is found.
    """
    url = f"{BASE_URL}/organizations/{ein}.json"
    resp = requests.get(url)
    if resp.status_code != 200:
        return "N/A"
    data = resp.json()

    filings = data.get("filings_with_data", [])
    for filing in filings:
        grants = filing.get("grants", [])
        if not grants:
            continue

        # Try to find a food-related recipient
        for grant in grants:
            recipient = grant.get("recipient_name", "")
            if any(keyword in recipient.lower() for keyword in FOOD_RELATED_KEYWORDS):
                return recipient

        # Otherwise fall back to the first grant recipient
        first_recipient = grants[0].get("recipient_name", "N/A")
        if first_recipient:
            return first_recipient

    return "N/A"


def scrape(max_results=MAX_RESULTS):
    """
    Returns a list of sponsor JSON objects formatted for the database.
    Automatically searches for donor-related organizations.
    """
    all_results = []
    for keyword in KEYWORDS:
        page = 0
        while len(all_results) < max_results:
            params = {"q": keyword, "page": page}
            response = requests.get(f"{BASE_URL}/search.json", params=params)
            if response.status_code != 200:
                break

            data = response.json()
            orgs = data.get("organizations", [])
            if not orgs:
                break

            for org in orgs:
                if len(all_results) >= max_results:
                    break

                name = org.get("name", "N/A")
                ein = org.get("ein", "")
                about = org.get("mission", "N/A")
                affiliation = classify_affiliation(name)
                past_involvement = fetch_grants(ein) if ein else "N/A"

                donor_json = {
                    "name": name,
                    "image": "N/A",
                    "alt": f"{name} Logo",
                    "contribution": "Donations / Grants",
                    "contributionAmt": "N/A",
                    "affiliation": affiliation,
                    "pastInvolvement": past_involvement,
                    "about": about,
                    "sponsor_link": f"https://projects.propublica.org/nonprofits/organizations/{ein}" if ein else "N/A",
                    "type": "sponsor"
                }

                all_results.append(donor_json)
                time.sleep(0.3)  # polite delay per org

            page += 1
            if page >= data.get("num_pages", 0):
                break

            time.sleep(0.5)  # polite delay per page

        if len(all_results) >= max_results:
            break

    return all_results


if __name__ == "__main__":
    # When run directly, just return the list for database insertion
    donors = scrape()
