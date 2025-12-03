import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
	const navigate = useNavigate();
	const [query, setQuery] = useState("");

	const handleSearch = (e) => {
		e.preventDefault();
		const trimmed = query.trim();
		if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`);
	};

	return (
		<nav className="navbar navbar-expand-lg navbar-dark bg-primary">
			<div className="container-fluid">
				<Link className="navbar-brand" to="/">
					<img
						src="/favicon.svg"
						alt="My SVG"
						height="50"
						width="50"
						style={{ marginLeft: "32%", marginRight: "5px" }}
					/>
					FoodBankConnect
				</Link>

				<div className="collapse navbar-collapse">
					<ul className="navbar-nav ms-auto align-items-center">
						<li className="nav-item">
							<NavLink className="nav-link" to="/about">
								About
							</NavLink>
						</li>
						<li className="nav-item">
							<NavLink className="nav-link" to="/foodbanks">
								Food Banks
							</NavLink>
						</li>
						<li className="nav-item">
							<NavLink className="nav-link" to="/programs">
								Programs
							</NavLink>
						</li>
						<li className="nav-item">
							<NavLink className="nav-link" to="/sponsors">
								Sponsors
							</NavLink>
						</li>

						<li className="nav-item">
							<NavLink className="nav-link" to="/visualizations">
								Visualizations
							</NavLink>
						</li>

						<li className="nav-item">
							<NavLink className="nav-link" to="/provider-visualizations">
								Provider Visualizations
							</NavLink>
						</li>

						{/* 🔍 Search form (added here) */}
						<li className="nav-item ms-3">
							<form className="d-flex" onSubmit={handleSearch}>
								<input
									className="form-control me-2"
									type="search"
									placeholder="Search..."
									aria-label="Search"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									style={{
										backgroundColor: "rgba(255,255,255,0.15)",
										color: "white",
										border: "none",
									}}
								/>
								<button
									className="btn btn-outline-light"
									type="submit"
									style={{
										borderColor: "rgba(255,255,255,0.4)",
										color: "white",
									}}
								>
									Search
								</button>
							</form>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;