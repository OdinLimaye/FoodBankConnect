# Technical Report

This report provides sufficient detail for an uninitiated development team to take over work on the project.  
It is written for **software developers** (not end-users).

---

## 1. Motivation & Purpose

This site helps solve the problem that many low-income and underserved communities face: lack of access to food. This site connects people in need of food-related services to nearby food banks/pantries that can provide them with assistance. This site also serves the purpose of allowing volunteers, organizations, and sponsors to search for programs and food banks that can benefit from their time and contributions. Our final motivation behind this site is to allow food banks to increase their visibility and search for donor and volunteer aid in order to continue providing the vital services they do.

---

## 2. User Stories

- **Story 1:**  
  Our customer group suggested replacing plain links on our website with more descriptive text so that customers know the purpose of the links before clicking them. We estimated this change would take around 5 minutes, and after implementation, we found that it did indeed take about that long since it was a minor adjustment.

- **Story 2:**  
  Our customer group suggested adding basic information about our programs to the programs model page so that people seeking volunteer opportunities can quickly find resources. We estimated this would take 10 minutes to implement, but it ended up taking around 15 minutes. We added all of the program attributes to the cards on the model page grid for quick, at-a-glance information.

- **Story 3:**  
  Our customer group recommended sorting programs by the skills they require and adding a filtering option to allow users to search for programs that match their specific skill sets. After a dialogue with the customer group, we concluded that this feature was out of scope for phase one, since filtering and sorting are not scheduled for implementation until phase two.

- **Story 4:**  
  Our customer group recommended sorting food banks by proximity to users, allowing them to search for nearby locations. After a dialogue with the customer group, we concluded that this feature was also out of scope for phase one, since search features are not scheduled for implementation until phase two.

- **Story 5:**  
  Our customer group suggested adding an option on the food banks model page to show only food banks that are currently open, so people in need of food can find help in a timely manner. We thought this was an especially good idea, but it falls out of scope for phase one since filtering features are not scheduled until phase two. However, we decided to save this user story for a future phase, as it adds significant value for users.


---

## 3. RESTful API Documentation

- **Note:** Not implemented in phase one
- **URL:** https://www.postman.com/downing-group-7/dafrancc-s-workspace/overview
- For each model, we have GET API requests for obtaining either a specific instance via its ID, or you can get all instances for that model.

### GET Examples

**All Foodbanks:**

```json
[
    {
        "id": 1,
        "name": "Austin Central Food Bank",
        "city": "Austin",
        "zip": 78705,
        "capacity": 10000,
        "open_hours": {
            "monday": "9:00 AM - 3:00 PM",
            "tuesday": "9:00 AM - 3:00 PM",
            "wednesday": "9:00 AM - 3:00 PM",
            "thursday": "9:00 AM - 3:00 PM",
            "friday": "9:00 AM - 3:00 PM",
            "saturday": "9:00 AM - 3:00 PM",
            "sunday": "Closed"
        },
        "urgency": 1
    },
    {
        "id": 2,
        "name": "Hyde Park Food Bank",
        "city": "Austin",
        "zip": 78706,
        "capacity": 3000,
        "open_hours": {
            "monday": "9:00 AM - 3:00 PM",
            "tuesday": "9:00 AM - 3:00 PM",
            "wednesday": "9:00 AM - 3:00 PM",
            "thursday": "9:00 AM - 3:00 PM",
            "friday": "9:00 AM - 3:00 PM",
            "saturday": "Closed",
            "sunday": "Closed"
        },
        "urgency": 2
    }
]
```

**All Programs:**

```json
[
    {
        "id": 1,
        "name": "Longhorn Meal Initiative",
        "type": "distribution",
        "eligibility": "open",
        "frequency": "weekly",
        "cost": "fixed fee",
        "host_organization": "University of Texas at Austin"
    },
    {
        "id": 2,
        "name": "Aggie Meal Front",
        "type": "volunteer",
        "eligibility": "income-based",
        "frequency": "monthly",
        "cost": "free",
        "host_organization": "Texas A&M University"
    }
]
```

**All Sponsors:**

```json
[
    {
        "id": 1,
        "name": "Google",
        "contribution": "money",
        "contribution_amount": "1000000",
        "contribution_unit": "USD",
        "affiliation": "corporate",
        "past_involvement": [
            {
                "type": "event",
                "name": "Google Food Drive",
                "date": "2021-06-01"
            },
            {
                "type": "food bank",
                "name": "Austin Central Food Bank",
                "date": "2023-11-24"
            }
        ]
    },
    {
        "id": 2,
        "name": "H-E-B",
        "contribution": "supplies",
        "contribution_amount": "250000",
        "contribution_unit": "USD",
        "affiliation": "corporate",
        "past_involvement": [
            {
                "type": "event",
                "name": "H-E-B Charity Run",
                "date": "2019-01-14"
            },
            {
                "type": "food bank",
                "name": "Austin Central Food Bank",
                "date": "2025-04-01"
            }
        ]
    }
]
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
  The food bank instances are individual food pantries. Their webpages contain links to the food banks' official websites as well as a map of their location. Their attributes are as follows: name, city, zip, capacity, open hours, and urgency.

- **Programs:**  
  The program instances are individual programs/events. Their webpages contain links to the official websites for the programs as well as photos of flyers and other descriptive images relating to the event. Their attributes are as follows: name, type, eligibility, frequency, cost, and hosting organization.

- **Sponsors:**  
  The sponsor instances contain the corporations, businesses, charities, etc. that contribute to food banks either through monetary donations, food donations, or by hosting programs. Their webpages contain images of their logos as well as links to their official websites. Their attributes are as follows: name, contribution, contribution amount, contribution unit, affiliation, and past involvement (which itself contains the type of event, name, and date).

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

**Challenge 1:** GitLab API did not offer queries to fetch issues closed and commits from specific authors. They only offered queries to search by author for number of issues opened.

- We performed quite a bit of JavaScript research online to learn the basics of the language, and then we used this knowledge to write code to filter the total commits and issues that GitLab's API returns by author name and email. We used principles of programming with which we had previous experience to tally up the data in an object-oriented manner since it was not done for us like with the number of issues opened.

**Challenge 2:** We needed a navigation bar at the top of each of our webpages to guide visitors to other important pages, but the CSS needed to create such a feature from scratch seemed daunting.

- We decided to begin implementing the Bootstrap CSS framework, hoping that it would provide assistance in this regard. After learning the basics of Bootstrap in more basic use cases, we researched Bootstrap structures online and found a navigation bar that suited our needs. So, we used our new knowledge of Bootstrap to add this feature while avoiding redundant CSS formatting from scratch.
