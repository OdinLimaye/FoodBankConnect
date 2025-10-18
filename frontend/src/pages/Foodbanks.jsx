import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FoodBankCard from "../components/FoodbankCard";

// --- Static list for reference/fallback ---
const foodBanksStatic = [
  {
    name: "Central Texas Food Bank",
    address: "6500 Metropolis Dr",
    city: "Austin, Texas",
    zip: "78744",
    capacity: "Over 50,000 meals/week",
    days: "Mon–Fri",
    hours: "8am–5pm",
    urgency: "Very High",
    link: "https://centraltexasfoodbank.org/",
    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3494.752241848126!2d-97.72812878492573!3d30.209804181828063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644ca413aee7993%3A0xe8b2038e2cbb9fae!2sCentral%20Texas%20Food%20Bank!5e0!3m2!1sen!2sus!4v1695933088442",
  },
  {
    name: "Hope Food Pantry Austin",
    address: "4001 Speedway",
    city: "Austin, Texas",
    zip: "78751",
    capacity: "~800 meals/week",
    days: "Fri",
    hours: "9am–11:30am (by appt)",
    urgency: "Medium",
    link: "https://hopefoodpantry.org/",
    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3447.5195233456173!2d-97.72799848488828!3d30.305228281783205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644cb5c57b99efb%3A0x60b7c530a47d3e77!2sHope%20Food%20Pantry%20Austin!5e0!3m2!1sen!2sus!4v1695933152636",
  },
  {
    name: "St. Ignatius Martyr Food Pantry",
    address: "126 W Oltorf St",
    city: "Austin, Texas",
    zip: "78704",
    capacity: "~1,000 meals/week",
    days: "Mon–Wed, Thu",
    hours: "9am–1pm, 9–11am",
    urgency: "High",
    link: "https://stignatiusparish.org/food-pantry",
    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3449.379978503797!2d-97.7559276848897!3d30.24113988181356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b4dd0135d7e3%3A0x48f6d43c3b7e3540!2sSt.%20Ignatius%20Martyr%20Catholic%20Church!5e0!3m2!1sen!2sus!4v1695933190387",
  },
];

const FoodBanks = () => {
  const [foodBanks, setFoodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFoodBanks() {
      try {
        const res = await fetch("https://foodbankconnect.me/API/foodbanks"); // replace with actual endpoint
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setFoodBanks(data);
      } catch (err) {
        console.error("Failed to fetch food banks, using static list as fallback:", err);
        setFoodBanks(foodBanksStatic);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFoodBanks();
  }, []);

  if (loading) return <div className="container my-5">Loading food banks...</div>;

  return (
    <div className="foodbanks-page">
      <Navbar />
      <Header headerText="Food Banks & Pantries" />

      {/* Show error as warning but still render static list */}
      {error && (
        <div className="container my-5 text-warning">
          Failed to load live data, showing static list instead.
        </div>
      )}

      {/* Food Bank Cards */}
      <main className="container my-5">
        <div className="mb-4 text-muted">
          Showing {foodBanks.length} Food Banks in Total
        </div>
        <div className="row g-4">
          {foodBanks.map((bank, idx) => (
            <div key={idx} className="col-md-4">
              <FoodBankCard
                name={bank.name}
                address={bank.address}
                city={bank.city}
                zip={bank.zip}
                capacity={bank.capacity}
                days={bank.days || "N/A"}
                hours={bank.hours}
                urgency={bank.urgency}
                link={bank.link}
                map={bank.map}
              />
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FoodBanks;
