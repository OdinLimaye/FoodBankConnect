import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";

const FOODBANKS_URL = "https://api.foodbankconnect.me/v1/foodbanks";
const PROGRAMS_URL = "https://api.foodbankconnect.me/v1/programs?size=100&start=1";

const FoodbankInstancePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, name } = location.state || {};

  const [foodbank, setFoodbank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);

  // Fetch foodbank details
  useEffect(() => {
    const fetchFoodbankDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${FOODBANKS_URL}/${id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setFoodbank(data);
      } catch (err) {
        console.error("Error fetching food bank:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodbankDetails();
  }, [id]);

  // Fetch programs hosted by this foodbank
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!foodbank?.name) return;

      try {
        const response = await fetch(PROGRAMS_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const hosted = (data.items || []).filter(
          (p) => p.host && p.host === foodbank.name
        );
        setPrograms(hosted);
      } catch (err) {
        console.error("Error fetching programs:", err);
      } finally {
        setProgramsLoading(false);
      }
    };

    fetchPrograms();
  }, [foodbank]);

  const handleProgramClick = (program) => {
    navigate(`/programs/${encodeURIComponent(program.name)}`, {
      state: { id: program.id, name: program.name },
    });
  };

  const handleSponsorClick = (e) => {
    e.preventDefault();
    navigate(`/sponsors/${encodeURIComponent(foodbank.name)}`, {
      state: { id: foodbank.id, name: foodbank.name },
    });
  };

  if (loading) {
    return (
      <div className="container my-5">
        <h2>Loading Food Bank Details...</h2>
      </div>
    );
  }

  if (!foodbank) {
    return (
      <div className="container my-5">
        <h2>Food bank not found or ID missing.</h2>
      </div>
    );
  }

  return (
    <div id="wrapper">
      <Navbar />
      <Header headerText={`Food Bank - ${foodbank.name || name}`} />
      <Breadcrumb model_type="foodbanks" current_page={foodbank.name || name} />

      <main className="container my-5">
        <section className="mb-4">
          <h2>Details</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><strong>Name:</strong> {foodbank.name || "N/A"}</li>
            <li><strong>About:</strong> {foodbank.about || "N/A"}</li>
            <li>
              <strong>Website:</strong>{" "}
              {foodbank.website ? (
                <a href={foodbank.website} target="_blank" rel="noreferrer">
                  {foodbank.website}
                </a>
              ) : (
                "N/A"
              )}
            </li>
            <li><strong>City:</strong> {foodbank.city || "N/A"}</li>
            <li><strong>State:</strong> {foodbank.state || "N/A"}</li>
            <li><strong>ZIP Code:</strong> {foodbank.zipcode || "N/A"}</li>
            <li><strong>Languages:</strong> {foodbank.languages?.join(", ") || "N/A"}</li>
            <li><strong>Services:</strong> {foodbank.services?.join(", ") || "N/A"}</li>
          </ul>
        </section>

        {/* Linked Programs Section */}
        <section className="mt-5">
          <h3>Programs Hosted by This Food Bank</h3>
          {programsLoading ? (
            <p>Loading programs...</p>
          ) : programs.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {programs.map((program) => (
                <li key={program.id} style={{ marginBottom: "0.5rem" }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleProgramClick(program);
                    }}
                  >
                    {program.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hosted programs found for this food bank.</p>
          )}
        </section>

        {/* Sponsor Navigation */}
        <section className="mt-4">
          <h3>Related Sponsor</h3>
          <a href="#" onClick={handleSponsorClick}>
            View Sponsor
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FoodbankInstancePage;
