import requests

BASE_URL = "http://localhost:8080/v1"  # Change if your API runs elsewhere

# -----------------------
# Foodbanks
# -----------------------
def test_foodbank_by_id():
    resp = requests.get(f"{BASE_URL}/foodbanks/1")
    assert resp.status_code == 200
    data = resp.json()
    # Check main fields exist
    for field in ["id", "name", "about", "eligibility", "city", "state", "zipcode", "type"]:
        assert field in data

def test_foodbanks_range():
    resp = requests.get(f"{BASE_URL}/foodbanks?size=10&start=1")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data and isinstance(data["items"], list)
    if data["items"]:
        for field in ["id", "name", "about", "eligibility", "city", "state", "zipcode", "type"]:
            assert field in data["items"][0]

# -----------------------
# Programs
# -----------------------
def test_program_by_id():
    resp = requests.get(f"{BASE_URL}/programs/1")
    assert resp.status_code == 200
    data = resp.json()
    for field in ["id", "name", "about", "eligibility", "cost", "host", "program_type", "type"]:
        assert field in data

def test_programs_range():
    resp = requests.get(f"{BASE_URL}/programs?size=10&start=1")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data and isinstance(data["items"], list)
    if data["items"]:
        for field in ["id", "name", "about", "eligibility", "cost", "host", "program_type", "type"]:
            assert field in data["items"][0]

# -----------------------
# Sponsors
# -----------------------
def test_sponsor_by_id():
    resp = requests.get(f"{BASE_URL}/sponsors/1")
    assert resp.status_code == 200
    data = resp.json()
    for field in ["id", "name", "about", "affiliation", "city", "state", "contribution", "type"]:
        assert field in data

def test_sponsors_range():
    resp = requests.get(f"{BASE_URL}/sponsors?size=10&start=1")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data and isinstance(data["items"], list)
    if data["items"]:
        for field in ["id", "name", "about", "affiliation", "city", "state", "contribution", "type"]:
            assert field in data["items"][0]
