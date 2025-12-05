import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FoodbankCard from "../components/FoodbankCard";

const BASE_URL = "https://dp3d297dp9.execute-api.us-east-2.amazonaws.com/v1/foodbanks";
const ITEMS_PER_PAGE = 21;
const MAX_ITEMS = 100;

const SORT_MAPPINGS = {"Name Asc." : "name",
                      "Name desc." : "-name", 
                      "City Asc." : "city",
                      "City desc." : "-city",
                      "Zip Code Asc." : "zipcode", 
                      "Zip Code desc." : "-zipcode",
                      "Urgency Asc.":"urgency",  
                      "Urgency desc.":"-urgency",
                      "Eligibility Asc.":"eligibility",
                      "Eligibility desc.":"-eligibility"}

const Foodbanks = () => {
  const [foodbanks, setFoodbanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: "",
    state: "",
    zipcode: "",
    urgency: "",
    eligibility: "",
    languages: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [applyFilters, setApplyFilters] = useState(0);

  const [activeSort, setActiveSort] = useState(null); // tracks which button is active
  const [sortDirection, setSortDirection] = useState(null); // 'asc', 'desc', or null

  const getSortValue = () => {
    if (!activeSort || !sortDirection) return null;
    
    const key = `${activeSort} ${sortDirection === 'asc' ? 'Asc.' : 'desc.'}`;
    return SORT_MAPPINGS[key];
  };

  const renderArrow = (attribute) => {
    if (activeSort !== attribute || !sortDirection) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const getButtonClass = (attribute) => {
    return activeSort === attribute && sortDirection
      ? "btn btn-primary"
      : "btn btn-outline-primary";
  };

  const handleSort = (attribute) => {
    if (activeSort === attribute) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setActiveSort(null);
      }
    } else {
      setActiveSort(attribute);
      setSortDirection('asc');
    }
  };

  useEffect(() => {
    const sortValue = getSortValue();
    fetchFoodBanks({sortVal: sortValue || ""})
  }, [activeSort, sortDirection]);  

  const fetchFoodBanks = async ({sortVal} = {sortVal: ""}) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        size: MAX_ITEMS,
        ...(filters.city && { city: filters.city }),
        ...(filters.state && { state: filters.state }),
        ...(filters.zipcode && { zipcode: filters.zipcode }),
        ...(filters.urgency && { urgency: filters.urgency }),
        ...(filters.eligibility && { eligibility: filters.eligibility }),
        ...(filters.languages && { languages: filters.languages }),
        sort: sortVal
      });

      const fullURL = `${BASE_URL}?${params.toString()}`;
      console.log("Fetching URL:", fullURL);

      const response = await fetch(fullURL);
      if (!response.ok) throw new Error("Failed to fetch food banks");
      const data = await response.json();

      setFoodbanks(data.items || []);
      setCurrentPage(1); // reset to first page when filters change
    } catch (error) {
      console.error("Error fetching food banks:", error);
      setFoodbanks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodBanks();
  }, [applyFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleApplyFilters = () => setApplyFilters((prev) => prev + 1);

  const handleClearFilters = () => {
    setFilters({
      city: "",
      state: "",
      zipcode: "",
      urgency: "",
      eligibility: "",
      languages: "",
    });
    setApplyFilters((prev) => prev + 1);
    setCurrentPage(1)
    setSortDirection(null);
    setActiveSort(null);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedFbs = foodbanks.slice(startIndex, endIndex);
  const totalPages = Math.ceil(foodbanks.length / ITEMS_PER_PAGE);

  if (loading) return <div className="text-center my-5">Loading...</div>;

  return (
    <div id="wrapper">
      <Navbar />
      <Header headerText="Food Banks" />

      <main className="container my-5">
        {/* Filters */}
        <div className="d-flex flex-wrap gap-2 mb-4 align-items-center">
          {/* City filter */}
          <select name="city" value={filters.city} onChange={handleFilterChange} className="form-select w-auto">
            <option value="">Cities</option>
            <option value="Commerce">Commerce</option>
            <option value="Louisville">Louisville</option>
            <option value="Newton">Newton</option>
            <option value="Houston">Houston</option>
            <option value="Mesa">Mesa</option>
            <option value="S Salt Lake">S Salt Lake</option>
            <option value="Mills River">Mills River</option>
            <option value="Greeley">Greeley</option>
            <option value="Woodland">Woodland</option>
            <option value="Stockton">Stockton</option>
            <option value="Fort Worth">Fort Worth</option>
            <option value="Seattle">Seattle</option>
            <option value="Puyallup">Puyallup</option>
            <option value="Chester">Chester</option>
            <option value="Carefree">Carefree</option>
            <option value="Lynnwood">Lynnwood</option>
            <option value="Sahuarita">Sahuarita</option>
            <option value="Auburn">Auburn</option>
            <option value="Edmonds">Edmonds</option>
            <option value="Covington">Covington</option>
          </select>

          {/* State filter */}
          <select name="state" value={filters.state} onChange={handleFilterChange} className="form-select w-auto">
            <option value="">States</option>
            {["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Zipcode filter */}
          <input
            type="text"
            name="zipcode"
            placeholder="Zipcode"
            value={filters.zipcode}
            onChange={handleFilterChange}
            className="form-control w-auto"
          />

          {/* Urgency filter */}
          <select name="urgency" value={filters.urgency} onChange={handleFilterChange} className="form-select w-auto">
            <option value="">Urgency Levels</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option> 
          </select>

          {/* Eligibility filter */}
          <select name="eligibility" value={filters.eligibility} onChange={handleFilterChange} className="form-select w-auto">
            <option value="">Eligibility</option>
            <option value="Everybody">Everybody</option>
            <option value="Families">Families</option>
            <option value="Seniors">Seniors</option>
          </select>

          {/* Languages filter */}
          <select name="languages" value={filters.languages} onChange={handleFilterChange} className="form-select w-auto">
            <option value="">Languages</option>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
          </select>

          <button className="btn btn-primary" onClick={handleApplyFilters}>
            Apply
          </button>
          <button className="btn btn-secondary btn" onClick={handleClearFilters}>
            Clear
          </button>
        </div>
        {/* Sorting Buttons */}
        <div style={{textAlign:"center", margin:"2em"}}>
          <div className="btn-group" role="group" style={{textAlign:"center"}}>
            <button type="btn" class={getButtonClass(`Name`)} onClick={() => handleSort(`Name`)}>Name {renderArrow(`Name`)}</button>
            <button type="btn" class={getButtonClass(`City`)} onClick={() => handleSort(`City`)}>City {renderArrow(`City`)}</button>
            <button type="btn" class={getButtonClass(`Zip Code`)} onClick={() => handleSort(`Zip Code`)}>Zip Code {renderArrow(`Zip Code`)}</button>
            <button type="btn" class={getButtonClass(`Urgency`)} onClick={() => handleSort(`Urgency`)}>Urgency {renderArrow(`Urgency`)}</button>
            <button type="btn" class={getButtonClass(`Eligibility`)} onClick={() => handleSort(`Eligibility`)}>Eligibility {renderArrow(`Eligibility`)}</button>
          </div>
        </div>

        {/* Showing X–Y / total */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="mb-0">
            Showing {displayedFbs.length ? `${startIndex + 1} - ${startIndex + displayedFbs.length}` : "0"} / {foodbanks.length} foodbanks
          </p>
        </div>

        {/* Foodbanks Grid */}
        <div className="row g-4">
          {displayedFbs.length > 0 ? (
            displayedFbs.map((bank) => (
              <div key={bank.id} className="col-md-4">
                <div className="border p-2 rounded"> {/* Light border wrapper */}
                  <FoodbankCard
                    id={bank.id}
                    name={bank.name}
                    city={bank.city}
                    zipcode={bank.zipcode}
                    urgency={bank.urgency}
                    eligibility={bank.eligibility}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-center mt-5">No foodbanks found matching your criteria.</p>
          )}
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-center mt-4 gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="align-self-center">Page {currentPage} / {totalPages}</span>
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
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
