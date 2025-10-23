# Odin wrote this
# Async added by Francisco

#!/usr/bin/env python3

import asyncio
import aiohttp
import json
import os
import re
from urllib.parse import quote
from typing import Optional, Dict, Any, List

BASE_URL = "https://projects.propublica.org/nonprofits/api/v2"
MAX_RESULTS = int(os.getenv("MAX_RESULTS", "100"))

# -------- Always-on feature flags (can be disabled via env if needed) --------
INCLUDE_IMAGES = os.getenv("INCLUDE_IMAGES", "1") != "0"   # default ON
INCLUDE_GRANTS = os.getenv("INCLUDE_GRANTS", "1") != "0"   # default ON
INCLUDE_TAX_PAGE = os.getenv("INCLUDE_TAX_PAGE", "1") != "0"  # default ON

# -------- Concurrency controls --------
HTTP_LIMIT = int(os.getenv("HTTP_LIMIT", "96"))
EXT_HOST_LIMIT = int(os.getenv("EXT_HOST_LIMIT", "24"))
REQUEST_TIMEOUT_S = float(os.getenv("REQUEST_TIMEOUT_S", "12"))

KEYWORDS = [
    "foundation", "philanthropy", "grant", "donor", "charity",
    "food donation", "corporate giving",
]

FOOD_RELATED_KEYWORDS = [
    "food bank", "pantry", "hunger", "meals", "feeding", "nutrition",
    "soup kitchen", "food insecurity",
]

# -------- Per-run caches --------
_org_detail_cache: Dict[str, Dict[str, Any]] = {}
_image_cache: Dict[str, str] = {}
_text_cache: Dict[str, str] = {}
_tax_cache: Dict[str, str] = {}

# -------- Semaphores for external hosts --------
_ext_sem = asyncio.Semaphore(EXT_HOST_LIMIT)
_img_sem = _ext_sem  # share the same limit for all external calls

# -------- Helpers --------
def _classify_affiliation(name: str, org_detail: Optional[dict] = None) -> str:
    corp_terms = ("INC", "LLC", "CORP", "COMPANY", "CO.", "LTD", "CORPORATION")
    if any(t in (name or "").upper() for t in corp_terms):
        return "Private Corporation"
    if org_detail:
        ntype = org_detail.get("organization_type") or org_detail.get("ntee_code") or ""
        if ntype:
            return f"Nonprofit Foundation ({ntype})"
    return "Nonprofit Foundation"

async def _fetch_json(session: aiohttp.ClientSession, url: str, *, params=None):
    try:
        async with session.get(url, params=params) as resp:
            if resp.status != 200:
                return None
            return await resp.json()
    except Exception:
        return None

async def _fetch_text(session: aiohttp.ClientSession, url: str) -> Optional[str]:
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

async def _fetch_org_detail(session: aiohttp.ClientSession, ein: Optional[str]):
    if not ein:
        return None
    if ein in _org_detail_cache:
        return _org_detail_cache[ein]
    data = await _fetch_json(session, f"{BASE_URL}/organizations/{ein}.json")
    org = (data or {}).get("organization")
    _org_detail_cache[ein] = org
    return org

# --- Tax-exempt page text (aligns with sync behavior) ---
async def _fetch_tax_exempt_text(session: aiohttp.ClientSession, ein: Optional[str]) -> str:
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
        m = re.search(r"Tax-exempt since ([A-Za-z0-9 ,]+)", html)
        if m:
            tax_str = m.group(1)
            # Keep only if a 4-digit year is present
            if re.search(r"\b\d{4}\b", tax_str):
                res = f"Tax-exempt since {tax_str}"
            else:
                res = "This is a nonprofit, tax exempt."
        else:
            res = "This is a nonprofit, tax exempt."
    _tax_cache[ein] = res
    return res

