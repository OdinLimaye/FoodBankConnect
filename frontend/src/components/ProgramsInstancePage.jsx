import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";

const BASE_URL = "https://api.foodbankconnect.me/v1/programs";
const FOODBANKS_URL = "https://api.foodbankconnect.me/v1/foodbanks?size=10&start=1";

const ProgramsInstancePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = location.state || {};
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hostId, setHostId] = useState(null);

  // Fetch program and host ID immediately on page load
  useEffect(() => {
    const fetchProgramAndHost = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch program
        const res = await fetch(`${BASE_URL}/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const programData = await res.json();
        setProgram(programData);

        // Immediately fetch host ID if host exists
        if (programData.host) {
          try {
            const hostRes = await fetch(FOODBANKS_URL);
            if (!hostRes.ok) throw new Error(`HTTP ${hostRes.status}`);
            const hostData = await hostRes.json();
            const target = (hostData.items || []).find(fb => fb.name === programData.host);
            if (target) {
              setHostId(target.id);
            }
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
    // Navigate using React Router with stored host ID and name
    navigate(`/foodbanks/${encodeURIComponent(program.host)}`, { state: { id: hostId, name: program.host } });
  };

  if (loading) return <div className="container my-5">Loading program details...</div>;
  if (!program) return <div className="container my-5">Program not found.</div>;

  return (
    <div className="wrapper">
      <Navbar />
      <Header headerText={program.name} />
      <Breadcrumb model_type="programs" current_page={program.name} />

      <main className="container my-5">
        <div className="row">
          <div className="col-lg-6 mb-4">
            {program.image ? (
              <img src={program.image} className="img-fluid rounded shadow" alt={program.name} />
            ) : (
              <div className="text-muted">No image available</div>
            )}
          </div>

          <div className="col-lg-6">
            <h3 className="fw-bold">Program Details</h3>
            <ul className="list-group mb-3">
              <li><strong>ID:</strong> {program.id}</li>
              <li><strong>Type:</strong> {program.program_type}</li>
              <li><strong>Frequency:</strong> {program.frequency}</li>
              <li><strong>Eligibility:</strong> {program.eligibility || "Everybody"}</li>
              <li><strong>Cost:</strong> {program.cost}</li>
              <li>
                <strong>Host:</strong>{" "}
                {program.host ? (
                  <a href="#" onClick={handleHostClick}>{program.host}</a>
                ) : "N/A"}
              </li>
              <li><strong>Details Page:</strong> {program.details_page}</li>
              <li><strong>Sign Up / Learn More:</strong> {program.sign_up_link || "N/A"}</li>
              <li><strong>Links:</strong> {program.links || "N/A"}</li>
              <li><strong>Created At:</strong> {program.created_at}</li>
              <li><strong>Fetched At:</strong> {program.fetched_at || "N/A"}</li>
            </ul>
          </div>
        </div>

        <section className="mt-5">
          <h3>About the Program</h3>
          <p>{program.about || "No description available."}</p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProgramsInstancePage;
