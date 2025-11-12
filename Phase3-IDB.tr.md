# Technical Report

This report provides sufficient detail for an uninitiated development team to take over work on the project.  
It is written for **software developers** (not end-users).

---

## 1. Motivation & Purpose

This site helps solve the problem that many low-income and underserved communities face: lack of access to food. This site connects people in need of food-related services to nearby food banks/pantries that can provide them with assistance. This site also serves the purpose of allowing volunteers, organizations, and sponsors to search for programs and food banks that can benefit from their time and contributions. Our final motivation behind this site is to allow food banks to increase their visibility and search for donor and volunteer aid in order to continue providing the vital services they do.

---

## 2. User Stories

- **Story 1:**  
  Our customer group suggested having an option to filter/sort foodbanks by their urgency level. We had actually already implemented this by the time the user story came in since we have filtering for each model page. And, one of the filtering options was over the instance attribute "urgency" for foodbanks, so this ended up answering their request impicitly. 
  Estimated Time: N/A
  Actual Time: N/A

- **Story 2:**  
  Our customer group pointed out that our search mechanism produced results with a style was difficult to read and understand at a glance. We fixed this by changing the color scheme - originally it was white-on-white - and by arranging the results in a more neat, grid-like fashion. This made the UI much easier to read and use.
  Estimated Time: 15 minutes
  Actual Time: 25 minutes

- **Story 3:**  
  Our customer group pointed out a hold-over error from Phase 2 that we had yet fix with Phase 3 features: our programs' service types fields were not properly populated, nor were they working with the filters correctly. This was fixed by our scrapers by finding more accurate and varied results based on the websites for these programs. The filtering, once implemented, then picked up these changes naturally, and it resolved the issue.
  Estimated Time: 30 minutes
  Actual Time: 20 minutes

- **Story 4:**  
  Our customer group noticed that the instance cards in our Foodbanks and Sponsors model pages were not easily distinguishable from one another since there were no borders between the cards. We fixed this by adding in light borders between the instances to make the card-like nature of the instances more readily apparent.
  Esimated Time: 5 minutes
  Actual Time: 5 minutes

- **Story 5:**  
  Our customer group had a bit of a misunderstanding of our sponsors model page. They mistakenly thought that it listed sponsorship opportunities for users, whereas it actually lists former and current supporters of the foodbank instances we have displayed on our site. However, we did implement their side point, which was to have tiers of contribution levels for each sponsors. We added this feature through our scrapers as an attribute of each sponsor instance.
  Estimated Time: 20 minutes
  Actual Time: 35 minutes

- **Story 6**
  Our customer group requested that foodbanks and programs have the ability to be sorted based on geogrpahical location. We chose to implement filtering and not sorting, but we did adapt this request for filtering by having filtering options by city and state for both foodbanks and programs.
  Estimated Time: 30 minutes
  Actual Time: 40 minutes


---

## 3. RESTful API Documentation

- **URL:** https://www.postman.com/downing-group-7/dafrancc-s-workspace/collection/uhwer5y/food-bank-api-v2
- For each model, we have GET requests for obtaining either a specific instance via its ID, or you can get all instances for that model. We also have a filtering endpoint and a searching endpoint for organizing instance pages on the frontend.

### GET Examples

**Foodbanks**

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

* `GET /v1/sponsors/<id>` — returns a single sponsor instance.

   * Query params: `ID` (int)
   * Example: `https://api.foodbankconnect.me/v1/sponsors/123`

**Searching**
(Fill in endpoint parameters)

```json
Fill in example
```

**Filtering**
(Fill in endpoint parameters)

```json
Fill in example
```


---

## 4. Models

- **Food Banks:**  
  This model holds all of the food banks and pantries that provide food-related services.

- **Programs:**  
  This model holds all of the programs that involve assisting food banks such as food drives.

- **Sponsors:**  
  This model holds all of the sponsoring organizations that support the food banks by making donations or by leading programs.

---

## 5. Instances

- **Food Banks:**  
  The food bank instances are individual food pantries. Their webpages contain links to the food banks' official websites as well images of the banks and/or their logos. Their attributes are as follows: name, city, zip, capacity, open hours, services, about, and urgency.

