import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import ProgramCard from "../components/ProgramsCard";

// Mock the useNavigate hook
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: () => mockedNavigate,
}));

describe("ProgramCard", () => {
	const defaultProps = {
		id: "123",
		name: "Summer Food Program",
		program_type: "Distribution",
		freq: "Weekly",
		host: "Test Food Bank",
	};

	beforeEach(() => {
		mockedNavigate.mockClear();
	});

	it("renders program information correctly", () => {
		cleanup();
		render(
			<Router>
				<ProgramCard {...defaultProps} />
			</Router>
		);

		expect(screen.getByText(/Name:/)).toBeInTheDocument();
		expect(screen.getByText("Summer Food Program")).toBeInTheDocument();
		expect(screen.getByText(/Host:/)).toBeInTheDocument();
		expect(screen.getByText("Test Food Bank")).toBeInTheDocument();
		expect(screen.getByText(/Frequency:/)).toBeInTheDocument();
		expect(screen.getByText("Weekly")).toBeInTheDocument();
		expect(screen.getByText(/Service Type:/)).toBeInTheDocument();
		expect(screen.getByText("Distribution")).toBeInTheDocument();
		expect(screen.getByText(/Eligibility:/)).toBeInTheDocument();
		expect(screen.getByText("Open")).toBeInTheDocument();
	});

	it("navigates to program detail page when button is clicked", () => {
		cleanup();

		render(
			<Router>
				<ProgramCard {...defaultProps} />
			</Router>
		);

		const button = screen.getByRole("button", { name: /see details/i });
		fireEvent.click(button);

		expect(mockedNavigate).toHaveBeenCalledWith(
			"/programs/Summer%20Food%20Program",
			{
				state: {
					id: "123",
					name: "Summer Food Program",
				},
			}
		);
	});

	it("encodes program name in URL", () => {
		cleanup();

		const propsWithSpecialChars = {
			...defaultProps,
			name: "Summer & Winter Program",
		};

		render(
			<Router>
				<ProgramCard {...propsWithSpecialChars} />
			</Router>
		);

		const button = screen.getByRole("button", { name: /see details/i });
		fireEvent.click(button);

		expect(mockedNavigate).toHaveBeenCalledWith(
			"/programs/Summer%20%26%20Winter%20Program",
			{
				state: {
					id: "123",
					name: "Summer & Winter Program",
				},
			}
		);
	});

	it("has correct CSS classes applied", () => {
		cleanup();

		render(
			<Router>
				<ProgramCard {...defaultProps} />
			</Router>
		);

		const card = screen.getByText("Summer Food Program").closest(".card-glass");
		expect(card).toHaveClass("card-glass");
		expect(card).toHaveClass("d-flex");
		expect(card).toHaveClass("flex-column");
		expect(card).toHaveClass("h-100");
		expect(card).toHaveClass("p-3");
	});

	it("button has correct positioning classes", () => {
		cleanup();

		render(
			<Router>
				<ProgramCard {...defaultProps} />
			</Router>
		);

		const button = screen.getByRole("button", { name: /see details/i });
		expect(button).toHaveClass("cta-button");
		expect(button).toHaveClass("mt-auto");
	});

	it("renders button with correct text", () => {
		cleanup();

		render(
			<Router>
				<ProgramCard {...defaultProps} />
			</Router>
		);

		const button = screen.getByRole("button", { name: /see details/i });
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent("See Details");
	});

	it("passes all required data during navigation", () => {
		cleanup();

		const completeProps = {
			id: "456",
			name: "Complete Program",
			program_type: "Emergency",
			freq: "Monthly",
			host: "Another Food Bank",
		};

		render(
			<Router>
				<ProgramCard {...completeProps} />
			</Router>
		);

		const button = screen.getByRole("button", { name: /see details/i });
		fireEvent.click(button);

		expect(mockedNavigate).toHaveBeenCalledWith(
			"/programs/Complete%20Program",
			{
				state: {
					id: "456",
					name: "Complete Program",
				},
			}
		);
	});

	it("does not navigate when card container is clicked (only button)", () => {
		cleanup();

		render(
			<Router>
				<ProgramCard {...defaultProps} />
			</Router>
		);

		// Click the card container (not the button)
		const card = screen.getByText("Summer Food Program").closest(".card-glass");
		fireEvent.click(card);

		// Should not navigate when card is clicked, only the button
		expect(mockedNavigate).not.toHaveBeenCalled();
	});

	const specialCases = [
		{ name: "Program (Special)", expected: "Program%20(Special)" },
		{ name: "Program @ Location", expected: "Program%20%40%20Location" },
		{ name: "Program #1", expected: "Program%20%231" },
		{ name: "Program/Service", expected: "Program%2FService" },
	];

	test.each(specialCases)(
		"handles program name '$name' with special characters",
		({ name, expected }) => {
			mockedNavigate.mockClear();

			const props = { ...defaultProps, name };

			render(
				<Router>
					<ProgramCard {...props} />
				</Router>
			);

			const button = screen.getByRole("button", { name: /See Details/i });
			fireEvent.click(button);

			expect(mockedNavigate).toHaveBeenCalledWith(`/programs/${expected}`, {
				state: {
					id: "123",
					name: name,
				},
			});
		}
	);

	it("maintains proper flex layout structure", () => {
		cleanup();

		const { container } = render(
			<Router>
				<ProgramCard {...defaultProps} />
			</Router>
		);

		const card = container.querySelector(".card-glass");
		expect(card).toHaveClass("d-flex");
		expect(card).toHaveClass("flex-column");
		expect(card).toHaveClass("h-100");

		// The button should be at the bottom due to mt-auto
		const button = screen.getByRole("button");
		expect(button).toHaveClass("mt-auto");
	});
});
