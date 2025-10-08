// Our repo's project ID and per page constant
const PROJECT = "74614252";
const PER_PAGE = 100;

// Array of each team member's first name, GiLab emails, and GitLab user ID
const team = [
    {firstName: "Odin", emails: ["odin@cs.utexas.edu"], userID: "29883443", commits: 0, issues_closed: 0},
    {firstName: "Mahika", emails: ["mahika.dawar@utexas.edu"], userID: "30052392", commits: 0, issues_closed: 0},
    {firstName: "Jose", emails: ["jl82838@utexas.edu"], userID: "29919402", commits: 0, issues_closed: 0},
    {firstName: "Christine", emails: ["cdominic@cs.utexas.edu"], userID: "30022393", commits: 0, issues_closed: 0},
    {firstName: "Francisco", emails: ["xenonaught@gmail.com", "ceo@dafrancc.com"], userID: "25760273", commits: 0, issues_closed: 0},
];

// Handles displaying each member's number of issues opened
async function getIssuesOpened(PROJECT, PER_PAGE, team) {
    // Get all of the issues opened by each different author
    for (let i = 0; i < team.length; i++) {
        let json_issues = [];
        let page = 1;
        let count = 0;

        // Get issues in groupings of PER_PAGE per page
        do {
            const ISSUES = `https://gitlab.com/api/v4/projects/${PROJECT}/issues?author_id=${team[i].userID}&per_page=${PER_PAGE}&page=${page}`;
            const raw_http = await fetch(ISSUES);
            json_issues = await raw_http.json();

            count += json_issues.length;
            page++;
        } while (json_issues.length === PER_PAGE)

        // Display the data on the html file
        document.getElementById(`${team[i].firstName}IssuesOpened`).textContent = count;
    }
}

// Handles displaying each member's number of issues closed
async function getIssuesClosed(PROJECT, PER_PAGE, team) {
    // Tally up how many issues each author closed
    let json_issues = [];
    let page = 1;

    // Go through issues in groupings of PER_PAGE per page
    do {
        const CLOSED = `https://gitlab.com/api/v4/projects/${PROJECT}/issues?state=closed&per_page=${PER_PAGE}&page=${page}`;
        const raw_http = await fetch(CLOSED);
        json_issues = await raw_http.json();

        for (let i = 0; i < json_issues.length; i++) {
            for (let j = 0; j < team.length; j++) {
                // The closed_by field might be null if the issue was auto-closed
                if (json_issues[i].closed_by != null && String(json_issues[i].closed_by.id) === team[j].userID) {
                    // Found it and can move on to the next issue
                    team[j].issues_closed++;
                    break;
                }
            }
        }

        page++;
    } while (json_issues.length === PER_PAGE)

    // Update the number of issues closed per author after all issues have been checked
    for (let i = 0; i < team.length; i++) {
        document.getElementById(`${team[i].firstName}IssuesClosed`).textContent = team[i].issues_closed;
    }
}

// Handles displaying each member's number of commits
async function getCommits(PROJECT, PER_PAGE, team) {
    let json_commits = [];
    let page = 1;

    do {
        // Get commits from all members in groupings of 100 per page
        const COMMITS = `https://gitlab.com/api/v4/projects/${PROJECT}/repository/commits?per_page=${PER_PAGE}&page=${page}`;
        const raw_http = await fetch(COMMITS);
        json_commits = await raw_http.json();
        
        // Count up the commits from each member for this page
        for (let i = 0; i < json_commits.length; i++) {
            const current_email = json_commits[i].author_email;
            for (let j = 0; j < team.length; j++) {
                if (team[j].emails.includes(current_email)) {
                    team[j].commits++;
                    break;
                }
            }
        }

        page++;
    } while (json_commits.length === PER_PAGE)

    // Display each member's number of commits on the html page
    for (let i = 0; i < team.length; i++) {
        document.getElementById(`${team[i].firstName}Commits`).textContent = team[i].commits;
    }
}

Promise.all([getIssuesOpened(PROJECT, PER_PAGE, team), 
             getIssuesClosed(PROJECT, PER_PAGE, team), 
             getCommits(PROJECT, PER_PAGE, team)]);
