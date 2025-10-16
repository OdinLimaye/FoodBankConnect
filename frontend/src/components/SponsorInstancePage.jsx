import { useLocation, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";

import "../styles/Sponsors.css"

const SponsorInstancePage = () => {
	const location = useLocation();
	const {
		sponsor_img,
		sponsor_alt,
		name,
		contribution,
		contribution_amt,
		contribution_unit,
		affiliation,
		past_inv,
	} = location.state || {};

	return (
		<div id="wrapper">
			<Navbar />
			<Header headerText={"Sponsors & Donors - " + name} />
			<Breadcrumb model_type="sponsors" current_page={name} />

			{/* <!--Main container--> */}
			<main className="container my-5">
				<div className="sponsor-img-container">
					<img src={sponsor_img} alt={sponsor_alt} />
				</div>
				<div>
					<h1>About</h1>
					<p>
						{/* {about} */}
					</p>
					<h1>Details</h1>
					<ul style={{listStyle: "none"}}>
						<li>
							<p>
								<strong>Contribution Type:</strong> {contribution}
							</p>
						</li>
						<li>
							<p>
								<strong>Contribution Amount:</strong> {contribution_amt}
							</p>
						</li>
						<li>
							<p>
								<strong>Contribution Unit:</strong> {contribution_unit}
							</p>
						</li>
						<li>
							<p>
								<strong>Affiliation: </strong> {affiliation}
							</p>
						</li>
						<li>
							{
							/*Figure out how to link to other instance pages
							 *May want to send in an array of past involvements and
							 *loop through array creating various link components to
							 *other instance pages
							 *Perhaps list of tuples [(model type : instance of model)]
							 *e.g. (Sponsor : Trader Joe's)
							 */
							}
							<p>
								<strong>Past Involvement: </strong>
								{
									// past_inv.map((inv) =>(
									// 	<Link>{inv}</Link>
									// ))
								}
							</p>
						</li>
						<li style={{marginTop: "25px"}}>
							<a
								href=""
								// {website_url}
								target="_blank">
								<strong>Website: </strong> 
								{/* {website_url} */}
							</a>
						</li>
					</ul>
					{/* <div className="map-container mt-3">
						<iframe
							style={{width: "80%", height: "450px", textAlign: "center"}}
							src=""
							// {map_link}
							allowfullscreen=""
							loading="lazy"
							referrerpolicy="no-referrer-when-downgrade"></iframe>
					</div> */}
				</div>
			</main>

			<Footer />
		</div>
	);
};
export default SponsorInstancePage;
