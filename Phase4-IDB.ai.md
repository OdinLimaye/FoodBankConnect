# Summary of AI Interactions

## List the tools used
The AI tools we used during phase four were ChatGPT and CoPilot.

## Debugging help
The main use of AI for debugging in this phase was in regards to YML, our CI pipelines, and then the D3 library we used for visualizations. Any time our pipeline would fail unexpectedly, we would have AI review the pipeline output to ascertain the error and the most probable cause. This was helpful since often the pipeline output would be long and unwieldy. For our YML, AI helped us discover some errors in regards to when tests run based on file changes in certain areas of our code base (only runs tests when changes are made to the source code of the frontend). Lastly, none of us had used D3 before, so naturally, our code that made use of it had some errors after our initial write-up. AI helped spot these errors and help us learn the proper syntax for using D3 for our visualizations.

## Conceptual clarification
Not much conceptual clarification from AI was needed during this phase of the project. There was some minor conceptual explanation from AI in regards to D3, but that's about it.

## Code improvement
AI was able to help us improve our code, especially in regards to testing. We went through and looked at all of our Postman JavaScript test cases in order to improve them for the final submission. We had AI look over them and determine if they could be approved, and there were many subtleties of JavaScript of which we were unaware that allowed for more precise testing. AI suggested that we make these changes to our tests.

## Alternative approaches
AI did suggest alternative methods than D3 since we were having bugs with our visualizations at first, but we were eventually able to find the source of these bugs. So, we ended up not taking AI's alternative suggestions.

---

# Reflection on Use

## What specific improvements to your code or understanding came from this AI interaction?
Our Postman scripts to run tests on our API were improved in precision by UT since suggestions were made that allowed us to improve the exactness of our tests. This allowed us to test more fine tuned details of the JSON returned by our API.

## How did you decide what to keep or ignore from the AI’s suggestions?
We used common sense and our knowledge of the scope of the project to determine which AI suggestions were 
neither realistic nor feasible. For example, when AI recommended that we use a different library than D3 for our visualizations after we faced many bugs, we chose to ignore this since the project specifications required that we use D3.

## Did the AI ever produce an incorrect or misleading suggestion? How did you detect that?
On this phase of the project, no. This phase was much smaller in scope than the others, so we had very little interaction with AI during our work. Thus, no glaringly obvious incorrect suggestions were made since there were so few suggestions in the first place.

---

# Evidence of Independent Work

## Paste a before-and-after snippet showing where you changed your own code in response to AI guidance.
Before:
pm.expect(jsonData).to.have.property("items");
pm.expect(item).to.have.property("services");
pm.expect(item).to.have.property("languages");

After:
pm.expect(jsonData).to.have.property("items").that.is.an("array");
pm.expect(item).to.have.property("services").that.is.an("array");
pm.expect(item).to.have.property("languages").that.is.an("array");

## In 2–3 sentences, explain what you learned by making this change.
We learned that in JavaScript, you can add another test specification called ".that.is.an("array")" in order to test whether or not a specific attribute is an array type variable. This improved our code since we originally just checked that all of the attributes existed, not that they were of the correct form. Making this change taught us that we should look into the syntax of the language we use for testing more closely.

---

# Integrity Statement

"We confirm that the AI was used only as a helper (explainer, debugger, reviewer) and not as a code generator. All code submitted is our own work."
