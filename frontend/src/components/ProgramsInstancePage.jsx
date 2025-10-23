import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";
import programsData from "../../programs.json";

const BASE_URL = "https://api.foodbankconnect.me/v1/programs";
const FOODBANKS_URL = "https://api.foodbankconnect.me/v1/foodbanks?size=100&start=1";

const ProgramsInstancePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = location.state || {};
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hostId, setHostId] = useState(null);

  useEffect(() => {
    const fetchProgramAndHost = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const programData = await res.json();

        // Lookup image and sign_up_link from programs.json
        const lookup = programsData.find(
          (p) => p.name === programData.name || p.host === programData.host
        );
        if (lookup) {
          programData.image = lookup.image || programData.image;
          programData.sign_up_link = lookup.sign_up_link || programData.sign_up_link;
        }

        setProgram(programData);

        if (programData.host) {
          try {
            const hostRes = await fetch(FOODBANKS_URL);
            if (!hostRes.ok) throw new Error(`HTTP ${hostRes.status}`);
            const hostData = await hostRes.json();
            const target = (hostData.items || []).find(
              (fb) => fb.name === programData.host
            );
            if (target) setHostId(target.id);
          } catch (err) {
            console.error("Error fetching foodbanks:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching program:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgramAndHost();
  }, [id]);

  const handleHostClick = (e) => {
    e.preventDefault();
    if (!hostId) {
      alert("Host foodbank not found yet. Please wait a moment.");
      return;
    }
    navigate(`/foodbanks/${encodeURIComponent(program.host)}`, {
      state: { id: hostId, name: program.host },
    });
  };

  const handleSponsorClick = (e) => {
    e.preventDefault();
    navigate(`/sponsors/${encodeURIComponent(program.name)}`, {
      state: { id: program.id, name: program.name },
    });
  };

  if (loading) return <div className="container my-5">Loading program details...</div>;
  if (!program) return <div className="container my-5">Program not found.</div>;

  return (
    <div className="wrapper">
      <Navbar />
      <Header headerText={program.name} />
      <Breadcrumb model_type="programs" current_page={program.name} />

      <main className="container my-5">
        <div className="row align-items-center">
          {/* Image on the left */}
          <div className="col-lg-6 mb-4 text-center">
            {program.image ? (
              <img
                src={program.image}
                className="img-fluid rounded shadow"
                alt={program.name}
                style={{ maxHeight: "400px", objectFit: "cover" }}
              />
            ) : (
              <div className="text-muted">No image available</div>
            )}
          </div>

          {/* Text content on the right, centered */}
          <div className="col-lg-6 text-center">
            <h3 className="fw-bold mb-4">Program Details</h3>
            <ul className="list-unstyled">
              <li><strong>Frequency:</strong> {program.frequency || "N/A"}</li>
              <li><strong>Eligibility:</strong> Everybody</li>
              <li><strong>Cost:</strong> {program.cost || "N/A"}</li>
              <li>
                <strong>Host:</strong>{" "}
                {program.host ? (
                  <a href="#" onClick={handleHostClick}>
                    {program.host}
                  </a>
                ) : (
                  "N/A"
                )}
              </li>
              <li>
                <strong>Sign Up / Learn More:</strong>{" "}
                {program.sign_up_link ? (
                  <a href={program.sign_up_link} target="_blank" rel="noreferrer">
                    Sign Up Page
                  </a>
                ) : (
                  "N/A"
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* About section */}
        <section className="mt-5 text-center">
          <h3>About the Program</h3>
          <p className="mt-2">{program.about || "No description available."}</p>
        </section>

        {/* Related sponsor */}
        <section className="mt-5 text-center">
          <h3>Related Sponsor</h3>
          <p className="mt-2">
            <a href="#" onClick={handleSponsorClick}>
              View Sponsor
            </a>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProgramsInstancePage;
