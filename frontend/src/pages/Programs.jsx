import "../styles/Programs.css";
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProgramCard from "../components/ProgramsCard";

const BASE_URL = "https://api.foodbankconnect.me/v1/programs";

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const res = await fetch(`${BASE_URL}?size=10&start=1`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setPrograms(data.items || []);
      } catch (err) {
        console.error("Failed to fetch programs:", err);
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
          (p) => p.program_type.toLowerCase() === filter.toLowerCase()
        );

  const handleFilterClick = (program_type) => {
    setFilter(program_type);
  };

  if (loading) return <div className="container my-5">Loading programs...</div>;

  return (
    <div className="programs-page">
      <Navbar />
      <Header
        headerText="Programs & Volunteer Opportunities"
        subText="Explore how you can participate or benefit from local food programs."
      />

      {error && (
        <div className="container my-5 text-warning">
          Failed to load live data.
        </div>
      )}

      <div className="filterContainer">
        <div className="btn-group">
          {["all", "distribution", "volunteer", "class", "service"].map(
            (program_type) => (
              <button
                key={program_type}
                className={`btn btn-outline-primary ${
                  filter.toLowerCase() === program_type ? "active" : ""
                }`}
                onClick={() => handleFilterClick(program_type)}
              >
                {program_type.charAt(0).toUpperCase() + program_type.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      <main className="container">
        <p className="text-muted ms-2">
          Showing {filteredPrograms.length} Program
          {filteredPrograms.length !== 1 && "s"} in Total
        </p>
        <div className="card-grid">
          {filteredPrograms.map((program) => (
            <ProgramCard
              key={program.id}
              id={program.id}
              name={program.name}
              program_type={program.program_type}
              freq={program.frequency}
              host={program.host}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Programs;
