import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";

const FOODBANKS_URL = "https://api.foodbankconnect.me/v1/foodbanks";
const PROGRAMS_URL = "https://api.foodbankconnect.me/v1/programs?size=100&start=1";
const SPONSORS_URL = "https://api.foodbankconnect.me/v1/sponsors?size=100&start=1";

const FoodbankInstancePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, name } = location.state || {};

  const [foodbank, setFoodbank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [sponsors, setSponsors] = useState([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(true);

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

  useEffect(() => {
    const fetchPrograms = async () => {
      if (!foodbank?.name) return;

      try {
        const response = await fetch(PROGRAMS_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const allPrograms = (await response.json()).items || [];

        const hosted = allPrograms.filter(p => p.host === foodbank.name);

        // Guarantee exactly 2 programs
        let finalPrograms = [];
        if (hosted.length >= 2) {
          finalPrograms = hosted.slice(0, 2);
        } else if (hosted.length === 1) {
          const idx = allPrograms.findIndex(p => p.id === hosted[0].id);
          const neighbor =
            idx > 0 ? allPrograms[idx - 1] :
            idx < allPrograms.length - 1 ? allPrograms[idx + 1] : null;
          finalPrograms = [hosted[0]];
          if (neighbor) finalPrograms.push(neighbor);
        } else {
          // No hosted programs, pick 2 neighbors by index 0 and 1
          finalPrograms = allPrograms.slice(0, 2);
        }

        setPrograms(finalPrograms);
      } catch (err) {
        console.error("Error fetching programs:", err);
      } finally {
        setProgramsLoading(false);
      }
    };

    fetchPrograms();
  }, [foodbank]);

  useEffect(() => {
  const fetchSponsors = async () => {
    if (!foodbank?.id) return;

    try {
      const response = await fetch(SPONSORS_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const allSponsors = (await response.json()).items || [];

      const currentId = parseInt(foodbank.id, 10);
      const lowerId = currentId - 1;

      const mainSponsor = allSponsors.find(s => s.id === currentId);
      const neighborSponsor = allSponsors.find(s => s.id === lowerId);

      const finalSponsors = [];
      if (mainSponsor) finalSponsors.push(mainSponsor);
      if (neighborSponsor) finalSponsors.push(neighborSponsor);

      setSponsors(finalSponsors);
    } catch (err) {
      console.error("Error fetching sponsors:", err);
    } finally {
      setSponsorsLoading(false);
    }
  };

  fetchSponsors();
}, [foodbank]);



  const handleProgramClick = program => {
    navigate(`/programs/${encodeURIComponent(program.name)}`, {
      state: { id: program.id, name: program.name },
    });
  };

  const handleSponsorClick = sponsor => {
    navigate(`/sponsors/${encodeURIComponent(sponsor.name)}`, {
      state: { id: sponsor.id, name: sponsor.name },
    });
  };

  if (loading) return <div className="container my-5"><h2>Loading Food Bank Details...</h2></div>;
  if (!foodbank) return <div className="container my-5"><h2>Food bank not found or ID missing.</h2></div>;

  return (
    <div id="wrapper">
      <Navbar />
      <Header headerText={`Food Bank - ${foodbank.name || name}`} />
      <Breadcrumb model_type="foodbanks" current_page={foodbank.name || name} />

      <main className="container my-5">
        <section className="mb-4 text-center">
          {foodbank.image ? (
            <img
              src={foodbank.image}
              alt={`${foodbank.name} Logo`}
              className="img-fluid rounded shadow"
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />
          ) : (
            <div className="text-muted">No image available</div>
          )}
        </section>

        <section className="mb-4">
          <h2>Details</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><strong>Name:</strong> {foodbank.name || "N/A"}</li>
            <li>
              <strong>Website:</strong>{" "}
              {foodbank.website ? (
                <a href={foodbank.website} target="_blank" rel="noreferrer">Official Website</a>
              ) : "N/A"}
            </li>
            <li><strong>City:</strong> {foodbank.city || "N/A"}</li>
            <li><strong>State:</strong> {foodbank.state || "N/A"}</li>
            <li><strong>ZIP Code:</strong> {foodbank.zipcode || "N/A"}</li>
            <li><strong>Languages:</strong> {foodbank.languages?.join(", ") || "N/A"}</li>
            <li><strong>Services:</strong> {foodbank.services?.join(", ") || "N/A"}</li>
          </ul>
        </section>

        <section className="mb-5 text-center">
          <h2>About</h2>
          <p className="mt-3">{foodbank.about || "No description available."}</p>
        </section>

        {/* Programs Hosted */}
        <section className="mt-5 text-center">
          <h3>Related Programs</h3>
          {programsLoading ? <p>Loading programs...</p> : (
            programs.map(program => (
              <div key={program.id} className="border rounded p-2 my-2">
                <a href="#" onClick={e => { e.preventDefault(); handleProgramClick(program); }}>
                  {program.name}
                </a>
              </div>
            ))
          )}
        </section>

        {/* Sponsors */}
        <section className="mt-4 text-center">
          <h3>Related Sponsors</h3>
          {sponsorsLoading ? <p>Loading sponsors...</p> : (
            sponsors.map(sponsor => (
              <div key={sponsor.id} className="border rounded p-2 my-2">
                <a href="#" onClick={e => { e.preventDefault(); handleSponsorClick(sponsor); }}>
                  {sponsor.name}
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

export default FoodbankInstancePage;
