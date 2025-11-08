import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SponsorCard from "../components/SponsorCard";
import "../styles/Sponsors.css"; // ensure responsive + map styles
import "../styles/CardStyles.css"; // shared glassmorphism + gradient styles

const sponsorsListStatic = [
  {
    id: "1",
    name: "Trader Joe's",
    image: "/images/trader-joes.png",
    alt: "Trader Joe's Logo",
    affiliation: "Private Corporation",
    city: "Austin",
    state: "TX",
    sponsor_link: "https://www.traderjoes.com/home/about-us",
    map_link:
      "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d187102.43328912946!2d-97.83191852982272!3d30.277193772584845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1strader%20joe's!5e0!3m2!1sen!2sus!4v1760831297709!5m2!1sen!2sus",
  },
];

const BASE_URL = "https://api.foodbankconnect.me/v1/sponsors";

const Sponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 🔍 filters (removed searchTerm UI, but kept state for consistency)
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    name: "",
    city: "",
    state: "",
    affiliation: "",
    eligibility: "",
  });

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const itemsPerPage = 20;
  const totalItems = 100; // Hardcoded total
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    async function fetchSponsors() {
      try {
        setLoading(true);
        const start = (currentPage - 1) * itemsPerPage + 1;
        const res = await fetch(`${BASE_URL}?size=${itemsPerPage}&start=${start}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setSponsors(data.items || []);
      } catch (err) {
        console.error(
          "Failed to fetch sponsors, using static list as fallback:",
          err
        );
        setSponsors(sponsorsListStatic);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (!searchTerm) {
      fetchSponsors();
    }
  }, [currentPage, searchTerm]);

  // 🔍 optional backend search support remains (in case reused later)
  useEffect(() => {
    const apiRoot = "https://api.foodbankconnect.me/v1";
    const doSearch = async () => {
      if (!searchTerm || !searchTerm.trim()) return;
      try {
        setLoading(true);
        const res = await fetch(
          `${apiRoot}/search?q=${encodeURIComponent(searchTerm.trim())}`
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        const results = (data.items || [])
          .filter((it) => String(it.model).toLowerCase() === "sponsors")
          .map((it) => ({
            id: it.id,
            name: it.name,
            affiliation: it.affiliation,
            city: it.city,
            state: it.state,
            eligibility: it.eligibility,
            image: it.image,
            alt: it.alt,
          }));
        setSponsors(results.length ? results : sponsorsListStatic);
      } catch (err) {
        console.error("Sponsor search error:", err);
      } finally {
        setLoading(false);
      }
    };

    doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // 🔍 client-side filters
  const visibleSponsors = sponsors.filter((s) => {
    const matches = (val, f) =>
      !f ||
      (val !== undefined &&
        String(val).toLowerCase().includes(String(f).toLowerCase()));
    return (
      matches(s.name, filters.name) &&
      matches(s.city, filters.city) &&
      matches(s.state, filters.state) &&
      matches(s.affiliation, filters.affiliation) &&
      matches(s.eligibility, filters.eligibility)
    );
  });

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="loader" />
        <p className="text-muted mt-3">Loading sponsors...</p>
      </div>
    );
  }

  return (
    <div className="sponsors-page">
      <Navbar />
      <Header headerText="Sponsors & Donors" />

      <main className="container my-5">
        {error && (
          <div className="text-danger mb-3">
            Failed to load live data, showing static list instead. Error: {error}
          </div>
        )}

        {/* 🔍 Filters only (removed the "Search sponsors" input) */}
        <div className="mb-3 p-3 bg-light rounded">
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
                name="city"
                className="form-control"
                placeholder="City"
                value={filters.city}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <input
                name="state"
                className="form-control"
                placeholder="State"
                value={filters.state}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <input
                name="affiliation"
                className="form-control"
                placeholder="Affiliation"
                value={filters.affiliation}
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

        {/* Top info and pagination */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="mb-0 text-muted">
            Showing {visibleSponsors.length} / 100 sponsor
            {visibleSponsors.length !== 1 && "s"}
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

        {/* Sponsor grid */}
        <div className="card-grid">
          {visibleSponsors.map((sponsor, idx) => (
            <SponsorCard
              key={idx}
              id={sponsor.id}
              sponsor_img={sponsor.image}
              sponsor_alt={sponsor.alt || sponsor.name + " Logo"}
              name={sponsor.name}
              affiliation={sponsor.affiliation}
              city={sponsor.city}
              state={sponsor.state}
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

export default Sponsors;
