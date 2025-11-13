import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles/SearchPage.module.css";

const BASE_URL = "https://api.foodbankconnect.me/v1/search";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(urlQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setResults(data.items || []);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (urlQuery) {
      setQuery(urlQuery);
      performSearch(urlQuery);
    }
  }, [urlQuery, performSearch]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const highlight = (text, term) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  };

  return (
    <div id="wrapper">
      <Navbar />
      <Header headerText="Search" />

      <main className={styles.container}>
        <form onSubmit={handleSearch} className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search for food banks, sponsors, or programs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && (
          <div
            style={{
              background: "rgba(255, 100, 100, 0.15)",
              color: "#ffecec",
              padding: "0.8em 1.2em",
              borderRadius: "10px",
              marginBottom: "1.5em",
            }}
          >
            {error}
          </div>
        )}

        <div className={styles.results}>
          {loading && <p style={{ color: "#fff", opacity: 0.8 }}>Searching...</p>}
          {!loading && results.length === 0 && query && (
            <p style={{ color: "#808080bd", opacity: 0.8 }}>No results found.</p>
          )}
          
          {!loading && results.length > 0 && (
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                maxWidth: "750px",
                color: "#808080bd",
              }}
            >
              <p style={{ margin: 0 }}>Found {results.length} results</p>
            </div>
          )}
          {!loading &&
            results.map((r, i) => {
              const modelPath = r.model.toLowerCase();
              const routePath = `/${modelPath}/${encodeURIComponent(r.name)}`;
              const modelDisplay =
                r.model.charAt(0).toUpperCase() + r.model.slice(1);

              return (
                <div key={i} className={styles.resultCard}>
                  <span className={styles.modelTag}>{modelDisplay}</span>
                  <Link
                    to={routePath}
                    state={{ id: r.id, name: r.name }}
                    dangerouslySetInnerHTML={{
                      __html: `<strong>${r.name}</strong>`,
                    }}
                  />
                  <p
                    style={{ marginTop: "0.3em" }}
                    dangerouslySetInnerHTML={{
                      __html: highlight(r.snippet, query),
                    }}
                  />
                </div>
              );
            })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
