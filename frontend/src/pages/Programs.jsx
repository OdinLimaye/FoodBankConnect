// Programs.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";

const programsList = [
	{
		name: "Drive-Thru Food Pantry",
		type: "Distribution",
		eligibility: "Open",
		frequency: "Weekly",
		cost: "Free",
		host: "Church",
		image: "/images/drive-thru.jpg",
		detailsPage: "drive-thru-food-pantry",
	},
	{
		name: "Culinary Training Program",
		type: "Class",
		eligibility: "High School GED",
		frequency: "Yearly",
		cost: "Free",
		host: "Food Bank",
		image: "/images/cooking-case.png",
		detailsPage: "culinary-training",
	},
	{
		name: "Nutrition Education Program",
		type: "Service",
		eligibility: "Referral-based",
		frequency: "Ongoing Sessions",
		cost: "Free",
		host: "Food Bank",
		image: "/images/nutrition-education.png",
		detailsPage: "nutrition-class",
	},
];

const Programs = () => {
	const [filter, setFilter] = useState("all");

	const filteredPrograms =
		filter === "all"
			? programsList
			: programsList.filter((p) => p.type === filter);

	const handleFilterClick = (type) => {
		setFilter(type);
	};

	return (
		<div className="programs-page">
			<Navbar />
			<Header
				headerText="Programs & Volunteer Opportunities"
				subText="Explore how you can participate or benefit from local food programs."
			/>


			{/* Filter Buttons */}
			<div className="container text-center mb-4">
				<div className="btn-group">
					{["all", "Distribution", "Volunteer", "Class", "Service"].map(
						(type) => (
							<button
								key={type}
								className={`btn btn-outline-primary ${
									filter === type ? "active" : ""
								}`}
								onClick={() => handleFilterClick(type)}>
								{type === "all" ? "All" : type}
							</button>
						)
					)}
				</div>
			</div>

			{/* Program Cards */}
			<main className="container">
				<div className="mb-4 text-muted">
					Showing {filteredPrograms.length} Programs in Total
				</div>
				<div className="row g-4">
					{filteredPrograms.map((program, idx) => (
						<div key={idx} className="col-md-6 col-lg-3">
							<div className="card h-100 shadow-sm">
								<img
									src={program.image}
									className="card-img-top"
									alt={program.name}
								/>
								<div className="card-body">
									<h5 className="card-title">{program.name}</h5>
									<p>
										<strong>Type:</strong> {program.type}
									</p>
									<p>
										<strong>Eligibility:</strong> {program.eligibility}
									</p>
									<p>
										<strong>Frequency:</strong> {program.frequency}
									</p>
									<p>
										<strong>Cost:</strong> {program.cost}
									</p>
									<p>
										<strong>Host:</strong> {program.host}
									</p>
									<Link
										to={`/${program.detailsPage}`}
										className="btn btn-primary w-100">
										See Details
									</Link>
								</div>
							</div>
						</div>
					))}
				</div>
			</main>

			<Footer/>
		</div>
	);
};

export default Programs;
