import React, { useState } from "react";
import styles from "../styles/SearchPage.module.css";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data);
  };

  // Highlight matching text
  const highlight = (text, term) => {
    const regex = new RegExp(`(${term})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  };

  return (
    <div className={styles.container}>
      <h1>Search the Site</h1>
      <form onSubmit={handleSearch} className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search for food banks, sponsors, or programs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <div className={styles.results}>
        {results.length === 0 && query && <p>No results found.</p>}
        {results.map((r, i) => (
          <div key={i} className={styles.resultCard}>
            <p className={styles.modelTag}>{r.model}</p>
            <a
              href={`/${r.model.toLowerCase()}/${r.id}`}
              dangerouslySetInnerHTML={{
                __html: `<strong>${r.name}</strong>`,
              }}
            />
            <p
              dangerouslySetInnerHTML={{
                __html: highlight(r.snippet, query),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
