# FoodBankConnect — Technical Report (IDB2.tr.md)

## 1. Motivation / Purpose

FoodBankConnect is a community-focused web platform that aggregates, normalizes, and serves information about local food banks, distribution programs, classes, volunteer opportunities, and sponsors/donors. The site’s goals are:

* Help underserved community members discover nearby food resources and programs.
* Help sponsors/donors find organizations and opportunities to support.
* Provide listings gathered from multiple public sources.

Primary public surfaces:

* Public website: `https://foodbankconnect.me`
* API documentation: `https://www.postman.com/downing-group-7/dafrancc-s-workspace/overview`

---

## 2. High-level Architecture

**Layers & components**

1. **Data collection layer (Scrapers)**

   * One Python scraper per source (repo: `https://gitlab.com/dafrancc/fbc-scrapers`).
   * Scrapers convert raw HTML/JSON into a canonical JSON format and save locally. 
   * The primary scrapers used to populate our database make use of the 
   API's of public internet sources such as ProPublica.

2. **Storage layer (Database)**

   * PostgreSQL hosted on AWS.

3. **API layer (Backend)**

   * Our back-end is a Python REST service. Endpoints are implemented to serve model collections and individual instances (GET endpoints for both).
   * We used AWS to host our site as an EC2 server using Flask. 

4. **Frontend (Client)**

   * React single page app (repo root `public`/`src`). Pages render model grids, instance pages, and maps.
   * Consumes backend API under `/api/`.
   * Hosted as static site on AWS using the S3 bucket. 

5. **CI/CD**

   * GitLab pipelines configured (see: `https://gitlab.com/OdinLimaye/cs373-fall-2025-55085_07/-/pipelines`).
   * Pipelines run tests, build Docker images, run Postman tests, and deploy to AWS upon success.

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
* `city`
* `zip`
* `state`
* `capacity` (e.g., meals/week)
* `name` 
* `urgency` (low/medium/high)
* `website`
* `zipcode` 
* `image`

### 3.2 Program / Service

* `name`
* `program_type` 
* `eligibility` 
* `frequency`
* `cost`
* `host` 
* `signup_link`
* `image`

### 3.3 Sponsor / Donor

* `name`
* `image` 
* `alt` 
* `contribution`
* `affiliation`
* `type`
* `website` 

---

## 4. Data sources & scraping

**Primary scraped sources (examples)**

* ProPublica nonprofit API — `https://projects.propublica.org/nonprofits/api`
* Google search enging API using Google Cloud services

**Scraper repo**: `https://gitlab.com/dafrancc/fbc-scrapers`

**Pattern used by scrapers**

* Each scraper is a Python script that:

  1. Fetches data via REST API or performs HTML parsing with `requests` + `BeautifulSoup`.
  2. Normalizes vendor-specific fields into canonical schema (the three model types).
  3. Writes canonical JSON files to `scraped/` or directly seeds the DB using a bulk import script.
  4. References an example JSON per source (e.g., `foodbank_example.json`, `program_example.json`, `sponsor_example.json`).

---

## 5. Backend API — Endpoints & Documentation

> Postman collection (public): `https://www.postman.com/downing-group-7/dafrancc-s-workspace/collection/uhwer5y/food-bank-api-v2`

### Required endpoints (implemented)

**FoodBanks**

* `GET /v1/foodbanks?` — returns a specified range of the list of foodbanks.

  * Query params: `size` (int), `start` (int)
  * Example: `https://api.foodbankconnect.me/v1/foodbanks?size=10&start=1`

* `GET /v1/foodbanks/<id>` — returns a single foodbank instance.

  * Query params: `ID` (int)
  * Example: `https://api.foodbankconnect.me/v1/foodbanks/123`

**Programs**

* `GET /v1/programs` — returns a specified range of the list of programs.

  * Query params: `size` (int), `start` (int)
  * Example: `https://api.foodbankconnect.me/v1/programs?size=10&start=1`

* `GET /v1/programs/<id>` — returns a single program instance.

   * Query params: `ID` (int)
   * Example: `https://api.foodbankconnect.me/v1/programs/123`

