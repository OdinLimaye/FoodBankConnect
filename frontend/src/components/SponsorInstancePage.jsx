import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";
import styles from "../styles/Sponsors.module.css";

// Paths to scraper JSON files
import sponsorsData from "../../sponsors.json";

const SponsorInstancePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = location.state || {};
  const [sponsor, setSponsor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsor = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`https://api.foodbankconnect.me/v1/sponsors/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Lookup image and sponsor_link from the scraper JSON
        const lookup = sponsorsData.find(
          (s) => s.EIN === data.ein || s.name === data.name
        );
        if (lookup) {
          data.image = lookup.image || data.image;
          data.sponsor_link = lookup.sponsor_link || data.sponsor_link;
        }

        setSponsor(data);
      } catch (err) {
        console.error("Error fetching sponsor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSponsor();
  }, [id]);

  const handleNavigate = (type) => {
    if (!sponsor?.id) return;
    if (type === "foodbank") {
      navigate(`/foodbanks/${sponsor.id}`, { state: { id: sponsor.id, name: sponsor.name } });
    } else if (type === "program") {
      navigate(`/programs/${sponsor.id}`, { state: { id: sponsor.id, name: sponsor.name } });
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

        {/* About Section (centered) */}
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
              <strong>Past Involvement:</strong>{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate("foodbank");
                }}
              >
                View Related Foodbank
              </a>{" "}
              |{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate("program");
                }}
              >
                View Related Program
              </a>
            </li>
            <li style={{ marginTop: "25px" }}>
              <strong>Website:</strong>{" "}
              <a href={sponsor.sponsor_link} target="_blank" rel="noreferrer">
                Official Website
              </a>
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
