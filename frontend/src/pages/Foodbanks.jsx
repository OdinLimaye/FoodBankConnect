import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";

const foodBanks = [
  {
    name: "Central Texas Food Bank",
    address: "6500 Metropolis Dr",
    city: "Austin, Texas",
    zip: "78744",
    capacity: "Over 50,000 meals/week",
    hours: "Mon–Fri, 8am–5pm",
    urgency: "Very High",
    detailsPage: "austin-central",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3494.752241848126!2d-97.72812878492573!3d30.209804181828063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644ca413aee7993%3A0xe8b2038e2cbb9fae!2sCentral%20Texas%20Food%20Bank!5e0!3m2!1sen!2sus!4v1695933088442",
  },
  {
    name: "Hope Food Pantry Austin",
    address: "4001 Speedway",
    city: "Austin, Texas",
    zip: "78751",
    capacity: "~800 meals/week",
    hours: "Fri, 9am–11:30am (by appt)",
    urgency: "Medium",
    detailsPage: "hope",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3447.5195233456173!2d-97.72799848488828!3d30.305228281783205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644cb5c57b99efb%3A0x60b7c530a47d3e77!2sHope%20Food%20Pantry%20Austin!5e0!3m2!1sen!2sus!4v1695933152636",
  },
  {
    name: "St. Ignatius Martyr Food Pantry",
    address: "126 W Oltorf St",
    city: "Austin, Texas",
    zip: "78704",
    capacity: "~1,000 meals/week",
    hours: "Mon–Wed 9am–1pm, Thu 9–11am",
    urgency: "High",
    detailsPage: "st-ignatius",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3449.379978503797!2d-97.7559276848897!3d30.24113988181356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b4dd0135d7e3%3A0x48f6d43c3b7e3540!2sSt.%20Ignatius%20Martyr%20Catholic%20Church!5e0!3m2!1sen!2sus!4v1695933190387",
  },
];

const FoodBanks = () => {
  const [entryCount, setEntryCount] = useState(0);

  useEffect(() => {
    setEntryCount(foodBanks.length);
  }, []);

  return (
    <div className="foodbanks-page">
      <Navbar/>
      <Header headerText="Food Banks & Pantries"/>

      {/* Food Bank Cards */}
      <main className="container my-5">
        <div className="mb-4 text-muted" id="entry-count">
          Showing {entryCount} Food Banks in Total
        </div>
        <div className="row g-4">
          {foodBanks.map((bank, idx) => (
            <div key={idx} className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{bank.name}</h5>
                  <p className="card-text">
                    Address: {bank.address} <br />
                    City: {bank.city} <br />
                    ZIP Code: {bank.zip} <br />
                    Capacity: {bank.capacity} <br />
                    Hours: {bank.hours} <br />
                    Urgency: {bank.urgency}
                  </p>
                  <Link to={`/${bank.detailsPage}`} className="btn btn-primary">
                    View Details
                  </Link>
                  <div className="map-container mt-3">
                    <iframe
                      src={bank.mapSrc}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`${bank.name} map`}
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer/>
    </div>
  );
};

export default FoodBanks;
