import requests
import json
import re
import time
from bs4 import BeautifulSoup

BASE_URL = "https://projects.propublica.org/nonprofits/api/v2"
MAX_RESULTS = 10

GOOGLE_API_KEY = "AIzaSyCaX5owOlwzJq59MYdCl6lV5BKt3W3K-KE"
GOOGLE_CX = "47dcfe213c7274b68"

ABOUT_KEYWORDS = [
    "about",
    "food",
    "support",
    "community",
    "our story",
    "mission",
    "who we are",
    "history",
    "why we",
    "vision"
]


def tiny_delay():
    """Small pause before every request."""
    time.sleep(0.25)  # 250 ms delay


# -------------------------------
# GOOGLE HELPERS
# -------------------------------

def google_search_raw(query: str):
    """Run a Google Custom Search and return the raw JSON."""
    tiny_delay()
    params = {
        "q": query,
        "cx": GOOGLE_CX,
        "key": GOOGLE_API_KEY,
        "num": 3
    }
    resp = requests.get("https://www.googleapis.com/customsearch/v1", params=params)
    return resp.json()


def fetch_google_image(query: str):
    """Return the first clean Google image result, skipping lookasides."""
    tiny_delay()
    params = {
        "q": query,
        "cx": GOOGLE_CX,
        "key": GOOGLE_API_KEY,
        "num": 10,
        "searchType": "image"
    }

    resp = requests.get("https://www.googleapis.com/customsearch/v1", params=params)
    data = resp.json()

    if "items" not in data or not data["items"]:
        return "N/A"

    clean_exts = (".jpg", ".jpeg", ".png", ".gif", ".webp")

    for item in data["items"]:
        link = item.get("link", "")
        if isinstance(link, str) and link.lower().endswith(clean_exts):
            return link

    return data["items"][0].get("link", "N/A")


def fetch_google_website_and_about(name: str):
    """
    Return:
      website (first result)
      google_about (snippet or meta description)
    """
    data = google_search_raw(name)

    if "items" not in data or not data["items"]:
        return "N/A", None

    first = data["items"][0]

    website = first.get("link", "N/A")
    snippet = first.get("snippet")

    # Meta descriptions pulled by Google (even for JS-heavy sites)
    meta_about = None
    pagemap = first.get("pagemap", {})
    meta_list = pagemap.get("metatags", [])
    if meta_list and isinstance(meta_list, list):
        meta = meta_list[0]
        meta_about = (
            meta.get("og:description")
            or meta.get("twitter:description")
            or meta.get("description")
        )

    google_about = meta_about or snippet
    return website, google_about


# -------------------------------
# ABOUT SCRAPING HELPERS
# -------------------------------

def extract_about_from_url(url: str) -> str:
    """Extracts meaningful text even from JS-heavy sites without real headers."""
    if not url or url == "N/A":
        return None

    try:
        tiny_delay()
        resp = requests.get(url, timeout=8)
        if resp.status_code != 200:
            return None

        soup = BeautifulSoup(resp.text, "html.parser")

        # Remove junk
        for tag in soup(["script", "style", "noscript", "svg", "footer", "header", "nav"]):
            tag.decompose()

        # 1. HEADER-BASED ABOUT extraction
        for header in soup.find_all(["h1", "h2", "h3", "h4"]):
            header_text = header.get_text(strip=True).lower()
            if any(kw in header_text for kw in ABOUT_KEYWORDS):
                collected = []
                for sib in header.find_next_siblings():
                    text = sib.get_text(" ", strip=True)
                    if len(text) > 40:
                        collected.append(text)
                    if len(" ".join(collected)) > 300:
                        break
                if collected:
                    return " ".join(collected)

        # 2. Meta description inside page HTML
        desc = soup.find("meta", attrs={"name": "description"})
        if desc and desc.get("content"):
            return desc["content"]

        # 3. Long paragraph/div/span text
        candidate_blocks = []
        for tag in soup.find_all(["p", "div", "span"]):
            text = tag.get_text(" ", strip=True)
            if not text:
                continue
            if len(text) < 40:
                continue
            if any(x in text.lower() for x in ["cookie", "privacy", "terms", "javascript"]):
                continue
            candidate_blocks.append(text)

        if candidate_blocks:
            candidate_blocks.sort(key=len, reverse=True)
            return candidate_blocks[0]

        # 4. Basic all-text fallback
        all_text = soup.get_text(" ", strip=True)
        if len(all_text) > 40:
            chunks = [c.strip() for c in re.split(r"[.!?]", all_text) if len(c.strip()) > 40]
            if chunks:
                return chunks[0]

        return None

    except Exception:
        return None


def extract_about_section(website: str) -> str:
    """
    First try /about and /aboutus.
    Then fallback to homepage.
    """
    if not website or website == "N/A":
        return None

    base = website.rstrip("/")

    # 1. Try /about
    about_url = base + "/about"
    about_text = extract_about_from_url(about_url)
    if about_text and len(about_text) > 40:
        return about_text

    # 2. Try /aboutus
    aboutus_url = base + "/aboutus"
    aboutus_text = extract_about_from_url(aboutus_url)
    if aboutus_text and len(aboutus_text) > 40:
        return aboutus_text

    # 3. Homepage
    return extract_about_from_url(website)


# -------------------------------
# PROPUBLICA HELPERS
# -------------------------------

def fetch_search(q="food bank", state=None, page=0):
    tiny_delay()
    url = f"{BASE_URL}/search.json"
    params = {"q": q, "page": page}
    if state:
        params["state[id]"] = state
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    return resp.json()


def fetch_organization(ein: str):
    tiny_delay()
    url = f"{BASE_URL}/organizations/{ein}.json"
    resp = requests.get(url)
    if resp.status_code != 200:
        return None
    return resp.json()


def infer_services(text):
    text = (text or "").lower()
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


# -------------------------------
# MAIN SCRAPER
# -------------------------------

def scrape(q="food bank", state=None, max_results=MAX_RESULTS):
    print("Scraping for Foodbanks and Programs now.")
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

            # GOOGLE WEBSITE + ABOUT META/SNIPPET
            website, google_about = fetch_google_website_and_about(name)

            # SCRAPED ABOUT
            about = extract_about_section(website)

            # If scraping failed, use Google's extracted description/snippet
            if not about:
                about = google_about

            # If still nothing, try homepage one more time
            if not about:
                about = extract_about_from_url(website)

            # Final fallback
            if not about:
                about = "This organization provides food assistance and community support."

            # Infer services
            services_list = infer_services(about)
            program_name = f"{name} {' / '.join(services_list)} Program"

            # IMAGE (Google)
            foodbank_image = fetch_google_image(f"{name} food bank")
            program_image = foodbank_image

            # JSON OBJECTS
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

            program_json = {
                "name": program_name,
                "program_type": (
                    "class" if "training" in program_name.lower() or "culinary" in program_name.lower()
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


# -------------------------------
# ENTRY POINT
# -------------------------------

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
