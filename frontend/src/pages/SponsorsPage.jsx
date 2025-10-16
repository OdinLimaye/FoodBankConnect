import { useEffect } from "react";

import Navbar from "../components/Navbar.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

import SponsorCard from "../components/SponsorCard.jsx";

const SponsorsPage = () => {
	useEffect(() => {
		const cards = document.querySelectorAll(".row.g-4 .card");
		const countDiv = document.getElementById("entry-count");
		if (countDiv)
			countDiv.textContent = `Showing ${cards.length} Sponsors in Total`;
	}, []);

	return (
		<>
			<Navbar />
			<Header HeaderText="Sponsors and Donors" />

			<main className="container-fluid my-5">
				<div id="entry-count" className="mb-4 text-muted"></div>

				<div className="row g-4">
					<div className="col-md-4">
						<SponsorCard
							sponsor_img="../../public/trader-joes.png"
							sponsor_alt="Trader Joe's Logo"
							name="Trader Joe's"
							contribution="Food Sourcing"
							contribution_amt="180000"
							contribution_unit="Pounds"
							affiliation="Private Corporation"
							past_inv="Hope Food Pantry"
						/>
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
};

export default SponsorsPage;
