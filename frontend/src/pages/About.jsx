import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const About = () => {
  const [teamData, setTeamData] = useState([
    { firstName: "Odin", emails: ["odin@cs.utexas.edu"], userID: "29883443", commits: 0, issuesOpened: 0, issuesClosed: 0 },
    { firstName: "Mahika", emails: ["mahika.dawar@utexas.edu"], userID: "30052392", commits: 0, issuesOpened: 0, issuesClosed: 0 },
    { firstName: "Jose", emails: ["jl82838@utexas.edu"], userID: "29919402", commits: 0, issuesOpened: 0, issuesClosed: 0 },
    { firstName: "Christine", emails: ["cdominic@cs.utexas.edu"], userID: "30022393", commits: 0, issuesOpened: 0, issuesClosed: 0 },
    { firstName: "Francisco", emails: ["xenonaught@gmail.com", "ceo@dafrancc.com"], userID: "25760273", commits: 0, issuesOpened: 0, issuesClosed: 0 },
  ]);

  useEffect(() => {
    const PROJECT = "74614252";
    const PER_PAGE = 100;

    async function fetchData() {
      const updatedData = [...teamData];

      // Fetch issues opened for each member
      for (let i = 0; i < updatedData.length; i++) {
        let page = 1, count = 0, issues = [];
        do {
          const res = await fetch(
            `https://gitlab.com/api/v4/projects/${PROJECT}/issues?author_id=${updatedData[i].userID}&per_page=${PER_PAGE}&page=${page}`
          );
          issues = await res.json();
          count += issues.length;
          page++;
        } while (issues.length === PER_PAGE);
        updatedData[i].issuesOpened = count;
      }

      // Fetch closed issues
      let page = 1, closedIssues = [];
      do {
        const res = await fetch(
          `https://gitlab.com/api/v4/projects/${PROJECT}/issues?state=closed&per_page=${PER_PAGE}&page=${page}`
        );
        closedIssues = await res.json();
        for (let issue of closedIssues) {
          for (let member of updatedData) {
            if (issue.closed_by && String(issue.closed_by.id) === member.userID) {
              member.issuesClosed++;
            }
          }
        }
        page++;
      } while (closedIssues.length === PER_PAGE);

      // Fetch commits
      page = 1;
      let commits = [];
      do {
        const res = await fetch(
          `https://gitlab.com/api/v4/projects/${PROJECT}/repository/commits?per_page=${PER_PAGE}&page=${page}`
        );
        commits = await res.json();
        for (let commit of commits) {
          for (let member of updatedData) {
            if (member.emails.includes(commit.author_email)) {
              member.commits++;
            }
          }
        }
        page++;
      } while (commits.length === PER_PAGE);

      setTeamData(updatedData);
    }

    fetchData();
  }, []);

  return (
    <div className="about-page">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src="favicon.svg" alt="Icon" height="50" width="50" /> FoodBankConnect
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><Link className="nav-link active" to="/about">About</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/foodbanks">Food Banks</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/programs">Programs</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/sponsors">Sponsors</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="container my-5">
        <h1 className="mb-4">About the Site</h1>
        <p>
          This site's purpose is to connect volunteers, donors, and food banks in order to increase their ability to work with one another...
        </p>

        <h2 className="mb-4">Meet the Team</h2>
        <div className="table-responsive">
          <table id="TeamMembers" className="table table-striped table-bordered align-middle">
            <thead className="table-primary">
              <tr>
                <th>Name</th>
                <th>Photo</th>
                <th>Bio</th>
                <th>Major Responsibilities</th>
                <th>Number of Commits</th>
                <th>Number of Issues Opened</th>
                <th>Number of Issues Closed</th>
                <th>Number of Unit Tests</th>
              </tr>
            </thead>
            <tbody>
              {teamData.map(member => {
                // Original bios and responsibilities
                let bio = "";
                let responsibilities = "";
                switch (member.firstName) {
                  case "Odin":
                    bio = "I'm a Junior at UT Austin, majoring in Math and Computer Science...";
                    responsibilities = "Domain, AWS hosting, front-end web development using GitLab API.";
                    break;
                  case "Francisco":
                    bio = "Junior at UT Austin, externally transferred, Computer Science major...";
                    responsibilities = "Postman API, splash page, HTML/CSS/JS.";
                    break;
                  case "Mahika":
                    bio = "Junior at UT Austin, CS major, Applied Statistical Modeling minor...";
                    responsibilities = "Instance pages, front-end tweaks and CSS clean-up.";
                    break;
                  case "Jose":
                    bio = "Junior at UT Austin, CS major...";
                    responsibilities = "Front-end on model and instance pages.";
                    break;
                  case "Christine":
                    bio = "Junior at UT Austin, CS, Canfield Business & Finance...";
                    responsibilities = "Bootstrap styling, instance pages, user experience.";
                    break;
                }

                return (
                  <tr key={member.firstName} id={member.firstName}>
                    <td>{member.firstName}</td>
                    <td><img src={`images/portraits/${member.firstName}Portrait.jpg`} alt={member.firstName} className="img-fluid" /></td>
                    <td>{bio}</td>
                    <td>{responsibilities}</td>
                    <td>{member.commits}</td>
                    <td>{member.issuesOpened}</td>
                    <td>{member.issuesClosed}</td>
                    <td>0</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Data sources, tools, links */}
        <h2 className="mt-5">Data Sources</h2>
        <p>
          <a href="https://fdc.nal.usda.gov/api-guide">USDA</a><br />
          <a href="https://mealconnect.docs.apiary.io/#">MealConnect</a><br />
          <a href="https://www.centraltexasfoodbank.org/">CentralTexasFoodbank</a><br />
          <a href="https://www.findhelp.org/">FindHelp</a><br />
          <a href="https://www.austintexas.gov/page/get-help-food-access-today">AustinTexasGetHelpFoodAccessToday</a><br />
          <a href="https://projects.propublica.org/nonprofits/api">ProPublicaNonProfits</a>
        </p>

        <h2 className="mt-4">Tools Used</h2>
        <p>GitLab, AWS, Namecheap...</p>

        <h2 className="mt-4">Optional Tools Used</h2>
        <p>Bootstrap CSS framework...</p>

        <h2 className="mt-4">Links</h2>
        <p>
          <a href="https://gitlab.com/OdinLimaye/cs373-fall-2025-55085_07">GitLab Repository</a><br />
          <a href="https://www.postman.com/downing-group-7/dafrancc-s-workspace/overview">Postman API</a>
        </p>
      </main>

      {/* Footer */}
      <footer className="text-center py-3 bg-primary text-white">&copy; 2025 FoodBankConnect</footer>
    </div>
  );
};

export default About;
