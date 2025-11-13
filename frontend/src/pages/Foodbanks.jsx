import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FoodbankCard from "../components/FoodbankCard";

const BASE_URL = "https://api.foodbankconnect.me/v1/foodbanks";

const Foodbanks = () => {
  const [foodbanks, setFoodbanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalItems = 100; // Hardcoded total since API doesn't provide it
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    const fetchFoodBanks = async () => {
      try {
        setLoading(true);
        const start = (currentPage - 1) * itemsPerPage + 1;
        const response = await fetch(`${BASE_URL}?size=${totalItems}&start=${start}`);
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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;
  const displayedFbs = foodbanks.slice(startIndex, endIndex);

  return (
    <div id="wrapper">
      <Navbar />
      <Header headerText="Food Banks" />

      <main className="container my-5">
        {/* Top info and pagination */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="mb-0">
            Showing {`${startIndex + 1} - ${startIndex + displayedFbs.length}`} / {foodbanks.length} foodbanks 
          </p>
          <div>
            <button
              className="btn btn-primary me-2"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <span>
              Page {currentPage} / {totalPages}
            </span>
            <button
              className="btn btn-primary ms-2"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>

        {/* Foodbanks grid */}
        <div className="row g-4">
          {displayedFbs.map((bank) => (
            <div
              key={bank.id}
              className="col-md-4 border rounded p-2"
            >
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

        {/* Bottom pagination (optional) */}
        <div className="d-flex justify-content-center align-items-center mt-4">
          <button
            className="btn btn-primary me-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <button
            className="btn btn-primary ms-2"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Foodbanks;
