import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";
import styles from "../styles/Sponsors.module.css";

const FOODBANKS_URL = "https://api.foodbankconnect.me/v1/foodbanks?size=100&start=1";
const PROGRAMS_URL = "https://api.foodbankconnect.me/v1/programs?size=100&start=1";

const SponsorInstancePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = location.state || {};
  const [sponsor, setSponsor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [foodbanks, setFoodbanks] = useState([]);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchSponsorData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch sponsor info
        const sponsorRes = await fetch(`https://api.foodbankconnect.me/v1/sponsors/${id}`);
        if (!sponsorRes.ok) throw new Error(`HTTP ${sponsorRes.status}`);
        const sponsorData = await sponsorRes.json();
        setSponsor(sponsorData);

        const currentId = parseInt(id, 10);

        // --- Fetch all foodbanks ---
        const fbRes = await fetch(FOODBANKS_URL);
        const fbItems = (await fbRes.json()).items || [];

        let fbLinks = [];
        // First: match sponsor ID if exists
        const fbMatch = fbItems.find(fb => fb.id === currentId);
        if (fbMatch) fbLinks.push(fbMatch);

        // Second: neighbor (ID-1 unless ID=1, then ID+1)
        let neighborId = currentId > 1 ? currentId - 1 : currentId + 1;
        const fbNeighbor = fbItems.find(fb => fb.id === neighborId && fb.id !== currentId);
        if (fbNeighbor) fbLinks.push(fbNeighbor);

        // Fill up to 2
        for (let fb of fbItems) {
          if (fbLinks.length >= 2) break;
          if (!fbLinks.find(f => f.id === fb.id)) fbLinks.push(fb);
        }
        setFoodbanks(fbLinks);

        // --- Fetch all programs ---
        const progRes = await fetch(PROGRAMS_URL);
        const progItems = (await progRes.json()).items || [];

        let progLinks = [];
        // First: match sponsor ID if exists
        const progMatch = progItems.find(p => p.id === currentId);
        if (progMatch) progLinks.push(progMatch);

        // Second: neighbor (ID-1 unless ID=1, then ID+1)
        const progNeighbor = progItems.find(p => p.id === neighborId && p.id !== currentId);
        if (progNeighbor) progLinks.push(progNeighbor);

        // Fill up to 2
        for (let p of progItems) {
          if (progLinks.length >= 2) break;
          if (!progLinks.find(pr => pr.id === p.id)) progLinks.push(p);
        }
        setPrograms(progLinks);

      } catch (err) {
        console.error("Error fetching sponsor or related data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSponsorData();
  }, [id]);

  const handleNavigate = (type, target) => {
    if (!target) return;
    if (type === "foodbank") {
      navigate(`/foodbanks/${encodeURIComponent(target.name)}`, { state: { id: target.id, name: target.name } });
    } else if (type === "program") {
      navigate(`/programs/${encodeURIComponent(target.name)}`, { state: { id: target.id, name: target.name } });
    }
  };

  if (loading) return <div className="container my-5">Loading sponsor details...</div>;
  if (!sponsor) return <div className="container my-5">Sponsor not found.</div>;

  return (
    <div id="wrapper">
      <Navbar />
      <Header headerText={"Sponsors & Donors - " + sponsor.name} />
      <Breadcrumb model_type="sponsors" current_page={sponsor.name} />

      <main className="container my-5">
        <div className={`${styles["sponsor-img-container"]} text-center mb-4`}>
          {sponsor.image ? (
            <img src={sponsor.image} alt={sponsor.alt || sponsor.name + " Logo"} />
          ) : (
            <p>No image found</p>
          )}
        </div>

        {/* About Section */}
        <section className={`mb-4 text-center ${styles.about}`}>
          <h2>About</h2>
          <p>{sponsor.about}</p>
        </section>

        {/* Details Section */}
        <section className="mb-4">
          <h2>Details</h2>
          <ul style={{ listStyle: "none" }}>
            <li><strong>Affiliation:</strong> {sponsor.affiliation}</li>
            <li><strong>Contribution:</strong> {sponsor.contribution}</li>
            <li><strong>City:</strong> {sponsor.city}</li>
            <li><strong>State:</strong> {sponsor.state}</li>
            <li>
              <strong>Related Foodbanks:</strong>{" "}
              {foodbanks.map((fb, idx) => (
                <span key={fb.id}>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate("foodbank", fb); }}>
                    {fb.name}
                  </a>
                  {idx < foodbanks.length - 1 && " | "}
                </span>
              ))}
            </li>
            <li>
              <strong>Related Programs:</strong>{" "}
              {programs.map((p, idx) => (
                <span key={p.id}>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate("program", p); }}>
                    {p.name}
                  </a>
                  {idx < programs.length - 1 && " | "}
                </span>
              ))}
            </li>
            <li style={{ marginTop: "25px" }}>
              <strong>Website:</strong>{" "}
              <a href={sponsor.sponsor_link} target="_blank" rel="noreferrer">Official Website</a>
            </li>
            <li><strong>Media / Logo Alt:</strong> {sponsor.alt}</li>
            <li><strong>Employee Identification Number:</strong> {sponsor.ein}</li>
          </ul>
        </section>

        {/* Optional Map Section */}
        {sponsor.map_link && (
          <section className={`${styles["map-container"]} mt-3`}>
            <iframe
              style={{ width: "80%", height: "450px" }}
              src={sponsor.map_link}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SponsorInstancePage;
