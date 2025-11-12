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
  // Add more static entries if needed
];

const BASE_URL = "https://api.foodbankconnect.me/v1/sponsors";

const Sponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;
  const totalItems = 100; // Hardcoded total
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    async function fetchSponsors() {
      try {
        setLoading(true);
        const start = (currentPage - 1) * itemsPerPage + 1;
        const res = await fetch(`${BASE_URL}?size=${totalItems}&start=${start}`);
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

    fetchSponsors();
  }, []);

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="loader" />
        <p className="text-muted mt-3">Loading sponsors...</p>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;
  const displayedSponsors = sponsors.slice(startIndex, endIndex);

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

        {/* Top info and pagination */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="mb-0 text-muted">
            Showing 20 / 100 sponsor{sponsors.length !== 1 && "s"}
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
          {displayedSponsors.map((sponsor, idx) => (
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