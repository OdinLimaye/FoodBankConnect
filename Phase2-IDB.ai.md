# Summary of AI Interactions

## List the tools used
The AI tools we used during phase two were ChatGPT and Claude.

## Debugging help
A big reason we used AI this phase as well was to help with debugging. Since we were working across multiple parts of the stack (Flask backend, HTML/CSS/JS frontend), there were quite a few issues that popped up. When we’d hit weird errors — like Flask routes not working as expected, JS not rendering properly, or CSS breaking layouts — AI helped explain what was going wrong and what to try instead. This saved a ton of time compared to just trial and error.

## Learning New Tech
A lot of us were new to Flask and AWS, so we used AI to understand how routing, templates, and database models worked. It also helped us connect to a Postgres database and figure out how to run queries properly. Same thing with AWS — ChatGPT helped us understand how S3 and EC2 worked without having to read through tons of documentation. It gave us straight-to-the-point explanations, which helped a lot.

# Conceptual Help
When it came to writing unit tests for our Flask app, we weren’t sure where to start. AI gave us examples for how to test different routes and functions using pytest and unittest, and also showed how to mock data where needed. On top of that, we used AI to learn the basics of Selenium and BeautifulSoup for scraping program and sponsor data. It explained how to structure scraping scripts, deal with HTML structure, and handle edge cases like missing elements.

## Code improvement
One of the biggest ways AI helped us improve our code this time was by helping us reorganize to implement global styling. Initially, we were styling buttons directly inside each page’s CSS file or even inline in the JSX, which made things really repetitive and hard to manage. After asking AI for a better way to handle design consistency, it suggested creating a shared global CSS file specifically for button styles (like .glass-button or .gradient-button). We took that advice and made a centralized file with reusable class names for different button styles, which we then applied across all pages. This change made our design easier to update — now if we want to tweak the look of all buttons across the site, we just do it once in the shared file instead of editing 5+ components.

## Alternative approaches
One of the main ways in which we asked AI to help us produce an alternative approach was when we were trying to scrape through various HTML pages to find attributes for our database. We were having trouble with this since web pages were all structured differently, with different components in different places. Embedded components also caused us trouble. Then, upon asking AI for a better method, it recommended the use of the 
Google API query to find attributes not able to be located easily in the initial source. This ended up being 
a semi-effective (definitely easier) alternative method.

---

# Reflection on Use

## What specific improvements to your code or understanding came from this AI interaction?
Our biggest improvements were in understanding how to set up and test our Flask app, plus cleaning up the way we scrape and store data. We also got better at debugging both backend and frontend issues. Instead of using AI to solve problems, we used it to explained the why behind why we were encountering certain issues, which made us know more about where to look to find the root cause of the issue so we could debug more easily.

## How did you decide what to keep or ignore from the AI’s suggestions?
We mostly stuck to suggestions that were easy to understand and didn’t add unnecessary complexity. For example, sometimes it recommended testing frameworks or deployment setups that didn’t match our current scope.

## Did the AI ever produce an incorrect or misleading suggestion? How did you detect that?
AI wasn’t perfect — especially with AWS and some scraping examples. A couple of the Flask routes it suggested were outdated, and it once gave us incorrect syntax for setting environment variables on EC2. We realized something was off when the commands didn’t work, so we double-checked with the AWS docs and Stack Overflow. For scraping, AI sometimes gave us selectors that wouldn’t work because the HTML structure was dynamic or hidden behind JavaScript. We figured this out through testing and added manual fallbacks.

---

# Evidence of Independent Work

## Paste a before-and-after snippet showing where you changed your own code in response to AI guidance.
Before:
def test_card_click(self):
    self.driver.get("https://foodbankconnect.me/foodbanks")
    card = self.driver.find_element(By.CLASS_NAME, "card")
    card.click()
    self.assertTrue("foodbanks" in self.driver.current_url)

After:
def test_first_card_clickable(self):
    self.driver.get(self.base_url)
    card = self.wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "card")))
    initial_url = self.driver.current_url

## In 2–3 sentences, explain what you learned by making this change.
When we first wrote the test, it only worked sometimes. However, if the page was slow or the cards hadn’t loaded yet, it would fail. After using AI to learn more about how Selenium actually works, we realized we needed to wait for the elements to be clickable, not just present. AI showed us how to use WebDriverWait and expected_conditions, which made our test way more reliable and useful. It also helped us understand how Selenium mimics real users. For example, it waits for stuff to load and makes sure clicks actually go somewhere. Overall, we feel way more confident writing tests now using Selenium.

---

# Integrity Statement

"We confirm that the AI was used only as a helper (explainer, debugger, reviewer) and not as a code generator. All code submitted is our own work."