- **Programs:**  
  The program instances are individual programs/events. Their webpages contain links to the official websites for the programs as well as photos of flyers and other descriptive images relating to the event. Their attributes are as follows: name, type, eligibility, frequency, cost, about, and hosting foodbank.

- **Sponsors:**  
  The sponsor instances contain the corporations, businesses, charities, etc. that contribute to food banks either through monetary donations, food donations, or by hosting programs. Their webpages contain images of their logos as well as links to their official websites. Their attributes are as follows: name, contribution, about, contribution amount, contribution unit, affiliation, and past involvement (which itself contains the type of event, name, and date).

---

## 6. Architecture

So far, our site's overall architecture is a hierarchical file structure containing relevant subdirectories for each model. We have a Splash page (index.html) that links to all of the model pages as well as the Postman API and the about page (about.html). The splash/home page contains a slideshow running through various instance pages, and each webpage contains a navigation bar containing links to the home page, each model page, and the about page.

The front-end framework we used was Bootstrap. We used Bootstrap to obtain convenient CSS structures and formatting that we use on every single web page. We do not have a back-end framework yet since this is just phase one.

Instance pages contain relevant links to other instance pages of the same model as well as links to their respective parent model pages. Instance pages contain many forms of media, particularly links to official webpages and maps. There are also images in order to immediately familiarize viewers with the instance in question.

The about page runs a JavaScript file that dynamically retrieves the number of commits, issues created, and issues closed of each team member. It does so by using the GitLab API to access all of the repo's commits and issues, and then it tallies up the representatives in these categories for each team member. GitLab offers a query of issues opened by specific authors, but the other two categories do not have such queries. So, manual filtering by authors' GitLab IDs and by authors' emails is performed in the JavaScript file to complete this task.

---

## 7. Toolchains & Development Workflow

- **Languages:** HTML, JavaScript, CSS, and Make
- **Frameworks:** Bootstrap CSS
- **Libraries:** We made use of the Bootstrap public library for CSS objects and formatting.
- **Build tools:** We have a Makefile that condenses pushing and pulling, a .yml that runs pipelines to upload our source files to the AWS hosting site automatically, and a .gitignore that keeps our working space clean and free from clutter.
- **Testing tools:** Currently, our Postman API is set up to be able to test our API once it is implemented, which will happen in phase 2.
- **Version control:** We made use of GitLab for source control. We have a GitLab project/repository that contains the most up-to-date version of our site as well as all of our source code and media files.

---

## 8. Hosting & Deployment

We obtained our domain name from Namecheap.com, where we currently redirect our domain name and its www subdomain to our account on Amazon Web Services' CloudFront hosting service. On Namecheap, we also have records for each of the two domains (www and non-www) in order to validate our SSL certificate, which gives our URL HTTPS access instead of HTTP access. The hosting of our site occurs on Amazon Web Services where we have an S3 bucket set up for static website hosting, which is handled by CloudFront. CloudFront is also the platform we used to obtain our SSL
certificate.

We have a .yml file set up to automatically upload the public subdirectory of our repository upon pushes to the main branch of our GitLab repository. The mapping from our public folder to the S3 bucket is one-to-one; their contents are identical. To allow for this, we have GitLab listed as an IAM on our AWS account, and we have the relevant keys stored in our GitLab repo's environment variables. We also have a Makefile that performs basic operations relating to pushing and pulling from the repository. Our .gitignore currently just ignores instances of the Git log text file, but we foresee it being used on a larger scale in future phases.

Our deployment, which is quite simple for phase one due to being entirely static, is handled entirely by GitLab's CI pipeline upon pushes to the main branch. After the pipeline runs successfully, the public subdomain is uploaded to the S3 bucket, and CloudFront's cache is cleared so that the new files can come into effect immediately.

---

## 9. Challenges & Solutions

**Challenge 1:** (Fill in challenge)

- (Fill in resolution)

**Challenge 2:** (Fill in challenge)

- (Fill in resolution)

---

## 10. Database and Scraping


---

## 11. Paging


---

## 12. Filtering and Searching

