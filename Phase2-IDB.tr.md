# FoodBankConnect — Technical Report (IDB2.tr.md)

## 1. Motivation / Purpose

FoodBankConnect is a community-focused web platform that aggregates, normalizes, and serves information about local food banks, distribution programs, classes, volunteer opportunities, and sponsors/donors. The site’s goals are:

* Help underserved community members discover nearby food resources and programs.
* Help sponsors/donors find organizations and opportunities to support.
* Provide listings gathered from multiple public sources.

Primary public surfaces:

* Public website: `https://foodbankconnect.me`
* API documentation / tests: Postman collection (public)

---

## 2. High-level Architecture

**Layers & components**

1. **Data collection layer (Scrapers)**

   * One Python scraper per source (repo: `https://gitlab.com/dafrancc/fbc-scrapers`).
   * Scrapers convert raw HTML/JSON into a canonical JSON format and save locally. 

2. **Storage layer (Database)**

   * PostgreSQL hosted on AWS.

3. **API layer (Backend)**

   * Backend is a Python REST service. Endpoints implemented to serve model collections and individual instances.
   * We used AWS to host our site. 

4. **Frontend (Client)**

   * React single page app (repo root `public`/`src`). Pages render model grids, instance pages, and maps.
   * Consumes backend API under `/api/`.
   * Hosted as static site on AWS. 

5. **CI/CD**

   * GitLab pipelines configured (see: `https://gitlab.com/OdinLimaye/cs373-fall-2025-55085_07/-/pipelines`).
   * Pipelines run tests, build Docker images, run Postman tests, and deploy to AWS.

6. **Tools & integrations**

   * Postman (API docs + automated API tests).
   * Docker for reproducible dev environments (frontend and backend images).
   * GitLab CI for automated testing & deploy.

Diagram (logical):

```
[Scrapers] -> [Postgres (AWS)] -> [Python backend (EC2)] -> [React Frontend]
```

---

## 3. Models (Data Schema overview)

**Primary models** (three main models required by rubric):

### 3.1 FoodBank / FoodPantry

* `about`
* `address` (street, city, state, zip)
* `capacity` (e.g., meals/week)
* `name` 
* `urgency` (low/medium/high)
* `website`
* `zipcode` 

### 3.2 Program / Service

* `name`
* `program_type` 
* `eligibility` 
* `frequency`
* `cost`
* `host` 

### 3.3 Sponsor / Donor

* `name`
* `image` 
* `alt` 
* `contribution`
* `affiliation`
* `type` 

---

## 4. Data sources & scraping

**Primary scraped sources (examples)**

* ProPublica nonprofit API — `https://projects.propublica.org/nonprofits/api`
And More 

**Scraper repo**: `https://gitlab.com/dafrancc/fbc-scrapers`

**Pattern used by scrapers**

* Each scraper is a Python script that:

  1. Fetches data via REST API or performs HTML parsing with `requests` + `BeautifulSoup`.
  2. Normalizes vendor-specific fields into canonical schema (the three model types).
  3. Writes canonical JSON files to `scraped/` or directly seeds the DB using a bulk import script.
  4. Produces an example JSON per source (e.g., `foodbank_example.json`, `program_example.json`, `sponsor_example.json`).

---

## 5. Backend API — Endpoints & Documentation

> Postman collection (public): `https://www.postman.com/downing-group-7/dafrancc-s-workspace/collection/uhwer5y/food-bank-api-v2`

### Required endpoints (implemented)

**FoodBanks**

* `GET /api/foodbanks` — returns paginated list of foodbanks.

  * Query params: `page` (int), `per_page` (int), `sort` (e.g., `capacity:desc`), `filter` (JSON or simple params e.g., `city=Austin&urgency=high`).
  * Example: `https://foodbankconnect.me/api/foodbanks?page=1&per_page=20`

* `GET /api/foodbanks/<id>` — returns a single foodbank instance.

  * Example: `https://foodbankconnect.me/api/foodbanks/123`

**Programs**

* `GET /api/programs` — paginated list.

  * Query params: `page`, `per_page`, `program_type`, `frequency`, `city`.
  * Example: `https://foodbankconnect.me/api/programs?program_type=distribution&page=1`

* `GET /api/programs/<id>` — program details, linked foodbanks and sponsors.

**Sponsors**

* `GET /api/sponsors` — paginated list.

  * Example: `https://foodbankconnect.me/api/sponsors?page=1&per_page=25`

* `GET /api/sponsors/<id>` — sponsor details, contributions, linked programs/foodbanks.

**Auxiliary endpoints**

