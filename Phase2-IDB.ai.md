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


---

# Reflection on Use

## What specific improvements to your code or understanding came from this AI interaction?


## How did you decide what to keep or ignore from the AI’s suggestions?


## Did the AI ever produce an incorrect or misleading suggestion? How did you detect that?


---

# Evidence of Independent Work

## Paste a before-and-after snippet showing where you changed your own code in response to AI guidance.


## In 2–3 sentences, explain what you learned by making this change.


---

# Integrity Statement

"We confirm that the AI was used only as a helper (explainer, debugger, reviewer) and not as a code generator. All code submitted is our own work."
