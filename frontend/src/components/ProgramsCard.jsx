import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button"

const ProgramCard = ({
	name,
	type,
	elig,
	freq,
	cost,
	host,
	img,
	about,
	sign_up_link,
	map_link,
}) => {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate(`/programs/${name}`, {
			state: {
				name,
				type,
				elig,
				freq,
				cost,
				img,
				about,
				sign_up_link,
			},
		});
	};
	return (
		<div className="card h-100 shadow-sm">
			<img src={img} className="card-img-top" alt={name} />
			<div className="card-body">
				<h5 className="card-title">{name}</h5>
				<p>
					<strong>Type:</strong> {type}
				</p>
				<p>
					<strong>Eligibility:</strong> {elig}
				</p>
				<p>
					<strong>Frequency: </strong> {freq}
				</p>
				<p>
					<strong>Cost:</strong> {cost}
				</p>
				<p>
					<strong>Host:</strong> {host}
				</p>
				<Button className="btn btn-primary w-100" onClick={handleClick}>See Details</Button>
			</div>
		</div>
	);
};

export default ProgramCard;