# --- Google Custom Search (image) ---
async def _fetch_logo(session: aiohttp.ClientSession, name: str) -> str:
    """Fetch first image URL from Google Custom Search for sponsor logo."""
    if not INCLUDE_IMAGES or not name:
        return "N/A"
    if name in _image_cache:
        return _image_cache[name]
    api_key = os.getenv("GOOGLE_API_KEY", "")
    cx = os.getenv("GOOGLE_CX", "")
    if not api_key or not cx:
        _image_cache[name] = "N/A"
        return "N/A"
    url = (
        "https://www.googleapis.com/customsearch/v1"
        f"?q={quote(name + ' logo')}&cx={quote(cx)}&key={quote(api_key)}&searchType=image&num=1"
    )
    async with _img_sem:
        data = await _fetch_json(session, url)
    link = (data.get("items")[0]["link"] if data and data.get("items") else "N/A")
    _image_cache[name] = link
    return link

async def _derive_past_involvement_from_filings(filings: Optional[List[dict]]) -> str:
    if not INCLUDE_GRANTS:
        return "N/A"
    for filing in filings or []:
        grants = filing.get("grants", [])
        if not grants:
            continue
        # Prefer food-related recipients
        for g in grants:
            recipient = (g.get("recipient_name") or "").lower()
            if any(k in recipient for k in FOOD_RELATED_KEYWORDS):
                return g.get("recipient_name", "N/A")
        # Otherwise return the first recipient as a fallback
        return grants[0].get("recipient_name", "N/A")
    return "N/A"

async def _process_org(session: aiohttp.ClientSession, org: dict) -> dict:
    name = org.get("name", "N/A")
    ein = org.get("ein", "N/A")
    city = org.get("city", "N/A")
    state_code = org.get("state", "N/A")

    # Launch tasks in parallel
    detail_task = asyncio.create_task(_fetch_org_detail(session, ein))
    logo_task = asyncio.create_task(_fetch_logo(session, name))
    # We need filings for grants; grab full payload once here
    full_payload_task = asyncio.create_task(_fetch_json(session, f"{BASE_URL}/organizations/{ein}.json")) if ein else None
    tax_text_task = asyncio.create_task(_fetch_tax_exempt_text(session, ein))

    detail = await detail_task
    full_payload = await full_payload_task if full_payload_task else None
    filings = (full_payload or {}).get("filings_with_data", [])
    past_involvement_task = asyncio.create_task(_derive_past_involvement_from_filings(filings))

    image_url = await logo_task
    past_involvement = await past_involvement_task

    # About: prefer tax-exempt page text (sync parity)
    about = await tax_text_task

    affiliation = _classify_affiliation(name, detail)
    sponsor_link = f"https://projects.propublica.org/nonprofits/organizations/{ein}" if ein else "N/A"

    return {
        "name": name,
        "image": image_url,
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
        "EIN": str(ein),
    }

async def scrape(max_results=MAX_RESULTS):
    timeout = aiohttp.ClientTimeout(total=REQUEST_TIMEOUT_S)
    connector = aiohttp.TCPConnector(limit=HTTP_LIMIT)
    results: List[dict] = []
    async with aiohttp.ClientSession(timeout=timeout, connector=connector) as session:
        for keyword in KEYWORDS:
            page = 0
            while len(results) < max_results:
                data = await _fetch_json(session, f"{BASE_URL}/search.json", params={"q": keyword, "page": page})
                orgs = (data or {}).get("organizations", [])
                if not orgs:
                    break
                remaining = max_results - len(results)
                tasks = [_process_org(session, org) for org in orgs[:remaining]]
                results.extend(await asyncio.gather(*tasks, return_exceptions=False))
                page += 1
                if page >= (data or {}).get("num_pages", 0):
                    break
            if len(results) >= max_results:
                break
    return results

if __name__ == "__main__":
    donors = asyncio.run(scrape(max_results=int(os.getenv("MAX_RESULTS", str(MAX_RESULTS)))))
    with open("donors.json", "w", encoding="utf-8") as f:
        json.dump(donors, f, indent=2, ensure_ascii=False)
    print(
        f"✅ Saved {len(donors)} sponsors "
        f"(images={INCLUDE_IMAGES}, grants={INCLUDE_GRANTS}, tax_page={INCLUDE_TAX_PAGE})."
    )
