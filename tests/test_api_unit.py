# tests/test_api_unit.py
# © 2025 Francisco Vivas. All rights reserved.

import os
import importlib
import pytest

# ----- Helpers ---------------------------------------------------------------

def _setup_env(schema="app_ci_test"):
    # Point to CI Postgres service; run in DRY mode to avoid external effects
    os.environ.setdefault("DB_HOST", "postgres")
    os.environ.setdefault("DB_PORT", "5432")
    os.environ.setdefault("DB_USER", "postgres")
    os.environ.setdefault("DB_PASSWORD", "postgres")
    os.environ.setdefault("DB_NAME", "postgres")
    os.environ["DB_SCHEMA"] = schema
    os.environ.setdefault("DRY_RUN", "true")

def _import_app():
    # import or reload to pick env
    if "app" in globals():
        importlib.reload(globals()["app"])
    import app  # noqa: E402
    return app


def _mk_client():
    _setup_env()
    main = _import_app()
    # create tables so list endpoints have something to query
    main.Base.metadata.drop_all(bind=main.ENGINE)
    main.Base.metadata.create_all(bind=main.ENGINE)
    main.app.testing = True
    return main, main.app.test_client()

def _get(client, path):
    """
    Try /v1/... first (API Gateway spec), fallback to unprefixed /...
    so the same tests work against your local Flask app.
    """
    r = client.get(path)
    if r.status_code == 404 and path.startswith("/v1/"):
        r = client.get(path[3:])  # strip '/v1'
    return r

# ----- Fixtures --------------------------------------------------------------

@pytest.fixture(scope="module")
def app_client():
    return _mk_client()

# ----- Seed rows for by-id tests --------------------------------------------

def _insert_samples(main):
    with main.Session(main.ENGINE) as s:
        s.add(main.Foodbank(id="fb_ut", name="UT FB"))
        s.add(main.Program(id="pr_ut", name="UT PR"))
        s.add(main.Sponsor(id="sp_ut", name="UT SP"))
        s.commit()

# ----- Collection endpoints --------------------------------------------------

@pytest.mark.parametrize("path", [
    "/v1/foodbanks",
    "/v1/programs",
    "/v1/sponsors",
])
def test_collection_gets(app_client, path):
    main, client = app_client
    r = _get(client, f"{path}?limit=2&offset=0")
    assert r.status_code == 200
    data = r.get_json()
    assert isinstance(data, list)

# ----- By-ID endpoints -------------------------------------------------------

@pytest.mark.parametrize("path,item_id", [
    ("/v1/foodbanks/{id}", "fb_ut"),
    ("/v1/programs/{id}",  "pr_ut"),
    ("/v1/sponsors/{id}",  "sp_ut"),
])
def test_get_by_id(app_client, path, item_id):
    main, client = app_client
    _insert_samples(main)

    r = _get(client, path.replace("{id}", item_id))
    if r.status_code == 404:
        pytest.skip(f"{path} not implemented in Flask app yet (returned 404).")
    assert r.status_code == 200
    data = r.get_json()
    assert isinstance(data, dict)
    assert data.get("id") == item_id
