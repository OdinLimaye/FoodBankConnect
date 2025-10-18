import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";

const FoodbankInstancePage = () => {
  const location = useLocation();
  const {
    name,
    address,
    city,
    zip,
    capacity,
    days,
    hours,
    urgency,
    link,
    map,
  } = location.state || {};

  return (
    <div id="wrapper">
      <Navbar />
      <Header headerText={`Food Bank - ${name}`} />
      <Breadcrumb model_type="foodbanks" current_page={name} />

      <main className="container my-5">
        {/* Food Bank Info */}
        <section className="mb-4">
          <h2>Details</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><strong>Address:</strong> {address}</li>
            <li><strong>City:</strong> {city}</li>
            <li><strong>ZIP Code:</strong> {zip}</li>
            <li><strong>Capacity:</strong> {capacity}</li>
            <li><strong>Days:</strong> {days}</li>
            <li><strong>Hours:</strong> {hours}</li>
            <li><strong>Urgency:</strong> {urgency}</li>
            {link && (
              <li style={{ marginTop: "10px" }}>
                <strong>Website:</strong>{" "}
                <a href={link} target="_blank" rel="noreferrer">
                  {link}
                </a>
              </li>
            )}
          </ul>
        </section>

        {/* Map */}
        {map && (
          <section className="map-container mt-3">
            <iframe
              src={decodeURIComponent(map)}
              style={{ width: "80%", height: "450px", border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${name} map`}
            ></iframe>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default FoodbankInstancePage;