**Sponsors**

* `GET /v1/sponsors` — returns a specified range of the list of sponsors.

  * Query params: `size` (int), `start` (int)
  * Example: `https://api.foodbankconnect.me/v1/sponsors?size=10&start=1`

* `GET /v1/sponsors/<id>` — 

   * Query params: `ID` (int)
   * Example: `https://api.foodbankconnect.me/v1/sponsors/123`

**Response format**

* All collection endpoints return JSON with metadata for pagination: a list of instance endpoint returns followed by metadata (fetched_at, created_at).
* Instance endpoints return: values for all of the attributes listed above along with metadata (fetched_at, created_at).

## 6. Database Implementation (Phase II focus)

**Choice**: PostgreSQL (hosted on AWS RDS)

* `FoodBank` (id, name, address, city, state, zip, lat, lon, capacity, hours, urgency_level, contact_info, media JSON)
* `Program` (id, title, program_type, description, schedule JSON, host_org_id)
* `Sponsor` (id, name, contribution_type, typical_amount, affiliation, logo_url)
* `foodbank_programs` (foodbank_id, program_id)
* `sponsor_foodbanks` (sponsor_id, foodbank_id)
* `sponsor_programs` (sponsor_id, program_id)

**Pagination**

* Our API handles dynamic ranges with the GET range endpoint for each model, so paginating can be determined entirely by clients. Our frontend does so by paging in groups of 20 until the database is exhausted, which at the moment produces an even 5 pages since our database has 100 instances per model. Additionally, the start_at parameter in the GET range endpoint makes clients handle the tracking of their parsing through the databse, matching the fact that they can page flexibly by specifying ranges.

## 7. Frontend Implementation

**Framework**: React

**Project layout (important files)**

* `src/` — React components

  * `pages/Foodbanks.jsx` (model grid + pagination controls)
  * `pages/Programs.jsx`
  * `pages/Sponsors.jsx`
  * `App.jsx` — router and nav (navbar, bread crumbs)

**Design**

* Uses Bootstrap responsive grid system. NavBar present site-wide.
* Instance pages reuse card components to keep consistent presentation.

**Client-side data handling**

* Fetch data from `/api/` endpoints.
* Maintain pagination and sorting state in URL query params (so pages are linkable).

**Testing**

* Acceptance tests for flows (search, pagination, instance page load) are handled by Selenium. Per-component unit tests are handled by JEST. API endpoint testing is handled by Postman. Backend testing is handled on our API server. All tests are run through the GitLab CI.

## 8. Phase II Features & Implementation Details

This project’s Phase II required database integration, API endpoints, pagination, and instance pages. Summary of implementations:

* **Database**: PostgreSQL schema created.
* **Pagination**: Implemented via the GET range endpoint, allowing for dynamic, and even non-linear, paging from clients.
* **Instance Pages**: All instance pages generated dynamically by React using API endpoints; at least 100 instances per model seeded (ProPublica scripts provided ~100 good instances).
* **API Docs**: Postman collection public and linked from site (About page links to Postman).
* **Media**: Each instance supports multiple media items (images and links). Media stored as URLs in DB; frontend renders with lazy-loading.

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

* Configured to run unit tests, Postman tests, build Docker images, and deploy on success.
* Link to pipelines: `https://gitlab.com/OdinLimaye/cs373-fall-2025-55085_07/-/pipelines`

---

## 10. Hosting & Deployment

**Hosting choices**

* **Frontend**: Static site hosted on AWS CloudFront.
* **Backend**: App deployed to AWS (EC2) using Flask and Phython.
* **Database**: PostgreSQL on AWS RDS. 

**Certificates & HTTPS**

* TLS certificates via AWS Certificate Manager (ACM) and HTTPS Certificate via AWS Cloudfront and NameCheap.

**Domain config**

* `foodbankconnect.me` configured in DNS to direct traffic to CloudFront.

---

## 11. Scrapers — Operational notes

