import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";

const BASE_URL = "https://api.foodbankconnect.me/v1/programs";
const FOODBANKS_URL = "https://api.foodbankconnect.me/v1/foodbanks?size=100&start=1";
const SPONSORS_URL = "https://api.foodbankconnect.me/v1/sponsors?size=100&start=1";

const ProgramsInstancePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = location.state || {};
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  const [foodbanks, setFoodbanks] = useState([]);
  const [sponsors, setSponsors] = useState([]);

  useEffect(() => {
    const fetchProgram = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch this program
        const res = await fetch(`${BASE_URL}/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const programData = await res.json();
        setProgram(programData);

        // === Fetch related foodbanks ===
        const fbRes = await fetch(FOODBANKS_URL);
        if (!fbRes.ok) throw new Error(`HTTP ${fbRes.status}`);
        const fbData = (await fbRes.json()).items || [];

        // Host foodbank + neighbor
        let fbLinks = [];
        if (programData.host) {
          const hostIndex = fbData.findIndex(fb => fb.name === programData.host);
          if (hostIndex !== -1) {
            fbLinks.push({ id: fbData[hostIndex].id, name: fbData[hostIndex].name });
            let neighborIndex =
              hostIndex > 0
                ? hostIndex - 1
                : hostIndex < fbData.length - 1
                ? hostIndex + 1
                : null;
            if (neighborIndex !== null && neighborIndex !== hostIndex) {
              fbLinks.push({ id: fbData[neighborIndex].id, name: fbData[neighborIndex].name });
            }
          }
        }

        // If less than 2, fill with extras
        while (fbLinks.length < 2 && fbData.length > 0) {
          for (let fb of fbData) {
            if (!fbLinks.find(f => f.id === fb.id)) {
              fbLinks.push({ id: fb.id, name: fb.name });
              if (fbLinks.length === 2) break;
            }
          }
        }

        setFoodbanks(fbLinks);

        // === Fetch sponsors (using ID and neighbor ID logic) ===
        const sponsorRes = await fetch(SPONSORS_URL);
        if (!sponsorRes.ok) throw new Error(`HTTP ${sponsorRes.status}`);
        const allSponsors = (await sponsorRes.json()).items || [];

        const currentId = parseInt(programData.id, 10);
        const neighborId = currentId > 1 ? currentId - 1 : currentId + 1;

        const mainSponsor = allSponsors.find(s => s.id === currentId);
        const neighborSponsor = allSponsors.find(s => s.id === neighborId);

        const finalSponsors = [];
        if (mainSponsor) finalSponsors.push(mainSponsor);
        if (neighborSponsor) finalSponsors.push(neighborSponsor);

        setSponsors(finalSponsors);
      } catch (err) {
        console.error("Error fetching program or related data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [id]);

  const handleNavigateFoodbank = (fb) => {
    navigate(`/foodbanks/${encodeURIComponent(fb.name)}`, {
      state: { id: fb.id, name: fb.name },
    });
  };

  const handleNavigateSponsor = (sp) => {
    navigate(`/sponsors/${encodeURIComponent(sp.name)}`, {
      state: { id: sp.id, name: sp.name },
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

          <div className="col-lg-6 text-center">
            <h3 className="fw-bold mb-4">Program Details</h3>
            <ul className="list-unstyled">
              <li><strong>Frequency:</strong> {program.frequency || "N/A"}</li>
              <li><strong>Eligibility:</strong> {program.eligibility || "Everybody"}</li>
              <li><strong>Cost:</strong> {program.cost || "N/A"}</li>
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

        <section className="mt-5 text-center">
          <h3>About the Program</h3>
          <p className="mt-2">{program.about || "No description available."}</p>
        </section>

        {/* Foodbanks */}
        <section className="mt-5 text-center">
          <h3>Related Foodbanks</h3>
          {foodbanks.map(fb => (
            <p key={fb.id}>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  handleNavigateFoodbank(fb);
                }}
              >
                {fb.name}
              </a>
            </p>
          ))}
        </section>

        {/* Sponsors */}
        <section className="mt-4 text-center">
          <h3>Related Sponsors</h3>
          {sponsors.map(sp => (
            <p key={sp.id}>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  handleNavigateSponsor(sp);
                }}
              >
                {sp.name}
              </a>
            </p>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProgramsInstancePage;
