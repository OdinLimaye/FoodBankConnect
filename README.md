# Project Proposal  

- **Forked Repo:**
https://gitlab.com/christinedominic/cs373-fall-2025-55085_07

- **Docker Scraper Repo:**
https://gitlab.com/dafrancc/fbc-load-db

- **Postman:**
https://www.postman.com/downing-group-7/dafrancc-s-workspace/collection/uhwer5y/food-bank-api-v2

- **Current Rubric:**
https://docs.google.com/document/d/18aoNGugISszpRDWHiMF9u9QAbScI5wahBJe-YHjtmkc/edit?usp=sharing

- **Canvas / Slack group number:**  
  55085_07  

- **Names of the team members:**  
  - Odin Limaye  
  - Francisco Vivas  
  - Christine Dominic  
  - Mahika Dawar  
  - Jose Lopez  

- **Name of the project:**  
  FoodBankConnect  

- **The proposed project:**  
  Our project will provide a hub where underserved communities can find nearby food banks and programs, while sponsors and donors can discover ways to contribute resources. We'll have real-time food bank listings, distribution programs, classes, and volunteer opportunities, as well as donor and sponsor connections.  

- **URLs of at least three data sources that you will programmatically scrape (at least one must be a RESTful API):**  
  1. https://fdc.nal.usda.gov/api-guide  
  2. https://mealconnect.docs.apiary.io/#
  3. https://www.givefood.org.uk/api/
  4. https://www.centraltexasfoodbank.org/food-assistance/get-food-now  
  5. https://www.austintexas.gov/page/get-help-food-access-today  
  6. https://projects.propublica.org/nonprofits/api  
  7. https://www.findhelp.org

- **At least three models:**  
  1. Food Banks and Food Pantries  
  2. Programs/Services (Distributions, Meal Services, Nutrition Classes, Volunteer Opportunities)  
  3. Sponsors/Donors  

- **An estimate of the number of instances of each model:**  
  - Food Banks and Food Pantries: ~200  
  - Programs/Services: ~700
  - Sponsors/Donors: ~700  

- **Each model must have many attributes. Describe five of those attributes for each model that will be on the cards and that you can filter or sort by:**  

  **Food Banks / Pantries**  
  1. Name  
  2. Location (city, zip)  
  3. Capacity (meals served per week)  
  4. Hours of operation  
  5. Urgency level  

  **Programs (including Volunteer Opportunities)**  
  1. Program type (distribution, class, service, volunteer)  
  2. Eligibility (open, income-based, referral-based)  
  3. Frequency (weekly, monthly, one-time)  
  4. Cost (free, sliding scale, fixed fee)  
  5. Host organization (nonprofit, city, church, etc.)  

  **Sponsors / Donors**  
  1. Name of organization
  2. Contribution type (money, food, supplies)  
  3. Contribution amount  
  4. Affiliation (corporate, nonprofit, individual)  
  5. Past involvement (events or food banks supported)  

- **Instances of each model must connect to instances of at least two other models:**  
  - Food Banks connect to Programs and Sponsors/Donors  
  - Programs connect to Food Banks and Sponsors/Donors  
  - Sponsors/Donors connect to Food Banks and Programs  

- **Instances of each model must be rich with different media (e.g., feeds, images, maps, text, videos, etc.). Describe two types of media for each model:**  
  - Food Banks: photos of the bank, maps of their locations (link to Google Maps)
  - Programs: flyer images, videos of nutrition classes or volunteer events  
  - Sponsors/Donors: photos of donor logos, text describing their contributions

- **Describe three questions that your site will answer:**  
  1. Which food banks near me are most in need right now?  
  2. What food distribution programs, classes, or volunteer opportunities are happening this week?  
  3. Which organizations or sponsors are supporting local food banks and in what ways?  

- **Repository URL:**  
  https://gitlab.com/OdinLimaye/cs373-fall-2025-55085_07  

