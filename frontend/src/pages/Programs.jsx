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

  // 🔍 Filters (no searchTerm anymore)
  const [filters, setFilters] = useState({
    name: "",
    program_type: "",
    host: "",
    frequency: "",
    eligibility: "",
  });
  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const itemsPerPage = 20;
  const totalItems = 100; // Hardcoded total since API doesn’t provide it
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        setLoading(true);
        const start = (currentPage - 1) * itemsPerPage + 1;
        const res = await fetch(`${BASE_URL}?size=${itemsPerPage}&start=${start}`);
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
  }, [currentPage]);

  // 🔍 Filter logic (client-side filtering)
  const filteredPrograms =
    filter === "all"
      ? programs.filter((p) => {
          const matches = (val, f) =>
            !f ||
            (val !== undefined &&
              String(val).toLowerCase().includes(String(f).toLowerCase()));
          return (
            matches(p.name, filters.name) &&
            matches(p.program_type, filters.program_type) &&
            matches(p.host, filters.host) &&
            matches(p.frequency, filters.frequency) &&
            matches(p.eligibility, filters.eligibility)
          );
        })
      : programs.filter(
          (p) =>
            p.program_type &&
            p.program_type.toLowerCase() === filter.toLowerCase()
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

      {/* Program type filter buttons */}
      <div className="filterContainer mb-3">
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

{/*  Filters only (consistent container width) */}
<div className="container mb-3">
  <div className="p-3 bg-light rounded">
    <div className="row g-2">
      <div className="col-md-2">
        <input
          name="name"
          className="form-control"
          placeholder="Name"
          value={filters.name}
          onChange={handleFilterChange}
        />
      </div>

      <div className="col-md-2">
        <input
          name="program_type"
          className="form-control"
          placeholder="Type"
          value={filters.program_type}
          onChange={handleFilterChange}
        />
      </div>

      <div className="col-md-2">
        <input
          name="host"
          className="form-control"
          placeholder="Host"
          value={filters.host}
          onChange={handleFilterChange}
        />
      </div>

      <div className="col-md-2">
        <input
          name="frequency"
          className="form-control"
          placeholder="Frequency"
          value={filters.frequency}
          onChange={handleFilterChange}
        />
      </div>

      <div className="col-md-2">
        <input
          name="eligibility"
          className="form-control"
          placeholder="Eligibility"
          value={filters.eligibility}
          onChange={handleFilterChange}
        />
      </div>
    </div>
  </div>
</div>

      <main className="container my-5">
        {/* Top info and pagination */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="mb-0">
            Showing {filteredPrograms.length} / 100 programs
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
          {filteredPrograms.map((program) => (
            <ProgramCard
              key={program.id}
              id={program.id}
              name={program.name}
              program_type={program.program_type}
              freq={program.frequency}
              host={program.host}
              eligibility={program.eligibility}
            />
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
