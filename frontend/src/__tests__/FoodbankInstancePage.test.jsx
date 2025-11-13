import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import FoodbankInstancePage from "../components/FoodbankInstancePage";

// Mock the useLocation and useNavigate hooks
const mockedNavigate = jest.fn();
const mockLocationState = jest.fn();

jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: () => mockedNavigate,
	useLocation: () => ({
		state: mockLocationState(),
	}),
}));

// Mock child components
jest.mock("../components/Navbar", () => () => (
	<div data-testid="navbar">Navbar</div>
));
jest.mock("../components/Header", () => ({ headerText }) => (
	<div data-testid="header">{headerText}</div>
));
jest.mock("../components/Breadcrumb", () => ({ model_type, current_page }) => (
	<div data-testid="breadcrumb">
		{model_type} - {current_page}
	</div>
));
jest.mock("../components/Footer", () => () => (
	<div data-testid="footer">Footer</div>
));

describe("FoodbankInstancePage", () => {
	const mockFoodbankData = {
		id: "123",
		name: "Test Food Bank",
		about: "This is a test food bank description.",
		website: "https://example.com",
		city: "Test City",
		state: "Test State",
		zipcode: "12345",
		languages: ["English", "Spanish"],
		services: ["Food Distribution", "Emergency Meals"],
	};

	const mockProgramsData = {
		items: [
			{ id: "p1", name: "Summer Program", host: "Test Food Bank" },
			{ id: "p2", name: "Winter Program", host: "Test Food Bank" },
			{ id: "p3", name: "Other Program", host: "Different Food Bank" },
		],
	};

	beforeEach(() => {
		mockedNavigate.mockClear();
		global.fetch = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("shows loading state initially", () => {
		mockLocationState.mockReturnValue({ id: "123" });
		global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

		render(
			<Router>
				<FoodbankInstancePage />
			</Router>
		);

		expect(
			screen.getByText("Loading Food Bank Details...")
		).toBeInTheDocument();
	});

	it("shows error state when no id is provided", async () => {
		mockLocationState.mockReturnValue(null);

		render(
			<Router>
				<FoodbankInstancePage />
			</Router>
		);

		await waitFor(() => {
			expect(
				screen.getByText("Food bank not found or ID missing.")
			).toBeInTheDocument();
		});
	});

	it("shows error state when fetch fails", async () => {
		mockLocationState.mockReturnValue({ id: "123" });
		global.fetch.mockRejectedValue(new Error("Fetch failed"));

		render(
			<Router>
				<FoodbankInstancePage />
			</Router>
		);

		await waitFor(() => {
			expect(
				screen.getByText("Food bank not found or ID missing.")
			).toBeInTheDocument();
		});
	});

	// it("renders foodbank data when fetch is successful", async () => {
	// 	mockLocationState.mockReturnValue({ id: "123" });
	// 	global.fetch.mockResolvedValueOnce({
	// 		ok: true,
	// 		json: async () => mockFoodbankData,
	// 	});

	// 	render(
	// 		<Router>
	// 			<FoodbankInstancePage />
	// 		</Router>
	// 	);

	// 	await waitFor(() => {
	// 		expect(
	// 			screen.getByText("Food Bank - Test Food Bank")
	// 		).toBeInTheDocument();
	// 	});

	// 	// Check all foodbank data is rendered
	// 	expect(screen.getByText(/Details/)).toBeInTheDocument();
	// 	expect(screen.getByText(/Test Food Bank/)).toBeInTheDocument();
	// 	expect(
	// 		screen.getByText(/This is a test food bank description./)
	// 	).toBeInTheDocument();
	// 	expect(screen.getByText(/Test City/)).toBeInTheDocument();
	// 	expect(screen.getByText(/Test State/)).toBeInTheDocument();
	// 	expect(screen.getByText(/12345/)).toBeInTheDocument();
	// 	expect(screen.getByText(/English, Spanish/)).toBeInTheDocument();
	// 	expect(
	// 		screen.getByText(/Food Distribution, Emergency Meals/)
	// 	).toBeInTheDocument();

	// 	// Check website link
	// 	const websiteLink = screen.getByText("Official Website");
	// 	expect(websiteLink).toHaveAttribute("href", "https://example.com");
	// 	expect(websiteLink).toHaveAttribute("target", "_blank");
	// });

	// it("fetches and renders programs when foodbank data is available", async () => {
	// 	mockLocationState.mockReturnValue({ id: "123" });

	// 	// Mock foodbank fetch
	// 	global.fetch.mockResolvedValueOnce({
	// 		ok: true,
	// 		json: async () => mockFoodbankData,
	// 	});

	// 	// Mock programs fetch
	// 	global.fetch.mockResolvedValueOnce({
	// 		ok: true,
	// 		json: async () => mockProgramsData,
	// 	});

	// 	render(
	// 		<Router>
	// 			<FoodbankInstancePage />
	// 		</Router>
	// 	);

	// 	await waitFor(() => {
	// 		expect(
	// 			screen.getByText("Programs Hosted by This Food Bank")
	// 		).toBeInTheDocument();
	// 	});

	// 	// Check that only programs with matching host are shown
	// 	expect(screen.getByText("Summer Program")).toBeInTheDocument();
	// 	expect(screen.getByText("Winter Program")).toBeInTheDocument();
	// 	expect(screen.queryByText("Other Program")).not.toBeInTheDocument();
	// });

	it("shows loading state for programs", async () => {
		mockLocationState.mockReturnValue({ id: "123" });

		global.fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockFoodbankData,
		});

		// Mock programs fetch to never resolve
		global.fetch.mockImplementationOnce(() => new Promise(() => {}));

		render(
			<Router>
				<FoodbankInstancePage />
			</Router>
		);

		await waitFor(() => {
			expect(screen.getByText("Loading programs...")).toBeInTheDocument();
		});
	});

	it("shows message when no programs are found", async () => {
		mockLocationState.mockReturnValue({ id: "123" });

		global.fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockFoodbankData,
		});

		global.fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ items: [] }),
		});

		render(
			<Router>
				<FoodbankInstancePage />
			</Router>
		);

		await waitFor(() => {
			expect(
				screen.getByText("No hosted programs found for this food bank.")
			).toBeInTheDocument();
		});
	});

	it("navigates to program page when program is clicked", async () => {
		mockLocationState.mockReturnValue({ id: "123" });

		global.fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockFoodbankData,
		});

		global.fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockProgramsData,
		});

		render(
			<Router>
				<FoodbankInstancePage />
			</Router>
		);

		await waitFor(() => {
			expect(screen.getByText("Summer Program")).toBeInTheDocument();
		});

		const programLink = screen.getByText("Summer Program");
		fireEvent.click(programLink);

		expect(mockedNavigate).toHaveBeenCalledWith("/programs/Summer%20Program", {
			state: { id: "p1", name: "Summer Program" },
		});
	});

	it("navigates to sponsor page when sponsor link is clicked", async () => {
		mockLocationState.mockReturnValue({ id: "123" });

		global.fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockFoodbankData,
		});

		render(
			<Router>
				<FoodbankInstancePage />
			</Router>
		);

		await waitFor(() => {
			expect(screen.getByText("View Sponsor")).toBeInTheDocument();
		});

		const sponsorLink = screen.getByText("View Sponsor");
		fireEvent.click(sponsorLink);

		expect(mockedNavigate).toHaveBeenCalledWith(
			"/sponsors/Test%20Food%20Bank",
			{
				state: { id: "123", name: "Test Food Bank" },
			}
		);
	});

	it("handles missing optional fields gracefully", async () => {
		const minimalFoodbankData = {
			id: "123",
			name: "Minimal Food Bank",
			// about is missing
			// website is missing
			city: "Test City",
			// state is missing
			// zipcode is missing
			// languages is missing
			// services is missing
		};

		mockLocationState.mockReturnValue({ id: "123" });
		global.fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => minimalFoodbankData,
		});

		render(
			<Router>
				<FoodbankInstancePage />
			</Router>
		);

		await waitFor(() => {
			expect(screen.getByText("Minimal Food Bank")).toBeInTheDocument();
		});

		// Check that N/A is shown for missing fields
		expect(screen.getAllByText("N/A")).toHaveLength(5); // about, website, state, zipcode, languages, services
	});

	it("uses name from location state if foodbank name is not available", async () => {
		const foodbankWithoutName = {
			id: "123",
			// name is missing
			city: "Test City",
		};

		mockLocationState.mockReturnValue({ id: "123", name: "Location Name" });
		global.fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => foodbankWithoutName,
		});

		render(
			<Router>
				<FoodbankInstancePage />
			</Router>
		);

		await waitFor(() => {
			expect(screen.getByText("Food Bank - Location Name")).toBeInTheDocument();
		});
	});

	it("renders child components", async () => {
		mockLocationState.mockReturnValue({ id: "123" });
		global.fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockFoodbankData,
		});

		render(
			<Router>
				<FoodbankInstancePage />
			</Router>
		);

		await waitFor(() => {
			expect(screen.getByTestId("navbar")).toBeInTheDocument();
			expect(screen.getByTestId("header")).toBeInTheDocument();
			expect(screen.getByTestId("breadcrumb")).toBeInTheDocument();
			expect(screen.getByTestId("footer")).toBeInTheDocument();
		});
	});

	it("handles programs fetch error gracefully", async () => {
		mockLocationState.mockReturnValue({ id: "123" });

		global.fetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockFoodbankData,
		});

		global.fetch.mockRejectedValueOnce(new Error("Programs fetch failed"));

		render(
			<Router>
				<FoodbankInstancePage />
			</Router>
		);

		await waitFor(() => {
			// Should not crash, should show no programs message
			expect(
				screen.getByText("No hosted programs found for this food bank.")
			).toBeInTheDocument();
		});
	});
});
