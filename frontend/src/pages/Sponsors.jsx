// Sponsors.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Sponsors.css";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer"
import SponsorCard from "../components/SponsorCard";

const sponsorsList = [
  {
    name: "Trader Joe's",
    image: "/images/trader-joes.png",
    alt: "Trader Joe's Logo",
    contribution: "Food Sourcing",
    contributionAmt: 180000,
    contributionUnit: "Pounds",
    affiliation: "Private Corporation",
    pastInvolvement: "Hope Food Pantry",
    detailsPage: "trader_joes",
  },
  {
    name: "Dragon's Lair Comics and Fantasy",
    image: "/images/d_lair.png",
    alt: "Dragon's Lair Comics and Fantasy Logo",
    contribution: "Food Drive Partners",
    contributionAmt: 1200,
    contributionUnit: "Pounds",
    affiliation: "Local Business",
    pastInvolvement: "Hope Food Pantry",
    detailsPage: "dlcf",
  },
  {
    name: "Trinity Church of Austin",
    image: "/images/trinity_church.jpeg",
    alt: "Trinity Church of Austin Logo",
    contribution: "Housing Pantry",
    contributionAmt: "N/A",
    contributionUnit: "N/A",
    affiliation: "Church",
    pastInvolvement: "Hope Food Pantry",
    detailsPage: "trinity_church",
  },
];

const Sponsors = () => {
  return (
    <div className="sponsors-page">
      <Navbar/>
      <Header headerText="Sponsors & Donors"/>

      {/* Sponsor Cards */}
      <main className="container my-5">
        <div className="mb-4 text-muted">
          Showing {sponsorsList.length} Sponsors in Total
        </div>
        <div className="row g-4">
          {sponsorsList.map((sponsor, idx) => (
            <div key={idx} className="col-md-4">
              <SponsorCard
                sponsor_img={sponsor.image}
                sponsor_alt={sponsor.alt}
                name={sponsor.name}
                contribution={sponsor.contribution}
                contribution_amt={sponsor.contributionAmt}
                contribution_unit={sponsor.contributionUnit}
                affiliation={sponsor.affiliation}
                past_inv={sponsor.pastInvolvement}
                sponsor_details={sponsor.detailsPage}
              />
              {/* <div className="card h-100 shadow-sm">
                <div className="sponsor-img-container" style={{ height: "150px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                    src={sponsor.image}
                    alt={sponsor.alt}
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                  />
                </div>
                <div className="card-body">
                  <h5 className="card-title">{sponsor.name}</h5>
                  <p className="card-text">
                    Contribution: {sponsor.contribution}<br />
                    Contribution Amount: {sponsor.contributionAmt}<br />
                    Contribution Unit: {sponsor.contributionUnit}<br />
                    Affiliation: {sponsor.affiliation}<br />
                    Past Involvement: {sponsor.pastInvolvement}
                  </p>
                  <Link to={`/${sponsor.detailsPage}`} className="stretched-link"></Link>
                </div>
              </div> */}
            </div>
          ))}
        </div>
      </main>

      <Footer/>
    </div>
  );
};

export default Sponsors;
