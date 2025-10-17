import { useLocation, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";
import Breadcrumb from "./Breadcrumb";

const ProgramsInstancePage = () => {
	const location = useLocation();
	const {
		name,
		type,
		elig,
		freq,
		cost,
		img,
		about,
		sign_up_link,
	} = location.state || {};
	return (
		<div className="wrapper">
			<Navbar />
			<Header headerText={name}/>
			<Breadcrumb model_type="programs" current_page={name} />

			<main className="container my-5">
				<div className="row">
					<div className="col-lg-6 mb-4">
						<img
							src={img}
							className="img-fluid rounded shadow"
							alt={name}
						/>
					</div>
					<div className="col-lg-6">
						<h3 className="fw-bold" style={{textAlign:"left"}}>Program Details</h3>
						<ul className="list-group mb-3">
							<li className="list-group-item">
								<strong>Type:</strong> {type}
							</li>
							<li className="list-group-item">
								<strong>Eligibility:</strong> {elig}
							</li>
							<li className="list-group-item">
								<strong>Frequency:</strong> {freq}
							</li>
							<li className="list-group-item">
								<strong>Cost:</strong> {cost}
							</li>
							<li className="list-group-item">
								<strong>Host:</strong> <a href="../foodbanks/austin-central.html"> Central Texas Food Bank</a>
							</li>
						</ul>
						<a
							href={sign_up_link}
							target="_blank"
							className="btn btn-primary">
							View Class Schedule
						</a>
					</div>
				</div>

				<section className="mt-5">
					<h3 style={{textAlign:"left"}}>About the Program</h3>
					<p>{about}</p>
				</section>
			</main>
			<Footer/>
		</div>
	);
};
export default ProgramsInstancePage;