---  

## Members
| Name             | EID    | GitLab ID        |  
|----------------- |--------|------------------|  
| Odin Limaye      | oal355 | OdinLimaye       |  
| Francisco Vivas  | fv3836 | dafrancc         |  
| Christine Dominic| cd37728| christinedominic |  
| Mahika Dawar     | md44935| mahikad          |  
| Jose Lopez       | jl82838| j-o-lopez        |  

---  

## Phase One
- **Git SHA:**
cb2d4709ef1a336b3a94522dc83e39f7a5dea495
- **Project Leader: Odin Limaye**  
  - Responsibilities: Setting up the project repository, domain name, AWS hosting, and delegating tasks. 
- **GitLab Pipelines:**
https://gitlab.com/OdinLimaye/cs373-fall-2025-55085_07/-/pipelines  
- **Website:** 
https://foodbankconnect.me

### Time Tracking
| Member            | Estimated Hours | Actual Hours |  
|-------------------|-----------------|--------------|  
| Odin Limaye       | 11.5            | 16           |  
| Francisco Vivas   | 11.5            | 12           |  
| Christine Dominic | 12.0            | 12.5         |  
| Mahika Dawar      | 12              | 13           |  
| Jose Lopez        | 12              | 14           |  

**Comments:** None  

---  

## Phase Two
- **Git SHA:**
b7c5a82b3269088fc56aac2129c680a560645d69
- **Project Leader: Francisco Vivas** 
  - Responsibilities: Delegating tasks to the group members and setting up the backend and database servers. 
- **GitLab Pipelines:**
https://gitlab.com/OdinLimaye/cs373-fall-2025-55085_07/-/pipelines  
- **Backend API Link:**
https://api.foodbankconnect.me/v1/
- **Website:**
https://foodbankconnect.me
- **Postman (API Docs Link):**
https://www.postman.com/downing-group-7/dafrancc-s-workspace/collection/uhwer5y/food-bank-api-v2

### Time Tracking
| Member            | Estimated Hours | Actual Hours |  
|-------------------|-----------------|--------------|  
| Odin Limaye       | 17              | 27           |  
| Francisco Vivas   | 19              | 28           |  
| Christine Dominic | 16              | 16.5         |  
| Mahika Dawar      | 18              | 20           |  
| Jose Lopez        | 20              | 19           |  

**Comments:** None

---  

## Phase Three
- **Git SHA:**  
- **Project Leader: Mahika Dawar**  
  - Responsibilities: Dividing tasks between group members, implement searching/filtering, and front end styling improvements.
- **GitLab Pipelines:**
https://gitlab.com/OdinLimaye/cs373-fall-2025-55085_07/-/pipelines  
- **Backend API Link:**
https://api.foodbankconnect.me/v1/
- **Website:**  
https://foodbankconnect.me
- **Postman (API Docs Link):**
https://www.postman.com/downing-group-7/dafrancc-s-workspace/collection/uhwer5y/food-bank-api-v2

### Time Tracking
| Member            | Estimated Hours | Actual Hours |  
|-------------------|-----------------|--------------|  
| Odin Limaye       | 16              | 16           |  
| Francisco Vivas   |                 |              |  
| Christine Dominic |                 |              |  
| Mahika Dawar      | 15              | 19           |  
| Jose Lopez        |                 |              |  

**Comments:** None

---  

## Phase Four
- **Git SHA:**  
- **Project Leader:**  
  - Responsibilities:  
- **GitLab Pipelines:**  
- **Website:**  

### Time Tracking
| Member            | Estimated Hours | Actual Hours |  
|-------------------|-----------------|--------------|  
| Odin Limaye       |                 |              |  
| Francisco Vivas   |                 |              |  
| Christine Dominic |                 |              |  
| Mahika Dawar      |                 |              |  
| Jose Lopez        |                 |              |  

**Comments:**  
