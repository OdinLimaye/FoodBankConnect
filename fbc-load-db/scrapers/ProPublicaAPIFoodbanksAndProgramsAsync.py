# Odin wrote this
# Async added by Francisco

#!/usr/bin/env python3

import asyncio
import aiohttp
import json
import os
import re
from typing import Optional, Dict, Tuple
from urllib.parse import quote

BASE_URL = "https://projects.propublica.org/nonprofits/api/v2"
MAX_RESULTS = int(os.getenv("MAX_RESULTS", "100"))

# -------- Always-on feature flags (can be disabled via env if needed) --------
INCLUDE_IMAGES = os.getenv("INCLUDE_IMAGES", "1") != "0"        # default ON
INCLUDE_TAX_PAGE = os.getenv("INCLUDE_TAX_PAGE", "1") != "0"    # default ON
INCLUDE_WEB_LINKS = os.getenv("INCLUDE_WEB_LINKS", "1") != "0"  # default ON

# -------- Concurrency controls --------
HTTP_LIMIT = int(os.getenv("HTTP_LIMIT", "96"))          # overall concurrent connections
EXT_HOST_LIMIT = int(os.getenv("EXT_HOST_LIMIT", "24"))  # for external sites (images/tax page/google)
REQUEST_TIMEOUT_S = float(os.getenv("REQUEST_TIMEOUT_S", "12"))

# -------- Caches (per run) --------
_org_detail_cache: Dict[str, dict] = {}
_text_cache: Dict[str, str] = {}
_tax_cache: Dict[str, str] = {}
_google_img_cache: Dict[str, str] = {}
_google_web_cache: Dict[str, str] = {}

# -------- Semaphores for external hosts --------
_ext_sem = asyncio.Semaphore(EXT_HOST_LIMIT)

# -------- Helpers --------
def _infer_services(text: str):
    text = (text or "").lower()
    services = []
    if "nutrition" in text:
        services.append("Nutrition Education")
    if any(k in text for k in ("meal", "food", "pantry")):
        services.append("Emergency Food Assistance")
    if any(k in text for k in ("training", "culinary")):
        services.append("Culinary Training Program")
    if "snap" in text:
        services.append("SNAP Outreach")
    if not services:
        services.append("Food Distribution")
    return services

async def _fetch_json(session: aiohttp.ClientSession, url: str, *, params=None):
    try:
        async with session.get(url, params=params) as resp:
            if resp.status != 200:
                return None
            return await resp.json()
    except Exception:
        return None

async def _fetch_text(session: aiohttp.ClientSession, url: str):
    if url in _text_cache:
        return _text_cache[url]
    try:
        async with session.get(url, headers={"User-Agent": "Mozilla/5.0"}) as resp:
            if resp.status != 200:
                return None
            txt = await resp.text()
            _text_cache[url] = txt
            return txt
    except Exception:
        return None

async def _fetch_search(session, q="food bank", state=None, page=0):
    params = {"q": q, "page": page}
    if state:
        params["state[id]"] = state
    return await _fetch_json(session, f"{BASE_URL}/search.json", params=params)

async def _fetch_org_detail(session, ein: Optional[str]):
    if not ein:
        return None
    if ein in _org_detail_cache:
        return _org_detail_cache[ein]
    data = await _fetch_json(session, f"{BASE_URL}/organizations/{ein}.json")
    org = (data or {}).get("organization")
    _org_detail_cache[ein] = org
    return org

# --- Tax-exempt page text (aligns with non-async behavior) ---
async def _fetch_tax_exempt_text(session, ein: Optional[str]) -> str:
    if not INCLUDE_TAX_PAGE or not ein:
        return "This is a nonprofit, tax exempt."
    if ein in _tax_cache:
        return _tax_cache[ein]
    url = f"https://projects.propublica.org/nonprofits/organizations/{ein}"
    async with _ext_sem:
        html = await _fetch_text(session, url)
    if not html:
        res = "This is a nonprofit, tax exempt."
    else:
        # Match "Tax-exempt since ..." and only keep if a 4-digit year appears (parity with sync version)
        m = re.search(r"Tax-exempt since ([A-Za-z0-9 ,]+)", html)
        if m:
            tax_str = m.group(1)
            if re.search(r"\b\d{4}\b", tax_str):
                res = f"Tax-exempt since {tax_str}"
            else:
                res = "This is a nonprofit, tax exempt."
        else:
            res = "This is a nonprofit, tax exempt."
    _tax_cache[ein] = res
    return res

