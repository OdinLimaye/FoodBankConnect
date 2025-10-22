import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import FoodbankCard from "../components/FoodbankCard";

// Mock the useNavigate hook
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: () => mockedNavigate,
}));

describe("FoodbankCard", () => {
	const defaultProps = {
		id: "123",
		name: "Test Food Bank",
		city: "Test City",
		zipcode: "12345",
		urgency: "High",
	};

	beforeEach(() => {
		mockedNavigate.mockClear();
	});

	it("renders food bank information correctly", () => {
		render(
			<Router>
				<FoodbankCard {...defaultProps} />
			</Router>
		);

		expect(screen.getByText(/Name:/)).toBeInTheDocument();
		expect(screen.getByText("Test Food Bank")).toBeInTheDocument();
		expect(screen.getByText(/City:/)).toBeInTheDocument();
		expect(screen.getByText("Test City")).toBeInTheDocument();
		expect(screen.getByText(/ZIP Code:/)).toBeInTheDocument();
		expect(screen.getByText("12345")).toBeInTheDocument();
		expect(screen.getByText(/Urgency:/)).toBeInTheDocument();
		expect(screen.getByText("High")).toBeInTheDocument();
		expect(screen.getByText(/Eligibility:/)).toBeInTheDocument();
		expect(screen.getByText("Everybody")).toBeInTheDocument();
	});

	it("handles missing optional fields with default values", () => {
		const propsWithMissingFields = {
			id: "123",
			name: "Test Food Bank",
			// city is missing
			// zipcode is missing
			// urgency is missing
		};

		render(
			<Router>
				<FoodbankCard {...propsWithMissingFields} />
			</Router>
		);

		expect(screen.getByText("City:").closest("p")).toHaveTextContent(
			"City: N/A"
		);
		expect(screen.getByText("ZIP Code:").closest("p")).toHaveTextContent(
			"ZIP Code: N/A"
		);
		expect(screen.getByText("Urgency:").closest("p")).toHaveTextContent(
			"Urgency: N/A"
		);
	});

	it("navigates to food bank detail page when card is clicked", () => {
		render(
			<Router>
				<FoodbankCard {...defaultProps} />
			</Router>
		);

		const card = screen.getByText("Test Food Bank").closest(".card-glass");
		fireEvent.click(card);

		expect(mockedNavigate).toHaveBeenCalledWith(
			"/foodbanks/Test%20Food%20Bank",
			{
				state: {
					id: "123",
					name: "Test Food Bank",
					city: "Test City",
					zipcode: "12345",
					urgency: "High",
				},
			}
		);
	});

	it("navigates to food bank detail page when button is clicked", () => {
		render(
			<Router>
				<FoodbankCard {...defaultProps} />
			</Router>
		);

		const button = screen.getByRole("button", { name: /see details/i });
		fireEvent.click(button);

		expect(mockedNavigate).toHaveBeenCalledWith(
			"/foodbanks/Test%20Food%20Bank",
			{
				state: {
					id: "123",
					name: "Test Food Bank",
					city: "Test City",
					zipcode: "12345",
					urgency: "High",
				},
			}
		);
	});

	it("encodes food bank name in URL", () => {
		const propsWithSpecialChars = {
			...defaultProps,
			name: "Test & Food Bank",
		};

		render(
			<Router>
				<FoodbankCard {...propsWithSpecialChars} />
			</Router>
		);

		const card = screen.getByText("Test & Food Bank").closest(".card-glass");
		fireEvent.click(card);

		expect(mockedNavigate).toHaveBeenCalledWith(
			"/foodbanks/Test%20%26%20Food%20Bank",
			{
				state: {
					id: "123",
					name: "Test & Food Bank",
					city: "Test City",
					zipcode: "12345",
					urgency: "High",
				},
			}
		);
	});

	it("has pointer cursor style", () => {
		render(
			<Router>
				<FoodbankCard {...defaultProps} />
			</Router>
		);

		const card = screen.getByText("Test Food Bank").closest(".card-glass");
		expect(card).toHaveStyle("cursor: pointer");
	});

	it("has correct CSS classes applied", () => {
		render(
			<Router>
				<FoodbankCard {...defaultProps} />
			</Router>
		);

		const card = screen.getByText("Test Food Bank").closest(".card-glass");
		expect(card).toHaveClass("card-glass");
		expect(card).toHaveClass("h-100");
	});

	it("renders button with correct text", () => {
		render(
			<Router>
				<FoodbankCard {...defaultProps} />
			</Router>
		);

		const button = screen.getByRole("button", { name: /see details/i });
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass("cta-button");
	});

	it("passes all state data correctly during navigation", () => {
		const completeProps = {
			id: "456",
			name: "Complete Food Bank",
			city: "Another City",
			zipcode: "67890",
			urgency: "Medium",
		};

		render(
			<Router>
				<FoodbankCard {...completeProps} />
			</Router>
		);

		const card = screen.getByText("Complete Food Bank").closest(".card-glass");
		fireEvent.click(card);

		expect(mockedNavigate).toHaveBeenCalledWith(
			"/foodbanks/Complete%20Food%20Bank",
			{
				state: {
					id: "456",
					name: "Complete Food Bank",
					city: "Another City",
					zipcode: "67890",
					urgency: "Medium",
				},
			}
		);
	});
});
