# Summary of AI Interactions

## List the tools used
The AI tools we used during phase three were ChatGPT and CoPilot.

## Debugging help
The main use of AI for debugging in this phase was in regards to AWS and YML since these were the 
two most abstract and confusing tools we made use of during our project. And, we interfaced with 
these tools much more in this phase than we had in the past, so we needed explanations of error codes
and incorrect functionality from AI since we were working with very complicated tools. For example, we 
would give AI our logging output in order to determine what was going wrong with our batch jobs on AWS.
We also used AI to help us figure out why our YML was failing when run by the pipeline.

## Conceptual clarification
AI helped us understand the concepts relating to our API endpoints since we had to create a handful of
new endpoints during this phase. These endpoints all interacted directly with queries into our database, so 
we also used AI to understand the concepts behind how to query PostgreSQL databases for certain attributes
and combinations of attributes. AI also helped us with our Python program scrapers by explaining how libraries
like BeautifulSoup work behind the scenes in order to allow us to figure out where such libraries would be 
helpful and where they wouldn't, a task requiring conceptual understanding of the tools' functionality.

## Code improvement
AI helped a lot with code improvement, particularly in regards to testing. For example, AI helped us figure 
out how to use Python's open-with semantics to dump our JSON into temporary files to test that the scrapers
were working correctly before having our backend server run them and fill out database with the results. We 
also used AI to help with syntax in regards to our frontend code since we were still not super familiar with
React and its JSX formatted code.

## Alternative approaches
We frequently asked AI if there were easier approaches to problems that we were facing. Sometimes, the AI
confirmed that the challenging way we were doing it was required since easier methods would fail, but in 
other cases, AI would provide helpful alternatives that were either easier to implement or more efficient. 
For example, we were beginning to implement sorting and filtering in the frontend, but AI offered an alternative
in which we use the database's querying features to sort and filter in the backend before passing these results
to the frontend. Another example was when AI recommended using BeautifulSoup instead of JavaScript based web
crawling in our scrapers since this would vastly increase efficiency.

---

# Reflection on Use

## What specific improvements to your code or understanding came from this AI interaction?


## How did you decide what to keep or ignore from the AI’s suggestions?


## Did the AI ever produce an incorrect or misleading suggestion? How did you detect that?


---

# Evidence of Independent Work

## Paste a before-and-after snippet showing where you changed your own code in response to AI guidance.
Before:   



After:   


## In 2–3 sentences, explain what you learned by making this change.


---

# Integrity Statement

"We confirm that the AI was used only as a helper (explainer, debugger, reviewer) and not as a code generator. All code submitted is our own work."