* Scrapers live in `fbc-scrapers` repo.
* Typical flow:

  1. Run scraper -> write canonical JSON.
  2. Run import script (`fetch_data.py`) to insert into the database.

---

## 12. Challenges & How We Overcame Them

**1) Heterogeneous data formats**

* Problem: Different sources used different field names, address formats, and missing fields.
* Solution: Build canonical schema + normalization layer in scrapers based on three example JSON files that represent our current JSON attributes for each model.

**2) Deploying multiple services**

* Problem: Some websites changed layout or returned inconsistent data, causing scraper failures.
* Solution: Added error handling and schema validation to skip or flag malformed entries, keeping the dataset clean and consistent.

**3) Responsive design and layout consistency**

* Problem: The UI layout broke on smaller screens due to inconsistent Bootstrap grid usage.
* Solution: Refactored components using React-Bootstrap’s grid system and tested responsiveness across devices.

---

## 13. How to Onboard a New Developer

1. **Clone the repositories**  
   Get access to both the frontend (React) and backend repositories from GitLab.  
   The links are provided in the main project README.

2. **Set up the database**  
   Connect to the Aurora RDS PostgreSQL instance using the credentials in the team’s documentation.  
   You can view and verify the database schema using an SQL client.

3. **Load sample data**  
   Seed the database manually using the JSON examples in `scrapers/`  
   (e.g., `foodbank_example.json`) to test queries and endpoints.

4. **Run the backend locally**  
   See BackendInstruction.md in the main repo.

5. **Run the frontend**
    npm install
    npm start
    This runs the React dev server. 
6. **Test API routes**
    Use **Postman** to send requests to the API Gateway or local backend and verify that endpoints return the expected JSON responses.

---

## 14. Remaining Work & Next Steps (Phase III+)

* Implement advanced filtering and sorting UI for model pages.
* Implement Webhooks to notify partners when urgency levels change.
* Harden authentication and rate-limiting for production API.

---

## 15. Useful Links & Repositories

* Main repo: `https://gitlab.com/OdinLimaye/cs373-fall-2025-55085_07`
* Scrapers: `https://gitlab.com/dafrancc/fbc-scrapers`
* Postman collection: `https://www.postman.com/downing-group-7/dafrancc-s-workspace/collection/uhwer5y/food-bank-api-v2`
* Pipelines: `https://gitlab.com/OdinLimaye/cs373-fall-2025-55085_07/-/pipelines`
* Live site: `https://foodbankconnect.me`

---

## 16. User Stories

**Note**
   We only ever received 5 user stories from our customer group.

**User Story 1**
   Our customer group recommended that we add a feature to filer food banks by user location, allowing them to find the food bank that is nearest to them geographically. They also suggested a filter by open/closed hours for the foodbanks. After having a dialogue with the customer group, we concluded that these features are out of scope for phase 2 since they primarily revolve around filtering and sorting, which is not to be implemented until phase 3.

**User Story 2**
   Our customer group suggested that we add in functionality to allow users to sort for certain food items that meet their dietary needs or healthiness levels. We had a dialogue over this and came to the conclusion that this feature falls squarely into phase 3, not phase 2, since it implements searching and filtering.

**User Story 3**
   Our customer group was suggesting from the standpoint of another developer seeking to use our site's API as a client. They asked if we could implement a feature in our API to return a list of all of the foodbank instances and their attributes. We were already going to be doing this anyways as part of the project's requirements, so this was naturally implemented on its own.

**User Story 4**
   Our customer group informed us that the text on our landing page was very faint and that the images behind the text in the slideshow made the text hard to see. We predicted that this would take us around 15 minutes to implement, and it took us around 20 minutes to implement. We blurred the backing images and made the font and color of the landing page text more bold so that its visiblity was boosted.

**User Story 5**
   Our customer group suggested that we include a navigational bar to our home page so that access to the model pages and the about pages from the landing page is easy. We included the header navigational bar in addition to the navigation tool already present on the landing page. We predicted this would only take 5 minutes since we already had a navigational bar React component. It took us about that long to implement.

****

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