# --- Google Custom Search (images and web) ---
async def _google_first_link(session: aiohttp.ClientSession, query: str, *, search_type: Optional[str] = None) -> str:
    """
    Returns the first link from Google Custom Search.
    search_type: None for web, "image" for images.
    Mirrors the non-async 'fetch_google' function's behavior.
    """
    api_key = os.getenv("GOOGLE_API_KEY", "")
    cx = os.getenv("GOOGLE_CX", "")
    if not api_key or not cx or not query:
        return "N/A"

    cache = _google_img_cache if search_type == "image" else _google_web_cache
    if query in cache:
        return cache[query]

    params = {
        "q": query,
        "cx": cx,
        "key": api_key,
        "num": 1,
    }
    if search_type == "image":
        params["searchType"] = "image"

    url = "https://www.googleapis.com/customsearch/v1"
    async with _ext_sem:
        data = await _fetch_json(session, url, params=params)

    link = (data.get("items")[0]["link"] if data and data.get("items") else "N/A")
    cache[query] = link or "N/A"
    return cache[query]

async def _process_org(session, org):
    ein = org.get("ein")
    name = org.get("name", "N/A")
    city = org.get("city", "N/A")
    state_code = org.get("state", "N/A")

    # Kick off details/tax and any Google lookups in parallel
    org_detail_task = asyncio.create_task(_fetch_org_detail(session, ein))
    tax_task = asyncio.create_task(_fetch_tax_exempt_text(session, ein))

    # Image queries
    img_foodbank_task = asyncio.create_task(
        _google_first_link(session, f"{name} logo", search_type="image")
    ) if INCLUDE_IMAGES else None
    img_program_task = asyncio.create_task(
        _google_first_link(session, f"{name} volunteer", search_type="image")
    ) if INCLUDE_IMAGES else None

    # Web link queries (official site + volunteer/sign-up)
    site_task = asyncio.create_task(
        _google_first_link(session, f"{name} official site")
    ) if INCLUDE_WEB_LINKS else None
    signup_task = asyncio.create_task(
        _google_first_link(session, f"{name} volunteer")
    ) if INCLUDE_WEB_LINKS else None

    org_detail = await org_detail_task
    about = await tax_task

    zipcode = (org_detail or {}).get("zipcode") or (org_detail or {}).get("zip") or "N/A"
    phone = (org_detail or {}).get("telephone") or (org_detail or {}).get("phone") or "N/A"

    services_list = _infer_services(about)
    program_name = f"{name} {' / '.join(services_list)} Program"

    # Resolve image/web tasks
    foodbank_image = await img_foodbank_task if img_foodbank_task else "N/A"
    program_image = await img_program_task if img_program_task else "N/A"

    foodbank_website = await site_task if site_task else (
        f"https://projects.propublica.org/nonprofits/organizations/{ein}" if ein else "N/A"
    )
    program_signup = await signup_task if signup_task else foodbank_website

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
        "website": foodbank_website,
        "zipcode": zipcode,
    }

    program_json = {
        "name": program_name,
        "program_type": "class" if any(k in program_name.lower() for k in ("training", "culinary")) else "service",
        "eligibility": "N/A",
        "frequency": "Weekly",
        "cost": "Free",
        "host": name,
        "detailsPage": program_name.replace(" ", "-").lower(),
        "about": about,
        "sign_up_link": program_signup,
        "type": "program",
        "image": program_image,
    }

    return foodbank_json, program_json

async def scrape(q="food bank", state=None, max_results=MAX_RESULTS):
    timeout = aiohttp.ClientTimeout(total=REQUEST_TIMEOUT_S)
    connector = aiohttp.TCPConnector(limit=HTTP_LIMIT)
    results = []
    async with aiohttp.ClientSession(timeout=timeout, connector=connector) as session:
        page = 0
        while len(results) // 2 < max_results:
            search_json = await _fetch_search(session, q=q, state=state, page=page)
            orgs = (search_json or {}).get("organizations", [])
            if not orgs:
                break

            remaining_pairs = max_results - (len(results) // 2)
            tasks = [_process_org(session, org) for org in orgs[:remaining_pairs]]

            # Gather all pairs and flatten into results
            pairs = await asyncio.gather(*tasks, return_exceptions=False)
            for fb, prog in pairs:
                results.append(fb)
                results.append(prog)

            page += 1
            if page >= (search_json or {}).get("num_pages", 0):
                break

    return results

if __name__ == "__main__":
    data = asyncio.run(
        scrape(
            q=os.getenv("QUERY", "food bank"),
            state=os.getenv("STATE"),
            max_results=int(os.getenv("MAX_RESULTS", str(MAX_RESULTS))),
        )
    )
    with open("foodbanks_programs.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(
        f"✅ Scraped {len(data)//2} food banks and programs "
        f"(images={INCLUDE_IMAGES}, tax_page={INCLUDE_TAX_PAGE}, weblinks={INCLUDE_WEB_LINKS})."
    )
