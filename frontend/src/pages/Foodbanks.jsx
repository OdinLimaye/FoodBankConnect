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

  // 🔍 search + filters states
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    name: "",
    city: "",
    zipcode: "",
    urgency: "",
    eligibility: "",
  });

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  useEffect(() => {
    const fetchFoodBanks = async () => {
      try {
        setLoading(true);
        const start = (currentPage - 1) * itemsPerPage + 1;
        const response = await fetch(
          `${BASE_URL}?size=${itemsPerPage}&start=${start}`
        );
        if (!response.ok) throw new Error("Failed to fetch food banks");
        const data = await response.json();
        setFoodbanks(data.items || []);
      } catch (error) {
        console.error("Error fetching food banks:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!searchTerm) {
      fetchFoodBanks();
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    const apiRoot = "https://api.foodbankconnect.me/v1";
    const doSearch = async () => {
      if (!searchTerm || !searchTerm.trim()) {
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(
          `${apiRoot}/search?q=${encodeURIComponent(searchTerm.trim())}`
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        const results = (data.items || [])
          .filter((it) => String(it.model).toLowerCase() === "foodbanks")
          .map((it) => ({
            id: it.id,
            name: it.name,
            city: it.city || undefined,
            zipcode: it.zipcode || undefined,
            urgency: it.urgency || undefined,
            eligibility: it.eligibility || undefined,
          }));

        setFoodbanks(results);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const visibleFoodbanks = foodbanks.filter((bank) => {
    if (!bank) return false;
    const matches = (value, filterVal) =>
      !filterVal ||
      (value !== undefined &&
        String(value).toLowerCase().includes(String(filterVal).toLowerCase()));

    return (
      matches(bank.name, filters.name) &&
      matches(bank.city, filters.city) &&
      matches(bank.zipcode, filters.zipcode) &&
      matches(bank.urgency, filters.urgency) &&
      matches(bank.eligibility, filters.eligibility)
    );
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div id="wrapper">
      <Navbar />
      <Header headerText="Food Banks" />

      <main className="container my-5">
        {/* 🔍 Filters only (removed the "Search all text" input) */}
        <div className="mb-3 p-3 bg-light rounded">
          <div className="row g-2">
            <div className="col-md-2">
              <input
                name="name"
                type="text"
                className="form-control"
                placeholder="Name"
                value={filters.name}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <input
                name="city"
                type="text"
                className="form-control"
                placeholder="City"
                value={filters.city}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <input
                name="zipcode"
                type="text"
                className="form-control"
                placeholder="ZIP Code"
                value={filters.zipcode}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <input
                name="urgency"
                type="text"
                className="form-control"
                placeholder="Urgency"
                value={filters.urgency}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <input
                name="eligibility"
                type="text"
                className="form-control"
                placeholder="Eligibility"
                value={filters.eligibility}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>

        {/* Top info and pagination */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="mb-0">Showing {visibleFoodbanks.length} / 100 foodbanks</p>
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
          {visibleFoodbanks.map((bank) => (
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

        {/* Bottom pagination */}
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
