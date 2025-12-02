import "../styles/Programs.css";
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProgramCard from "../components/ProgramsCard";

const BASE_URL = "https://dp3d297dp9.execute-api.us-east-2.amazonaws.com/v1/programs";
const ITEMS_PER_PAGE = 21;
const ALL_ENTRIES = 100; //temporary hardocded value

const SORT_MAPPINGS = {"Name Asc." : "name",
                      "Name desc." : "-name", 
                      "Host Asc." : "host",
                      "Host desc." : "-host",
                      "Frequency Asc." : "frequency",
                      "Frequency desc." : "-frequency",
                      "Service Type Asc.":"program_type",
                      "Service Type desc.":"-program_type",
                      "Eligibility Asc.":"eligibility",
                      "Eligibility desc.":"-eligibility"}

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [filters, setFilters] = useState({
    frequency: "",
    eligibility: "",
    cost: "",
    program_type: "",
    host: "", // new host filter
  });

  const [applyFilters, setApplyFilters] = useState(0);
  const [allHosts, setAllHosts] = useState([]); // store unique hosts

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
    fetchPrograms(null, {sortVal: sortValue || ""})
  }, [activeSort, sortDirection]);  

  // Fetch programs from backend
  const fetchPrograms = async (startCursor = null, {sortVal} = {sortVal: ""}) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        size: ALL_ENTRIES,
        ...(startCursor && { start: startCursor }),
        ...(filters.frequency && { frequency: filters.frequency }),
        ...(filters.eligibility && { eligibility: filters.eligibility }),
        ...(filters.cost && { cost: filters.cost }),
        ...(filters.program_type && { program_type: filters.program_type }),
        ...(filters.host && { host: filters.host }),
        sort: sortVal
      });

      const fullURL = `${BASE_URL}?${params.toString()}`;
      console.log("Fetching URL:", fullURL);

      const response = await fetch(fullURL);
      if (!response.ok) throw new Error(`Failed to fetch programs: ${response.status}`);
      const data = await response.json();

      setPrograms(data.items || []);

      // extract unique hosts for dropdown if not already done
      if (allHosts.length === 0 && data.items) {
        const hosts = Array.from(new Set(data.items.map((p) => p.host))).sort();
        setAllHosts(hosts);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms(null);
  }, [applyFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setApplyFilters((prev) => prev + 1);
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setFilters({
      frequency: "",
      eligibility: "",
      cost: "",
      program_type: "",
      host: "",
    });
    setApplyFilters(prev => prev + 1);
    setCurrentPage(1)
    setSortDirection(null);
    setActiveSort(null);
  };

  useEffect(() => {
    const newTotalPages = Math.ceil(programs.length / ITEMS_PER_PAGE) || 1;
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [programs, currentPage]);

  if (loading) return <div className="text-center my-5">Loading programs...</div>;

  const totalPages = Math.ceil(programs.length / ITEMS_PER_PAGE) || 1;


  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = currentPage * ITEMS_PER_PAGE;
  const displayedPrograms = programs.slice(startIndex, endIndex);

  const showEnd = startIndex + displayedPrograms.length;
  const showStart = (displayedPrograms.length > 0 ? startIndex + 1 : startIndex);

  return (
    <div className="programs-page">
      <Navbar />
      <Header
        headerText="Programs & Volunteer Opportunities"
        subText="Explore how you can participate or benefit from local programs."
      />

      <main className="container my-5">
        {error && (
          <div className="container my-5 text-warning">
            Failed to load live data: {error}
          </div>
        )}

        {/* FILTERS */}
        <div className="container mb-4">
          <div className="d-flex flex-wrap gap-3">
            <select name="frequency" value={filters.frequency} onChange={handleFilterChange} className="form-select w-auto">
              <option value="">All Frequencies</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>

            <select name="eligibility" value={filters.eligibility} onChange={handleFilterChange} className="form-select w-auto">
              <option value="">All Eligibility</option>
              <option value="Everybody">Everybody</option>
              <option value="Families">Families</option>
              <option value="Seniors">Seniors</option>
            </select>

            <select name="cost" value={filters.cost} onChange={handleFilterChange} className="form-select w-auto">
              <option value="">All Costs</option>
              <option value="Free">Free</option>
              <option value="Paid">Paid</option>
            </select>

            <select name="program_type" value={filters.program_type} onChange={handleFilterChange} className="form-select w-auto">
              <option value="">All Program Types</option>
              <option value="Food Distribution">Food Distribution</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Education">Education</option>
              <option value="Service">Service</option>
            </select>

            {/* HOST FILTER */}
            <select name="host" value={filters.host} onChange={handleFilterChange} className="form-select w-auto">
              <option value="">All Hosts</option>
              {allHosts.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>

            <button className="btn btn-primary" onClick={handleApplyFilters}>
              Apply
            </button>
            <button className="btn btn-secondary" onClick={handleClearFilters}>
              Clear
            </button>
          </div>
          {/* Sorting Buttons */}
          <div style={{textAlign:"center", margin:"2em"}}>
            <div className="btn-group" role="group" style={{textAlign:"center"}}>
              <button type="btn" class={getButtonClass(`Name`)} onClick={() => handleSort(`Name`)}>Name {renderArrow(`Name`)}</button>
              <button type="btn" class={getButtonClass(`Host`)} onClick={() => handleSort(`Host`)}>Host {renderArrow(`Host`)}</button>
              <button type="btn" class={getButtonClass(`Frequency`)} onClick={() => handleSort(`Frequency`)}>Frequency {renderArrow(`Frequency`)}</button>
              <button type="btn" class={getButtonClass(`Service Type`)} onClick={() => handleSort(`Service Type`)}>Service Type {renderArrow(`Service Type`)}</button>
              <button type="btn" class={getButtonClass(`Eligibility`)} onClick={() => handleSort(`Eligibility`)}>Eligibility {renderArrow(`Eligibility`)}</button>            
            </div>
          </div>
        </div>

        {/* PROGRAM CARDS */}
        <main className="container my-5">
          <p className="mb-0">
            Showing {`${showStart} ${programs.length > 0 ? `- ${showEnd}` : ""}`} / {programs.length} programs
          </p>
          <div className="card-grid">
            {programs.length > 0 ? (
              displayedPrograms.map((p) => (
                <ProgramCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  program_type={p.program_type}
                  freq={p.frequency}
                  host={p.host}
                  eligibility={p.eligibility}
                  cost={p.cost}
                />
              ))
            ) : (
              <p className="text-center mt-5">No programs found matching your criteria.</p>
            )}
          </div>

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
      </main>

      <Footer />
    </div>
  );
};

export default Programs; 