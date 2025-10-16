import { Link } from "react-router-dom";

const Breadcrumb = ({ model_type, current_page }) => {
	let model_page;
	if (model_type === "foodbanks") model_page = "Food Banks"
	else if (model_type === "programs") model_page = "Programs"
	else model_page = "Sponsors & Donors"
	return (
		<nav aria-label="breadcrumb" class="bg-light py-2">
			<div class="container">
				<ol class="breadcrumb mb-0">
					<li class="breadcrumb-item">
						<Link to="/">Home</Link>
					</li>
					<li class="breadcrumb-item">
						<Link to={"/" + model_type}>{model_page}</Link>
					</li>
					<li class="breadcrumb-item active" aria-current="page">
						{current_page}
					</li>
				</ol>
			</div>
		</nav>
	);
};

export default Breadcrumb;
