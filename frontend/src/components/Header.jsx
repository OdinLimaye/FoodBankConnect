const Header = ({headerText, subText}) => {
	return (
		<header className="py-5 text-center bg-light">
			<div className="container-fluid">
				<h1 className="display-5 fw-bold">{headerText}</h1>
				{
					subText && <p className="lead text-muted">{subText}</p>
				}
			</div>
		</header>
	);
};
export default Header;
