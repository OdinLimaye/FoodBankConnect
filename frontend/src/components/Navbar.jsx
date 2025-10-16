import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
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
					<ul className="navbar-nav ms-auto">
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
					</ul>
				</div>
			</div>
		</nav>
	);
};
export default Navbar;
