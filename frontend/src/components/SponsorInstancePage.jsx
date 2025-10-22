import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";
import styles from "../styles/Sponsors.module.css";

const BASE_URL = "https://api.foodbankconnect.me/v1/sponsors";

const SponsorInstancePage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { id } = location.state || {};
	const [sponsor, setSponsor] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSponsor = async () => {
			if (!id) {
				setLoading(false);
				return;
			}
			try {
				const res = await fetch(`${BASE_URL}/${id}`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const data = await res.json();
				setSponsor(data);
			} catch (err) {
				console.error("Error fetching sponsor:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchSponsor();
	}, [id]);

	const handleNavigate = (type) => {
		if (!sponsor?.id) return;
		if (type === "foodbank") {
			navigate(`/foodbanks/${sponsor.id}`, { state: { id: sponsor.id, name: sponsor.name } });
		} else if (type === "program") {
			navigate(`/programs/${sponsor.id}`, { state: { id: sponsor.id, name: sponsor.name } });
		}
	};

	if (loading) return <div className="container my-5">Loading sponsor details...</div>;
	if (!sponsor) return <div className="container my-5">Sponsor not found.</div>;

	return (
		<div id="wrapper">
			<Navbar />
			<Header headerText={"Sponsors & Donors - " + sponsor.name} />
			<Breadcrumb model_type="sponsors" current_page={sponsor.name} />

			<main className="container my-5">
				<div className={`${styles["sponsor-img-container"]} text-center mb-4`}>
					{sponsor.image ? (
						<img
							src={sponsor.image}
							alt={sponsor.alt || sponsor.name + " Logo"}
						/>
					) : (
						<p>No image found</p>
					)}
				</div>

				<section className={`mb-4 ${styles.about}`}>
					<h2>About</h2>
					<p>{sponsor.about}</p>
				</section>

				<section className="mb-4">
					<h2>Details</h2>
					<ul style={{ listStyle: "none" }}>
						<li><strong>Affiliation:</strong> {sponsor.affiliation}</li>
						<li><strong>Contribution:</strong> {sponsor.contribution}</li>
						<li><strong>Contribution Amount:</strong> {sponsor.contribution_amt}</li>
						<li><strong>City:</strong> {sponsor.city}</li>
						<li><strong>State:</strong> {sponsor.state}</li>
						<li>
							<strong>Past Involvement:</strong> {sponsor.past_involvement || "N/A"}
							<br />
							<a
								href="#"
								onClick={(e) => {
									e.preventDefault();
									handleNavigate("foodbank");
								}}
							>
								View Related Foodbank
							</a>{" "}
							|{" "}
							<a
								href="#"
								onClick={(e) => {
									e.preventDefault();
									handleNavigate("program");
								}}
							>
								View Related Program
							</a>
						</li>
						<li style={{ marginTop: "25px" }}>
							<strong>Website:</strong>{" "}
							<a href={sponsor.sponsor_link} target="_blank" rel="noreferrer">
								{sponsor.sponsor_link}
							</a>
						</li>
						<li><strong>Media / Logo Alt:</strong> {sponsor.alt}</li>
						<li><strong>EIN:</strong> {sponsor.ein}</li>
						<li><strong>Created At:</strong> {sponsor.created_at}</li>
						<li><strong>Fetched At:</strong> {sponsor.fetched_at}</li>
						<li><strong>Type:</strong> {sponsor.type}</li>
						<li><strong>ID:</strong> {sponsor.id}</li>
					</ul>
				</section>

				{sponsor.map_link && (
					<section className={`${styles["map-container"]} mt-3`}>
						<iframe
							style={{ width: "80%", height: "450px" }}
							src={sponsor.map_link}
							allowFullScreen=""
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
						></iframe>
					</section>
				)}
			</main>

			<Footer />
		</div>
	);
};

export default SponsorInstancePage;
