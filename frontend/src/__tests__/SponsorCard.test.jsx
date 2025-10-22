import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import SponsorCard from "../components/SponsorCard";

// Mock the useNavigate hook
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: () => mockedNavigate,
}));

describe("SponsorCard", () => {
	const defaultProps = {
		id: "123",
		name: "Test Sponsor",
		affiliation: "Test Affiliation",
		city: "Test City",
		state: "Test State",
	};

	beforeEach(() => {
		mockedNavigate.mockClear();
	});

	it("renders sponsor information correctly", () => {
		render(
			<Router>
				<SponsorCard {...defaultProps} />
			</Router>
		);

		expect(screen.getByText(/Name:/)).toBeInTheDocument();
		expect(screen.getByText(/Test Sponsor/)).toBeInTheDocument();
		expect(screen.getByText(/Affiliation:/)).toBeInTheDocument();
		expect(screen.getByText(/Test Affiliation/)).toBeInTheDocument();
		expect(screen.getByText(/City:/)).toBeInTheDocument();
		expect(screen.getByText(/Test City/)).toBeInTheDocument();
		expect(screen.getByText(/State:/)).toBeInTheDocument();
		expect(screen.getByText(/Test State/)).toBeInTheDocument();
		expect(screen.getByText(/Contribution:/)).toBeInTheDocument();
		expect(screen.getByText(/Donations \/ Grants/)).toBeInTheDocument();
	});

	it("navigates to sponsor detail page when clicked", () => {
		render(
			<Router>
				<SponsorCard {...defaultProps} />
			</Router>
		);

		const card = screen
			.getByRole("button", { name: /see details/i })
			.closest(".card-glass");
		fireEvent.click(card);

		expect(mockedNavigate).toHaveBeenCalledWith(
			`/sponsors/${defaultProps.id}`,
			{
				state: { id: defaultProps.id },
			}
		);
	});

	it("navigates to sponsor detail page when button is clicked", () => {
		render(
			<Router>
				<SponsorCard {...defaultProps} />
			</Router>
		);

		const button = screen.getByRole("button", { name: /see details/i });
		fireEvent.click(button);

		expect(mockedNavigate).toHaveBeenCalledWith(
			`/sponsors/${defaultProps.id}`,
			{
				state: { id: defaultProps.id },
			}
		);
	});

	it("has pointer cursor style", () => {
		render(
			<Router>
				<SponsorCard {...defaultProps} />
			</Router>
		);

		const card = screen
			.getByRole("button", { name: /see details/i })
			.closest(".card-glass");
		expect(card).toHaveStyle("cursor: pointer");
	});

	it("renders with correct CSS classes", () => {
		render(
			<Router>
				<SponsorCard {...defaultProps} />
			</Router>
		);

		const card = screen
			.getByRole("button", { name: /see details/i })
			.closest(".card-glass");
		expect(card).toHaveClass("card-glass");
	});
});
