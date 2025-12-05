import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SponsorCard from "../components/SponsorCard";
import "../styles/Sponsors.css";
import "../styles/CardStyles.css";

const BASE_URL = "https://dp3d297dp9.execute-api.us-east-2.amazonaws.com/v1/sponsors";
const ITEMS_PER_PAGE = 21;
const ALL_ENTRIES = 175; //temporary hardocded value

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

const SORT_MAPPINGS = {"Name Asc." : "name",
                      "Name desc." : "-name", 
                      "Contribution Asc." : "contribution",
                      "Contribution desc." : "-contribution",
                      "Affiliation Asc." : "affiliation",
                      "Affiliation desc." : "-affiliation",
                      "City Asc.":"city",
                      "City desc.":"-city",
                      "State Asc.":"state",
                      "State desc.":"-state"}


const Sponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    name: "",
    affiliation: "",
    contribution: "",
    city: "",
    state: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [applyFilters, setApplyFilters] = useState(0);

  // Store full dropdown options so they don't disappear
  const [allNames, setAllNames] = useState([]);
  const [allAffiliations, setAllAffiliations] = useState([]);
  const [allContributions, setAllContributions] = useState([]);

  //states for sort buttons
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
    fetchSponsors(null, {sortVal: sortValue || ""})
  }, [activeSort, sortDirection]);

  const fetchSponsors = async (startCursor = null, {sortVal} = {sortVal: ""}) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        size: ALL_ENTRIES,
        ...(startCursor && { start: startCursor }),
        ...(filters.name && { name: filters.name }),
        ...(filters.affiliation && { affiliation: filters.affiliation }),
        ...(filters.contribution && { contribution: filters.contribution }),
        ...(filters.city && { city: filters.city }),
        ...(filters.state && { state: filters.state }),
        sort: sortVal
      });

      const res = await fetch(`${BASE_URL}?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      setSponsors(data.items || []);

      // Populate dropdowns only once
      if (allNames.length === 0) setAllNames(Array.from(new Set(data.items.map(s => s.name))).sort());
      if (allAffiliations.length === 0) setAllAffiliations(Array.from(new Set(data.items.map(s => s.affiliation))).sort());
      if (allContributions.length === 0) setAllContributions(Array.from(new Set(data.items.map(s => s.contribution))).sort());

    } catch (err) {
      console.error(err);
      setError(err.message);
      setSponsors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors(null);
  }, [applyFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => setApplyFilters(prev => prev + 1);

  const handleClearFilters = () => {
    setFilters({
      name: "",
      affiliation: "",
      contribution: "",
      city: "",
      state: "",
    });
    setApplyFilters((prev) => prev + 1);
    setCurrentPage(1)
    setSortDirection(null);
    setActiveSort(null);
  };

  if (loading) return <div className="text-center my-5">Loading...</div>;
  const totalPages = Math.ceil(sponsors.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedSponsors = sponsors.slice(startIndex, endIndex);

  const showEnd = startIndex + displayedSponsors.length;
  const showStart = (displayedSponsors.length > 0 ? startIndex + 1 : startIndex);

  return (
    <div className="sponsors-page">
      <Navbar />
      <Header headerText="Sponsors & Donors" />
      <main className="container my-5">
        {error && <div className="container my-5 text-warning">Failed to load: {error}</div>}

        {/* Filters and Sorting*/}
        <div className="container mb-4">
          <div className="d-flex flex-wrap gap-3">

            {/* Name filter */}
            <select name="name" value={filters.name} onChange={handleFilterChange} className="form-select w-auto">
              <option value="">All Names</option>
              {allNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>

            {/* Affiliation filter */}
            <select name="affiliation" value={filters.affiliation} onChange={handleFilterChange} className="form-select w-auto">
              <option value="">All Affiliations</option>
              {allAffiliations.map(aff => <option key={aff} value={aff}>{aff}</option>)}
            </select>

            {/* Contribution filter */}
            <select name="contribution" value={filters.contribution} onChange={handleFilterChange} className="form-select w-auto">
              <option value="">All Contributions</option>
              {allContributions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* City filter */}
            <input type="text" name="city" placeholder="City" value={filters.city} onChange={handleFilterChange} className="form-control w-auto" />

            {/* State filter */}
            <select name="state" value={filters.state} onChange={handleFilterChange} className="form-select w-auto" style={{ maxWidth: "100px" }}>
              <option value="">States</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <button className="btn btn-primary" onClick={handleApplyFilters}>Apply</button>
            <button className="btn btn-secondary" onClick={handleClearFilters}>Clear</button>
          </div>
          {/* Sorting Buttons */}
          <div style={{textAlign:"center", margin:"2em"}}>
            <div className="btn-group" role="group" style={{textAlign:"center"}}>
              <button type="btn" class={getButtonClass(`Name`)} onClick={() => handleSort(`Name`)}>Name {renderArrow(`Name`)}</button>
              <button type="btn" class={getButtonClass(`Contribution`)} onClick={() => handleSort(`Contribution`)}>Contribution {renderArrow(`Contribution`)}</button>
              <button type="btn" class={getButtonClass(`Affiliation`)} onClick={() => handleSort(`Affiliation`)}>Affiliation {renderArrow(`Affiliation`)}</button>
              <button type="btn" class={getButtonClass(`City`)} onClick={() => handleSort(`City`)}>City {renderArrow(`City`)}</button>
              <button type="btn" class={getButtonClass(`State`)} onClick={() => handleSort(`State`)}>State {renderArrow(`State`)}</button>
            </div>
          </div>

        </div>

        {/* Sponsor Grid */}
        <main className="container my-5">
          <div>
            <p className="mb-0">
              Showing {`${showStart} ${sponsors.length > 0 ? `- ${showEnd}` : ""}`} / {sponsors.length} programs
            </p>
            <div className="card-grid">
              {sponsors.length > 0 ? displayedSponsors.map(s => (
                <SponsorCard
                  key={s.id}
                  id={s.id}
                  sponsor_img={s.image}
                  sponsor_alt={s.alt || `${s.name} Logo`}
                  name={s.name}
                  affiliation={s.affiliation}
                  contribution={s.contribution}
                  city={s.city}
                  state={s.state}
                />
              )) : (
                <div className="text-center text-muted my-5">No sponsors found matching your filters.</div>
              )}
            </div>
          </div>
        </main>

        {/* Pagination */}
        <div className="d-flex justify-content-center mt-4 gap-2">
            <button className="btn btn-secondary" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button>
            <p>Page {currentPage} / {totalPages}</p>
            <button className="btn btn-secondary" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Sponsors;
