import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FoodbankCard from "../components/FoodbankCard";

const BASE_URL = "https://api.foodbankconnect.me/v1/foodbanks";

const Foodbanks = () => {
  const [foodbanks, setFoodbanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const TOTAL_ITEMS = 100;
  const TOTAL_PAGES = Math.ceil(TOTAL_ITEMS / PAGE_SIZE);

  const fetchFoodBanks = async (pageNum) => {
    setLoading(true);
    try {
      const start = (pageNum - 1) * PAGE_SIZE + 1;
      const response = await fetch(`${BASE_URL}?size=${PAGE_SIZE}&start=${start}`);
      if (!response.ok) throw new Error("Failed to fetch food banks");
      const data = await response.json();
      setFoodbanks(data.items || []);
    } catch (error) {
      console.error("Error fetching food banks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodBanks(page);
  }, [page]);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < TOTAL_PAGES) setPage(page + 1);
  };

  if (loading) return <div className="container my-5 text-center">Loading...</div>;

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

        {/* Pagination Controls */}
        <div className="d-flex justify-content-center align-items-center mt-4">
          <button
            className="btn btn-outline-primary mx-2"
            onClick={handlePrev}
            disabled={page === 1}
          >
            ← Previous
          </button>
          <span>
            Page {page} / {TOTAL_PAGES}
          </span>
          <button
            className="btn btn-outline-primary mx-2"
            onClick={handleNext}
            disabled={page === TOTAL_PAGES}
          >
            Next →
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Foodbanks;
