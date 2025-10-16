const FoodBankCard = ({
	name,
	address,
	location,
	zip,
	capacity,
	days,
	hours,
	urgency,
	link,
	map,
}) => {
	return (
		<>
			<style>{`
            .map-container {
                position: relative;
                width: 100%;
                height: 200px;
                margin-top: 10px;
                border-radius: 6px;
                overflow: hidden;
            }
            .map-container iframe {
                width: 100%;
                height: 100%;
                border: 0;
            }
        `}</style>
			<div className="card h-100 shadow-sm">
				<div className="card-body">
					<h5 className="card-title">{name}</h5>
					<p className="card-text">
						<strong>Address:</strong> {address}
						<br />
						<strong>City:</strong> {location}
						<br />
						<b>ZIP Code:</b> {zip}
						<br />
						<b>Capacity:</b> Over {capacity} meals/week
						<br />
						<b>Hours:</b> {days}, {hours}
						<br />
						<b>Urgency:</b> {urgency}
					</p>
					<a href="" className="btn btn-primary">
						View Details
					</a>
					<div className="map-container mt-3">
						<iframe
							src={map}
							allowfullscreen=""
							loading="lazy"
							referrerpolicy="no-referrer-when-downgrade"></iframe>
					</div>
				</div>
			</div>
		</>
	);
};
export default FoodBankCard;
