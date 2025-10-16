import { useEffect } from "react";

import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";

import FoodBankCard from "../components/FoodbankCard";

const FoodbanksPage = () => {
	useEffect(() => {
		const cards = document.querySelectorAll(".row.g-4 .card");
		const countDiv = document.getElementById("entry-count");
		if (countDiv)
			countDiv.textContent = `Showing ${cards.length} Sponsors in Total`;
	}, []);

	return (
		<>
			<Navbar />
			<Header HeaderText="Food Banks & Pantries" />
			
			<main className="container-fluid my-5">
				<div id="entry-count" className="mb-4 text-muted"></div>

				<div className="row g-4">
					<div className="col-md-4">
						<FoodBankCard
							name="Central Texas Food Bank"
							address="6500 Metropolis Dr"
							location="Austin, Texas"
							zip="78744"
							capacity="50,000"
							days="Mon - Fri"
							hours="8am - 5pm"
							urgency="Very High"
							map="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3494.752241848126!2d-97.72812878492573!3d30.209804181828063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644ca413aee7993%3A0xe8b2038e2cbb9fae!2sCentral%20Texas%20Food%20Bank!5e0!3m2!1sen!2sus!4v1695933088442"
						/>
					</div>
				</div>
			</main>{" "}
			<Footer />
		</>
	);
};
export default FoodbanksPage;
