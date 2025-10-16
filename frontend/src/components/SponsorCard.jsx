import "./SponsorCard.css";
import { useNavigate } from "react-router-dom";

const SponsorCard = ({
	sponsor_img,
	sponsor_alt,
	name,
	contribution,
	contribution_amt,
	contribution_unit,
	affiliation,
	past_inv,
	sponsor_details
}) => {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate(`/sponsors/${name}`, {
			state: {
				sponsor_img,
				sponsor_alt,
				name,
				contribution,
				contribution_amt,
				contribution_unit,
				affiliation,
				past_inv,
				sponsor_details
			},
		});
	};

	return (
		<div
			className="card sponsor-card h-100 shadow-sm"
			onClick={handleClick}
			style={{ cursor: "pointer" }}>
			<div className="sponsor-img-container">
				<img src={sponsor_img} alt={sponsor_alt} />
			</div>
			<div className="card-body">
				<h5 className="card-title">{name}</h5>
				<p className="card-text">
					<strong>Contribution:</strong> {contribution}
					<br />
					<strong>Amount:</strong> {contribution_amt} {contribution_unit}
					<br />
					<strong>Affiliation:</strong> {affiliation}
					<br />
					<strong>Past Involvement:</strong> {past_inv}
				</p>
				<a href={sponsor_details} className="btn btn-primary">
					View Details
				</a>
			</div>
		</div>
	);
};

export default SponsorCard;
