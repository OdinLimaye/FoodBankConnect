# Summary of AI Interactions

## List the tools used
The AI tools we used during phase one were ChatGPT and Claude.

## Debugging help
Debugging was the main reason we consulted AI during this phase of the project. Not all of 
us were familiar with JavaScript, so our syntax when working with the language was not always 
perfect. This would lead to bugs relating to small issues such as dangling quotations, improper
bracketing, missing semi-colons, and many other syntactical flaws. Since we were not as fluid 
in the JavaScript as we are in Python, our code also had more small bugs than normal. When 
encountering a runtime error, we would send the error to the AI to get a more detailed description 
of the error along with probable causes of it. This allowed us to quickly isolate logic errors in our 
code or language-specific semantics that were causing bugs.

## Conceptual clarification
Besides debugging, conceptual learning and content explanations were the most common
reasons we had for using AI. When we were learning JavaScript, AI was very helpful in 
breaking down how the language works, explaining its structure, format, and various data 
structures. AI was also useful in regards to explaining how GitLab's API can be accessed. AI 
explained how JavaScript has built-in functions to perform these types of calls, along with 
explanations of JSON objects and how they work.

## Code improvement
AI helped us improve our code by making recommendations specific to JavaScript that we otherwise 
wouldn't have known. We weren't aware of how exactly Promises and parallel/asynchronous functions worked 
until an AI recommended we make use of these concepts as an optional way to improve our already-correct 
code's efficiency. We then inquired as to the logic behind these mysteriously powerful tools in JavaScript, and 
AI explained the concepts to us. AI also helped format our CSS and HTML by giving suggestions on proper spacing 
and indentation for various tags - <p>, <h>, etc. This helped our code become more readable and easy-on-the-eye.

## Alternative approaches
AI provided us with one alternative approach in particular that ended up being very useful. Originally, we were
writing all of our CSS and JavaScript in-line in our HTML files, but this was causing immense amounts of clutter
that made the files very difficult to read. We asked AI if there was a better way to approach our CSS and JS code, and 
the AI recommended that we create separate files for our in-line code. This allowed us to have clean, separate JS and 
CSS files. The AI also gave us a hint on how to properly connect the HTML file to the code that we moved out of it.

---

# Reflection on Use

## What specific improvements to your code or understanding came from this AI interaction?
Our code became much cleaner and better organized. It was also made to be slightly more efficient after implementing 
an AI's suggestion in regards to JavaScript's handling of "promises" and asynchronous code, but the most significant 
improvements were to style and format. We also had greatly improved understandings of the concepts at play after having 
the AI explain them to us. The AI helped us actively learn in regards to API's, JavaScript, and CSS. This helped us write 
our own code since our knowledge of the underlying programming languages and Internet concepts had become stronger.

## How did you decide what to keep or ignore from the AI’s suggestions?
We used our general understanding of the project and of programming to deduce when to reject or accept the AI's suggestions.
For example, some styling and formatting suggestions from the AI were way overboard, trying to fix problems that didn't 
really exist in the first place. We just used common sense to realize when the AI was being extreme and no longer helpful. 
There were also instances where the AI was making recommendations that would over-optimize our code. We're not sure whether or 
not our code would have become more efficient after implementing these suggestions, but it made the code much harder to understand. 
So, we decided against it since our code was already running efficiently enough for our purposes.

## Did the AI ever produce an incorrect or misleading suggestion? How did you detect that?
Yes, the AI did produce incorrect suggestions, particularly in regards to GitLab's API. ChatGPT seemed to fail to understand how queries
worked in GitLab's API since I don't think we ever got a truly correct explanation from ChatGPT on how it works. After digging around in 
the GitLab documentation, we were able to confirm that the AI was giving us bad information. The AI kept suggesting that queries and filters 
that were nowhere to be found were actually supported by GitLab. We detected this was wrong after our code didn't work as suggested by the 
AI. This led us to the GitLab documentation, which cleared things up.

---

# Evidence of Independent Work

## Paste a before-and-after snippet showing where you changed your own code in response to AI guidance.
Before:
getIssuesOpened(PROJECT, PER_PAGE, team);
getIssuesClosed(PROJECT, PER_PAGE, team);
getCommits(PROJECT, PER_PAGE, team);


After:
Promise.all([getIssuesOpened(PROJECT, PER_PAGE, team), 
             getIssuesClosed(PROJECT, PER_PAGE, team), 
             getCommits(PROJECT, PER_PAGE, team)]);

## In 2–3 sentences, explain what you learned by making this change.
We learned that JavaScript uses the concept of promises when it comes to making calls over the internet. Since making such calls effectively 
blocks the program, JS makes "promises" as to what will eventually be returned so that the flow of control can continue without waiting on 
a single internet operation. Finally, we learned that separate code which is not dependent on other code does not need to wait for these 
promises to be fulfilled, allowing the independent sections of code to be run in parallel, vastly improving efficiency.

---

# Integrity Statement

"We confirm that the AI was used only as a helper (explainer, debugger, reviewer) and not as a code generator. All code submitted is our own work."
