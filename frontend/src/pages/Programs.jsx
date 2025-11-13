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
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;
  const totalItems = 98; // Hardcoded total

  useEffect(() => {
    async function fetchPrograms() {
      try {
        setLoading(true);
        const start = (currentPage - 1) * itemsPerPage + 1;
        const res = await fetch(`${BASE_URL}?size=${totalItems}&start=${start}`);
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

  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage) || 1;
  useEffect(() => {
    const newTotalPages = Math.ceil(filteredPrograms.length / itemsPerPage) || 1;
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [filteredPrograms, currentPage]);

  const handleFilterClick = (program_type) => {
    setFilter(program_type);
  };

  if (loading) return <div className="container my-5">Loading programs...</div>;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;
  const displayedPrograms = filteredPrograms.slice(startIndex, endIndex);

  const showEnd = startIndex + displayedPrograms.length;
  const showStart = (displayedPrograms.length > 0 ? startIndex + 1 : startIndex);

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

      <main className="container my-5">
        {/* Top info and pagination */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="mb-0">
            Showing {`${showStart} ${filteredPrograms.length > 0 ? `- ${showEnd}` : ""}`} / {filteredPrograms.length} programs
          </p>
          <div>
            <button
              className="btn btn-primary me-2"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <span>
              Page {currentPage} / {totalPages}
            </span>
            <button
              className="btn btn-primary ms-2"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>

        {/* Program cards grid */}
        <div className="card-grid">
          {displayedPrograms.map((program) => (
            <div key={program.id} className="border rounded p-2 mb-3">
              <ProgramCard
                id={program.id}
                name={program.name}
                program_type={program.program_type}
                freq={program.frequency}
                host={program.host}
              />
            </div>
          ))}
        </div>

        {/* Bottom pagination */}
        <div className="d-flex justify-content-center align-items-center mt-4">
          <button
            className="btn btn-primary me-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <button
            className="btn btn-primary ms-2"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Programs;
