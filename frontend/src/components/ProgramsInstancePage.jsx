import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";

const PROGRAMS_URL = "https://api.foodbankconnect.me/v1/programs";
const FOODBANKS_URL = "https://api.foodbankconnect.me/v1/foodbanks?size=175&start=1";
const SPONSORS_URL = "https://api.foodbankconnect.me/v1/sponsors?size=175&start=1";

const ProgramInstancePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, name } = location.state || {};

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [foodbanks, setFoodbanks] = useState([]);
  const [foodbanksLoading, setFoodbanksLoading] = useState(true);
  const [sponsors, setSponsors] = useState([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(true);

  // Fetch program details
  useEffect(() => {
    const fetchProgramDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${PROGRAMS_URL}/${id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setProgram(data);
      } catch (err) {
        console.error("Error fetching program:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgramDetails();
  }, [id]);

  // Fetch related foodbanks (take current and next)
  useEffect(() => {
    const fetchFoodbanks = async () => {
      try {
        const response = await fetch(FOODBANKS_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const allFoodbanks = (await response.json()).items || [];

        // Find current index
        const currentIndex = allFoodbanks.findIndex(fb => fb.id === program?.id);
        let finalFoodbanks = [];

        if (currentIndex >= 0) {
          finalFoodbanks.push(allFoodbanks[currentIndex]);
          if (currentIndex + 1 < allFoodbanks.length) {
            finalFoodbanks.push(allFoodbanks[currentIndex + 1]);
          } else if (currentIndex > 0) {
            finalFoodbanks.push(allFoodbanks[currentIndex - 1]);
          }
        }

        // Fallback if not found
        if (finalFoodbanks.length < 2) {
          for (let fb of allFoodbanks) {
            if (!finalFoodbanks.includes(fb)) {
              finalFoodbanks.push(fb);
              if (finalFoodbanks.length === 2) break;
            }
          }
        }

        setFoodbanks(finalFoodbanks);
      } catch (err) {
        console.error("Error fetching foodbanks:", err);
      } finally {
        setFoodbanksLoading(false);
      }
    };

    if (program) fetchFoodbanks();
  }, [program]);

  // Fetch related sponsors (take current and next)
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await fetch(SPONSORS_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const allSponsors = (await response.json()).items || [];

        // Find current index
        const currentIndex = allSponsors.findIndex(s => s.id === program?.id);
        let finalSponsors = [];

        if (currentIndex >= 0) {
          finalSponsors.push(allSponsors[currentIndex]);
          if (currentIndex + 1 < allSponsors.length) {
            finalSponsors.push(allSponsors[currentIndex + 1]);
          } else if (currentIndex > 0) {
            finalSponsors.push(allSponsors[currentIndex - 1]);
          }
        }

        // Fallback if not found
        if (finalSponsors.length < 2) {
          for (let s of allSponsors) {
            if (!finalSponsors.includes(s)) {
              finalSponsors.push(s);
              if (finalSponsors.length === 2) break;
            }
          }
        }

        setSponsors(finalSponsors);
      } catch (err) {
        console.error("Error fetching sponsors:", err);
      } finally {
        setSponsorsLoading(false);
      }
    };

    if (program) fetchSponsors();
  }, [program]);

  const handleFoodbankClick = (foodbank) => {
    navigate(`/foodbanks/${encodeURIComponent(foodbank.name)}`, {
      state: { id: foodbank.id, name: foodbank.name },
    });
  };

  const handleSponsorClick = (sponsor) => {
    navigate(`/sponsors/${encodeURIComponent(sponsor.name)}`, {
      state: { id: sponsor.id, name: sponsor.name },
    });
  };

  if (loading) return <div className="container my-5"><h2>Loading Program Details...</h2></div>;
  if (!program) return <div className="container my-5"><h2>Program not found or ID missing.</h2></div>;

  return (
    <div id="wrapper">
      <Navbar />
      <Header headerText={`Program - ${program.name || name}`} />
      <Breadcrumb model_type="programs" current_page={program.name || name} />

      <main className="container my-5">
        <section className="mb-4 text-center">
          {program.image ? (
            <img
              src={program.image}
              alt={`${program.name} Logo`}
              className="img-fluid rounded shadow"
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />
          ) : (
            <div className="text-muted">No image available</div>
          )}
        </section>

        <section className="mb-5">
          <h2>Details</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><strong>Name:</strong> {program.name || "N/A"}</li>
            <li><strong>Frequency:</strong> {program.frequency || "N/A"}</li>
            <li><strong>Eligibility:</strong> {program.eligibility || "N/A"}</li>
            <li>
              <strong>Host:</strong>{" "}
              {program.host ? (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to the host foodbank page
                    const hostFoodbank = foodbanks.find(fb => fb.name === program.host);
                    if (hostFoodbank) {
                      navigate(`/foodbanks/${encodeURIComponent(hostFoodbank.name)}`, {
                        state: { id: hostFoodbank.id, name: hostFoodbank.name },
                      });
                    }
                  }}
                >
                  {program.host}
                </a>
              ) : (
                "N/A"
              )}
            </li>
            <li><strong>Program Type:</strong> {program.program_type || "N/A"}</li>
            <li><strong>Cost:</strong> {program.cost || "N/A"}</li>
            <li>
              <strong>Sign Up Link:</strong>{" "}
              {program.sign_up_link ? (
                <a href={program.sign_up_link} target="_blank" rel="noreferrer">
                  Website
                </a>
              ) : (
                "N/A"
              )}
            </li>
          </ul>
        </section>


        <section className="mb-5 text-center">
          <h2>About</h2>
          <p className="mt-3">{program.about || "No description available."}</p>
        </section>

        {/* Related Foodbanks */}
        <section className="mt-5 text-center">
          <h3>Related Food Banks</h3>
          {foodbanksLoading ? (
            <p>Loading foodbanks...</p>
          ) : (
            foodbanks.map(fb => (
              <div key={fb.id} className="border rounded p-2 my-2">
                <a href="#" onClick={(e) => { e.preventDefault(); handleFoodbankClick(fb); }}>
                  {fb.name}
                </a>
              </div>
            ))
          )}
        </section>

        {/* Related Sponsors */}
        <section className="mt-4 text-center">
          <h3>Related Sponsors</h3>
          {sponsorsLoading ? (
            <p>Loading sponsors...</p>
          ) : (
            sponsors.map(sp => (
              <div key={sp.id} className="border rounded p-2 my-2">
                <a href="#" onClick={(e) => { e.preventDefault(); handleSponsorClick(sp); }}>
                  {sp.name}
                </a>
              </div>
            ))
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProgramInstancePage;
