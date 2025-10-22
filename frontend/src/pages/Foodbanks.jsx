import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FoodbankCard from "../components/FoodbankCard";

const BASE_URL = "https://api.foodbankconnect.me/v1/foodbanks";

const Foodbanks = () => {
  const [foodbanks, setFoodbanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoodBanks = async () => {
      try {
        const response = await fetch(`${BASE_URL}?size=10&start=1`);
        if (!response.ok) throw new Error("Failed to fetch food banks");
        const data = await response.json();
        setFoodbanks(data.items || []);
      } catch (error) {
        console.error("Error fetching food banks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodBanks();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div id="wrapper">
      <Navbar />
      <Header headerText="Food Banks" />

      <main className="container my-5">
        <div className="row g-4">
          {foodbanks.map((bank) => (
            <div key={bank.id} className="col-md-4">
              <FoodbankCard
                id={bank.id}
                name={bank.name}
                city={bank.city}
                zipcode={bank.zipcode}
                urgency={bank.urgency}
              />
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Foodbanks;