* `GET /api/search` — multi-model search (query param `q`). Returns grouped results per model.
* `GET /api/health` — test endpoint for CI to verify service is up. Example: `https://foodbankconnect.me/api/health`

**Response format**

* All collection endpoints return JSON with metadata for pagination: `{ "data": [ ... ], "meta": { "page": 1, "per_page": 20, "total": 700, "total_pages": 35 } }`.
* Instance endpoints return `{ "data": { ... } }`.

## 6. Database Implementation (Phase II focus)

**Choice**: PostgreSQL (hosted on AWS RDS)

* `FoodBank` (id, name, address, city, state, zip, lat, lon, capacity, hours, urgency_level, contact_info, media JSON)
* `Program` (id, title, program_type, description, schedule JSON, host_org_id)
* `Sponsor` (id, name, contribution_type, typical_amount, affiliation, logo_url)
* `foodbank_programs` (foodbank_id, program_id)
* `sponsor_foodbanks` (sponsor_id, foodbank_id)
* `sponsor_programs` (sponsor_id, program_id)

**Pagination**

* Endpoints support `page` and `per_page`. Default `per_page` = 20; maximum enforced (e.g., 100).

**Indexing & performance**

* Index on `city`, `zip`, `urgency_level`, and `program_type`.

---

## 7. Frontend Implementation

**Framework**: React

**Project layout (important files)**

* `src/` — React components

  * `pages/Foodbanks.jsx` (model grid + pagination controls)
  * `pages/Programs.jsx`
  * `pages/Sponsors.jsx`
  * `App.jsx` — router and nav (navbar, bread crumbs)

**Design**

* Uses Bootstrap (or React-Bootstrap) responsive grid system. NavBar present site-wide.
* Instance pages reuse card components to keep consistent presentation.

**Client-side data handling**

* Fetch data from `/api/` endpoints.
* Maintain pagination and sorting state in URL query params (so pages are linkable).

**Testing**

* Acceptance tests for flows (search, pagination, instance page load).

---

## 8. Phase II Features & Implementation Details

This project’s Phase II required database integration, API endpoints, pagination, and instance pages. Summary of implementations:

* **Database**: PostgreSQL schema created.
* **Pagination**: Implemented for each collection endpoint — page, per_page, and meta returned.
* **Instance Pages**: Many instance pages generated dynamically by React using API endpoints; at least 100 instances per model seeded (ProPublica scripts provided ~100 good instances).
* **API Docs**: Postman collection public and linked from site (About page links to Postman).
* **Media**: Each instance supports multiple media items (images and videos/links). Media stored as URLs in DB; frontend renders with lazy-loading.

---

## 9. Tests & CI

**Backend tests**

* Unittest coverage for each endpoint (at least one test per endpoint).
* Tests spin up a test DB (sqlite or ephemeral Postgres) and seed small fixtures.

**API tests**

* Postman collection runs as part of CI to validate endpoints and example responses.

**Frontend tests**

* Jest unit tests (10+), and Selenium acceptance tests (10+ flows) run in CI pipeline.

**GitLab CI**

* Configured to run linting, unit tests, Postman tests, build Docker images, and deploy on success.
* Link to pipelines: `https://gitlab.com/OdinLimaye/cs373-fall-2025-55085_07/-/pipelines`

---

## 10. Hosting & Deployment

**Hosting choices**

* **Frontend**: Static site hosted on AWS or served from a frontend server on EC2.
* **Backend**: App deployed to AWS (EC2). Docker images used for portability.
* **Database**: PostgreSQL on AWS RDS. 

**Certificates & HTTPS**

* TLS certificates via AWS Certificate Manager (ACM) or direct Let’s Encrypt for EC2.

**Domain config**

* `foodbankconnect.me` configured in DNS to point to load balancer.

---

## 11. API Documentation — Example concrete specs

**Foodbanks list**

* URL: `https://foodbankconnect.me/api/foodbanks?page=1&per_page=20`
* Method: `GET`
* Response: JSON (see schema above)

**Foodbank details**

* URL: `https://foodbankconnect.me/api/foodbanks/123`
* Method: `GET`
* Response: `{ data: { id, name, address, lat, lon, media: [...], programs: [...], sponsors: [...] }}`

Include these exact URLs in the Postman collection (already present).

---

## 12. Scrapers — Operational notes

* Scrapers live in `fbc-scrapers` repo. Each script is idempotent and can be run on a cron schedule.
* Typical flow:

  1. Run scraper -> write canonical JSON.
  2. Run import script (`fetch_data.py`) to upsert into DB via backend API or direct DB connection.

---

## 13. Challenges & How We Overcame Them

**1) Heterogeneous data formats**

