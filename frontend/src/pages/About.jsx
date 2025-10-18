import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const About = () => {
  const [teamData, setTeamData] = useState([
    { firstName: "Odin", fullName: "Odin Limaye", emails: ["odinlimaye1@gmail.com", "odin@cs.utexas.edu"], userID: "29883443", commits: 0, issuesOpened: 0, issuesClosed: 0 },
    { firstName: "Mahika", fullName: "Mahika Dawar", emails: ["mahika.dawar@utexas.edu"], userID: "30052392", commits: 0, issuesOpened: 0, issuesClosed: 0 },
    { firstName: "Jose", fullName: "Jose Lopez", emails: ["jl82838@utexas.edu"], userID: "29919402", commits: 0, issuesOpened: 0, issuesClosed: 0 },
    { firstName: "Christine", fullName: "Christine Dominic", emails: ["cdominic@cs.utexas.edu"], userID: "30022393", commits: 0, issuesOpened: 0, issuesClosed: 0 },
    { firstName: "Francisco", fullName: "Francisco Vivas", emails: ["xenonaught@gmail.com", "ceo@dafrancc.com"], userID: "25760273", commits: 0, issuesOpened: 0, issuesClosed: 0 },
  ]);

  useEffect(() => {
    const PROJECT = "74614252";
    const PER_PAGE = 100;

    async function fetchData() {
      // Reset counts for all members
      const updatedData = teamData.map(member => ({
        ...member,
        commits: 0,
        issuesOpened: 0,
        issuesClosed: 0
      }));

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
          This site's purpose is to connect volunteers, donors, and food
          banks in order to increase their ability to work with one
          another to achieve the common goal of alleviating hunger in
          impoverished communities. We want food banks to be able to
          increase their visibility so that people in need of their
          services know about them and what they offer. This site also
          allows food banks to increase their volunteer and sponsor
          numbers by displaying relevant information to those fields. We
          want people looking to volunteer to be able to find a multitude
          of programs and opportunities in which they can enroll. Lastly,
          we want possible sponsors and donors to find organizations
          towards which they can put funding and support. <br /><br />
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
                let bio = "";
                let responsibilities = "";

                switch (member.firstName) {
                  case "Odin":
                    bio = (
                      <>
                        I'm a Junior at UT Austin, and I'm majoring in Math and Computer Science. In my free time, I
                        like reading books, gardening, and hiking. You can find out more about me at my personal website:{" "}
                        <a href="https://odinlimaye.com">odinlimaye.com</a>
                      </>
                    );
                    responsibilities = "My main responsibilities have been handling our site's domain name and hosting on Amazon Web Services, along with front-end web development involving our API.";
                    break;
                  case "Francisco":
                    bio = "I'm a Junior at UT Austin, but I externally transferred from Lone Star College - Montgomery and I am majoring in Computer Science. I like to play video games, watch movies and TV shows, exercise, cook, and be with family.";
                    responsibilities = "I worked on the Postman API, and I worked on the splash page, ensuring that it looks clean and modern. I worked on the HTML, CSS, and Javascript.";
                    break;
                  case "Mahika":
                    bio = "I'm a Junior at UT Austin majoring in Computer Science, and minoring in Applied Statistical Modeling. I enjoy trying new recipes, dancing, and playing pickleball outside of class!";
                    responsibilities = "I worked on building the instance pages mostly, as well as tweaking the CSS to clean up the website so it had a sleeker look. In this phase, I mostly worked on the front-end.";
                    break;
                  case "Jose":
                    bio = "I'm a Junior at UT Austin and I'm majoring in Computer Science. In my freetime, I enjoy watching shows or movies, listening to music, and play video games.";
                    responsibilities = "My main responsibilities have been working in the front end on model and instance pages.";
                    break;
                  case "Christine":
                    bio = "I'm a Junior at UT Austin studying Computer Science, Canfield Business, and Finance. Outside of class I enjoy trying out matcha spots, watching F1, and reading books.";
                    responsibilities = "My main responsibilities included designing and styling the site using the Bootstrap CSS framework to ensure a clean, responsive layout across all devices. I have also contributed to building and refining the instance pages, focusing on user experience!";
                    break;
                }

                return (
                  <tr key={member.firstName} id={member.firstName}>
                    <td>{member.fullName}</td>
                    <td><img src={`images/portraits/${member.firstName}Portrait1.jpg`} alt={member.fullName} className="img-fluid" /></td>
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
        <p>
          <strong>GitLab:</strong><br />
          We used GitLab as our method of source control and collaborative integration. We used GitLab's Continuous
          Integration features to manage our code's organization, structure, and functionality. Our GitLab repo also
          automatically deploys to our hosting service due to our build configuration.<br /><br />
          <strong>Amazon Web Services:</strong><br />
          We used AWS to host our site on its CloudFront platform, using its S3 bucket structure to manage our static web
          pages. We also used AWS to obtain our SSL certificate, allowing our site to transfer data through HTTPS.<br /><br />
          <strong>Namecheap:</strong><br />
          We used Namecheap to obtain our domain name and to verify our SSL certificate. We also currently use Namecheap
          to redirect HTTP and www sub-domain calls to the standard HTTPS version of our site.
        </p>

        <h2 className="mt-4">Optional Tools Used</h2>
        <p>
          <strong>Bootstrap:</strong><br />
          We used Bootstrap as our CSS framework, mainly making use of its pre-made objects such as navigational bars,
          buttons, and tables. We also used Bootstrap's formatting tools to create consistently styled headers,
          paragraphs, and text boxes.<br /><br />
        </p>

        <h2 className="mt-4">Links</h2>
        <p>
          <a href="https://gitlab.com/OdinLimaye/cs373-fall-2025-55085_07">GitLab Repository</a><br />
          <a href="https://www.postman.com/downing-group-7/dafrancc-s-workspace/overview">Postman API</a>
        </p>
      </main>

      <footer className="text-center py-3 bg-primary text-white">&copy; 2025 FoodBankConnect</footer>
    </div>
  );
};

export default About;
