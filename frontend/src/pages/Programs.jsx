import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProgramCard from "../components/ProgramsCard";

// --- Static list for reference ---
const programsListStatic = [
  {
    name: "Drive-Thru Food Pantry",
    type: "Distribution",
    eligibility: "Open",
    frequency: "Weekly",
    cost: "Free",
    host: "Church",
    image: "/images/drive-thru.jpg",
    detailsPage: "drive-thru-food-pantry",
    about: "[Need to store about in entry]",
    sign_up_link: "[Need to store sign up link in entry]",
    map_link: "[Need to store map link in entry]",
  },
  {
    name: "Culinary Training Program",
    type: "Class",
    eligibility: "High School GED",
    frequency: "Yearly",
    cost: "Free",
    host: "Food Bank",
    image: "/images/cooking-case.png",
    detailsPage: "culinary-training",
    about: "[Need to store about in entry]",
    sign_up_link: "[Need to store sign up link in entry]",
    map_link: "[Need to store map link in entry]",
  },
  {
    name: "Nutrition Education Program",
    type: "Service",
    eligibility: "Referral-based",
    frequency: "Ongoing Sessions",
    cost: "Free",
    host: "Food Bank",
    image: "/images/nutrition-education.png",
    detailsPage: "nutrition-class",
    about: "[Need to store about in entry]",
    sign_up_link: "[Need to store sign up link in entry]",
    map_link: "[Need to store map link in entry]",
  },
];

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const res = await fetch("https://foodbankconnect.me/API/programs"); // replace with your real endpoint
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setPrograms(data); // assuming API returns array of program objects
      } catch (err) {
        console.error("Failed to fetch programs, using static list as fallback:", err);
        setPrograms(programsListStatic); // fallback to static list
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPrograms();
  }, []);

  const filteredPrograms =
  filter === "all"
    ? programs
    : programs.filter(
        (p) => p.type && p.type.toLowerCase() === filter.toLowerCase()
      );


  const handleFilterClick = (type) => {
    setFilter(type);
  };

  if (loading) return <div className="container my-5">Loading programs...</div>;

  return (
    <div className="programs-page">
      <Navbar />
      <Header
        headerText="Programs & Volunteer Opportunities"
        subText="Explore how you can participate or benefit from local food programs."
      />

      {/* Show error as warning but still render static list */}
      {error && (
        <div className="container my-5 text-warning">
          Failed to load live data, showing static list instead.
        </div>
      )}

      {/* Filter Buttons */}
      <div className="btn-group">
        {["all", "distribution", "volunteer", "class", "service"].map((type) => (
          <button
            key={type}
            className={`btn btn-outline-primary ${
              filter.toLowerCase() === type ? "active" : ""
            }`}
            onClick={() => handleFilterClick(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Program Cards */}
      <main className="container">
        <div className="mb-4 text-muted">
          Showing {filteredPrograms.length} Programs in Total
        </div>
        <div className="row g-4 justify-content-center">
          {filteredPrograms.map((program, idx) => (
            <div key={idx} className="col-md-6 col-lg-4">
              <ProgramCard
                name={program.name}
                type={program.type}
                elig={program.eligibility}
                freq={program.frequency}
                cost={program.cost}
                host={program.host}
                img={program.image}
                about={program.about}
                sign_up_link={program.sign_up_link}
                map_link={program.map_link}
              />
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Programs;