* Problem: Different sources used different field names, address formats, and missing fields.
* Solution: Build canonical schema + normalization layer in scrapers.

**2) Deploying multiple services**

* Problem: Some websites changed layout or returned inconsistent data, causing scraper failures.
* Solution: Added error handling and schema validation to skip or flag malformed entries, keeping the dataset clean and consistent.

**3) Responsive design and layout consistency**

* Problem: The UI layout broke on smaller screens due to inconsistent Bootstrap grid usage.
* Solution: Refactored components using React-Bootstrap’s grid system and tested responsiveness across devices.

---

## 14. How to Onboard a New Developer

1. **Clone the repositories**  
   Get access to both the frontend (React) and backend  repositories from GitLab.  
   The links are provided in the main project README.

2. **Set up the database**  
   Connect to the Aurora RDS PostgreSQL instance using the credentials in the team’s documentation.  
   You can view and verify the database schema using an SQL client.

3. **Load sample data**  
   Seed the database manually using the JSON examples in `scrapers/`  
   (e.g., `foodbank_example.json`) to test queries and endpoints.

4. **Run the backend locally**  

5. **Run the frontend**
    npm install
    npm start
    This runs the React dev server. 
6. **Test API routes**
    Use **Postman** to send requests to the API Gateway or local backend and verify that endpoints return the expected JSON responses.

---

## 15. Remaining Work & Next Steps (Phase III+)

* Implement advanced filtering and sorting UI for model pages.
* Implement Webhooks to notify partners when urgency levels change.
* Harden authentication and rate-limiting for production API.

---

## 16. Useful Links & Repositories

* Main repo: `https://gitlab.com/OdinLimaye/cs373-fall-2025-55085_07`
* Scrapers: `https://gitlab.com/dafrancc/fbc-scrapers`
* Postman collection: `https://www.postman.com/downing-group-7/dafrancc-s-workspace/collection/uhwer5y/food-bank-api-v2`
* Pipelines: `https://gitlab.com/OdinLimaye/cs373-fall-2025-55085_07/-/pipelines`
* Live site: `https://foodbankconnect.me`

---

## 17. Appendix

* **Sample JSON files**: `foodbank_example.json`, `program_example.json`, `sponsor_example.json` (found in repo `src/`)
* **Scripts**: `fetch_data.py`, `parse_foodbanks_html.py`, `parse_programs_html.py`, `parse_sponsors_html.py` (in `src/`)
* **Frontend notes**: package.json and recent commit messages indicate active work on unit tests and small fixes.

### Scrapers and Google Cloud Programmable Search

* Scrapers use a combination of `requests` + `BeautifulSoup` for HTML parsing and the Google Cloud Programmable Search API to discover images, logos, and additional website links programmatically.
* Each target site has a one-script-per-site approach; outputs are canonical JSON examples like `foodbank_example.json`, `program_example.json`, `sponsor_example.json`.

### Database (operational notes)

* Database: **Amazon Aurora (PostgreSQL compatible)** was used for production hosting.
* Credentials: login information was stored as plain username/password in the early implementation (not AWS Secrets Manager). For production hardening, we recommend moving these to AWS Secrets Manager and rotating credentials periodically.
* Public/Private: the database was made publicly accessible initially for debugging via DataGrip. For production, set the DB to private and allow access only from application security groups.
* Security Group Notes: ensure inbound rules allow port `5432` from authorized sources. If using ECS/Lambda/EC2, add the appropriate Security Group as the allowed source.

### Backend deployment — EC2 + Lambda notes

* Primary backend runtime used by the team: **EC2 server** running the backend application (Dockerized or directly running the Flask/WSGI app). The live API is served from an EC2 instance behind a load-balancer or reverse-proxy.
* The project also experimented with an AWS Lambda + API Gateway approach (HTTP API) for a serverless variant. Some documentation and notes remain in the repo describing how to wire Lambda integrations to API Gateway routes. Both approaches are supported by our CI/CD pipeline — choose EC2 for simplicity and long-lived workloads or Lambda for serverless scaling.

### Hosting & domain (clarifications)

* Frontend hosting: Static assets served via **AWS**. 
* SSL/TLS: Certificates obtained via **AWS Certificate Manager**; domain management and redirects set up in **Namecheap** to force HTTPS and canonical `foodbankconnect.me`.

### Tools used (expanded)

* GitLab (repo and CI)
* AWS (EC2; optional Lambda / API Gateway)
* Namecheap (domain management & redirects)
* React + Bootstrap (frontend)
* Python scrapers: `requests`, `BeautifulSoup`, Google Cloud Programmable Search API
* Postman (API docs & tests)