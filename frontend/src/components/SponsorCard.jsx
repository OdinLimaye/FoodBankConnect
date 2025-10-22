import { useNavigate } from "react-router-dom";
import styles from "./SponsorCard.module.css";

const SponsorCard = ({
	id,
	sponsor_img,
	sponsor_alt,
	name,
	affiliation,
	city,
	state,
}) => {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate(`/sponsors/${id}`, {
			state: { id }, // instance page will fetch full info
		});
	};

	return (
		<div
			className={`card ${styles["sponsor-card"]} h-100 shadow-sm`}
			onClick={handleClick}
			style={{ cursor: "pointer" }}
		>
			<div className={styles["sponsor-img-container"]}>
				<img src={sponsor_img} alt={sponsor_alt} />
			</div>
			<div className={styles["card-body"]}>
				<p className={styles["text"]}>
					<strong>Name:</strong> {name}
					<br />
					<strong>Contribution:</strong> Donations / Grants
					<br />
					<strong>Affiliation:</strong> {affiliation}
					<br />
					<strong>City:</strong> {city}
					<br />
					<strong>State:</strong> {state}
				</p>
			</div>
		</div>
	);
};

export default SponsorCard;
