import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import SponsorInstancePage from "../components/SponsorInstancePage";

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

describe("SponsorInstancePage", () => {
	const mockSponsorData = {
		id: "123",
		name: "Test Sponsor",
		about: "This is a test sponsor description.",
		affiliation: "Test Affiliation",
		contribution: "Financial Support",
		city: "Test City",
		state: "Test State",
		past_involvement: "Previous sponsor events",
		sponsor_link: "https://example.com",
		alt: "Sponsor Logo Alt Text",
		ein: "12-3456789",
		created_at: "2023-01-01",
		fetched_at: "2023-01-02",
		image: "https://example.com/logo.png",
		map_link: "https://maps.example.com",
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
				<SponsorInstancePage />
			</Router>
		);

		expect(screen.getByText("Loading sponsor details...")).toBeInTheDocument();
	});

	it("shows error state when no id is provided", async () => {
		mockLocationState.mockReturnValue(null);

		render(
			<Router>
				<SponsorInstancePage />
			</Router>
		);

		await waitFor(() => {
			expect(screen.getByText("Sponsor not found.")).toBeInTheDocument();
		});
	});

	it("shows error state when fetch fails", async () => {
		mockLocationState.mockReturnValue({ id: "123" });
		global.fetch.mockRejectedValue(new Error("Fetch failed"));

		render(
			<Router>
				<SponsorInstancePage />
			</Router>
		);

		await waitFor(() => {
			expect(screen.getByText("Sponsor not found.")).toBeInTheDocument();
		});
	});

	it("renders sponsor data when fetch is successful", async () => {
		mockLocationState.mockReturnValue({ id: "123" });
		global.fetch.mockResolvedValue({
			ok: true,
			json: async () => mockSponsorData,
		});

		render(
			<Router>
				<SponsorInstancePage />
			</Router>
		);

		await waitFor(() => {
			expect(
				screen.getByText("Sponsors & Donors - Test Sponsor")
			).toBeInTheDocument();
		});

		// Check all sponsor data is rendered
		expect(screen.getByText(/About/)).toBeInTheDocument();
		expect(
			screen.getByText("This is a test sponsor description.")
		).toBeInTheDocument();
		expect(screen.getByText(/Details/)).toBeInTheDocument();
		expect(screen.getByText(/Test Affiliation/)).toBeInTheDocument();
		expect(screen.getByText(/Financial Support/)).toBeInTheDocument();

		expect(screen.getByText(/Test City/)).toBeInTheDocument();
		expect(screen.getByText(/Test State/)).toBeInTheDocument();
		expect(screen.getByText(/12-3456789/)).toBeInTheDocument();

		// Check image
		const image = screen.getByAltText("Sponsor Logo Alt Text");
		expect(image).toHaveAttribute("src", "https://example.com/logo.png");

		// Check website link - the component shows "Official Website" not the URL
		const websiteLink = screen.getByText("Official Website");
		expect(websiteLink).toHaveAttribute("href", "https://example.com");
		expect(websiteLink).toHaveAttribute("target", "_blank");
	});

	it("handles navigation to foodbank page", async () => {
		mockLocationState.mockReturnValue({ id: "123" });
		
		// Mock the sponsor fetch
		global.fetch.mockImplementation((url) => {
			if (url.includes('/sponsors/123')) {
			return Promise.resolve({
				ok: true,
				json: async () => mockSponsorData,
			});
			}
			// Mock foodbanks fetch
			if (url.includes('/foodbanks')) {
			return Promise.resolve({
				ok: true,
				json: async () => ({
				items: [
					{ id: 123, name: "Test Foodbank" },
					{ id: 124, name: "Another Foodbank" }
				]
				}),
			});
			}
			// Mock programs fetch
			if (url.includes('/programs')) {
			return Promise.resolve({
				ok: true,
				json: async () => ({
				items: [
					{ id: 123, name: "Test Program" }
				]
				}),
			});
		}
	});

	render(
		<Router>
		<SponsorInstancePage />
		</Router>
	);

	// Wait for the foodbank name to appear (not "View Related Foodbank")
	await waitFor(() => {
		expect(screen.getByText("Test Foodbank")).toBeInTheDocument();
	});

	const foodbankLink = screen.getByText("Test Foodbank");
	fireEvent.click(foodbankLink);

	expect(mockedNavigate).toHaveBeenCalledWith(
		"/foodbanks/Test%20Foodbank",  // Note: name is encoded in URL
		{
		state: { id: 123, name: "Test Foodbank" },  // id is number, name is the foodbank name
		}
	);
	});

	it("handles navigation to program page", async () => {
		mockLocationState.mockReturnValue({ id: "123" });
		
		global.fetch.mockImplementation((url) => {
			if (url.includes('/sponsors/123')) {
			return Promise.resolve({
				ok: true,
				json: async () => mockSponsorData,
			});
			}
			if (url.includes('/foodbanks')) {
			return Promise.resolve({
				ok: true,
				json: async () => ({ items: [] }),
			});
			}
			if (url.includes('/programs')) {
			return Promise.resolve({
				ok: true,
				json: async () => ({
				items: [
					{ id: 123, name: "Test Program" }
				]
				}),
			});
			}
		});

		render(
			<Router>
			<SponsorInstancePage />
			</Router>
		);

		await waitFor(() => {
			expect(screen.getByText("Test Program")).toBeInTheDocument();
		});

		const programLink = screen.getByText("Test Program");
		fireEvent.click(programLink);

		expect(mockedNavigate).toHaveBeenCalledWith(
			"/programs/Test%20Program",
			{
			state: { id: 123, name: "Test Program" },
			}
		);
	});

	it("renders map iframe when map_link is provided", async () => {
		mockLocationState.mockReturnValue({ id: "123" });
		global.fetch.mockResolvedValue({
			ok: true,
			json: async () => mockSponsorData,
		});

		render(
			<Router>
				<SponsorInstancePage />
			</Router>
		);

		await waitFor(() => {
			// Query iframe by src attribute instead of title
			const iframe = document.querySelector(
				'iframe[src="https://maps.example.com"]'
			);
			expect(iframe).toBeInTheDocument();
			expect(iframe).toHaveAttribute("src", "https://maps.example.com");
			expect(iframe).toHaveAttribute("loading", "lazy");
			expect(iframe).toHaveAttribute(
				"referrerPolicy",
				"no-referrer-when-downgrade"
			);
		});
	});

	it("does not render map iframe when map_link is not provided", async () => {
		const sponsorWithoutMap = { ...mockSponsorData, map_link: null };
		mockLocationState.mockReturnValue({ id: "123" });
		global.fetch.mockResolvedValue({
			ok: true,
			json: async () => sponsorWithoutMap,
		});

		render(
			<Router>
				<SponsorInstancePage />
			</Router>
		);

		await waitFor(() => {
			// Check that no iframe exists
			const iframes = document.querySelectorAll("iframe");
			expect(iframes).toHaveLength(0);
		});
	});

	it("renders child components", async () => {
		mockLocationState.mockReturnValue({ id: "123" });
		global.fetch.mockResolvedValue({
			ok: true,
			json: async () => mockSponsorData,
		});

		render(
			<Router>
				<SponsorInstancePage />
			</Router>
		);

		await waitFor(() => {
			expect(screen.getByTestId("navbar")).toBeInTheDocument();
			expect(screen.getByTestId("header")).toBeInTheDocument();
			expect(screen.getByTestId("breadcrumb")).toBeInTheDocument();
			expect(screen.getByTestId("footer")).toBeInTheDocument();
		});
	});

	it("handles missing optional fields gracefully", async () => {
		const minimalSponsorData = {
			id: "123",
			name: "Minimal Sponsor",
			about: "Minimal description",
			affiliation: "Test Affiliation",
			contribution: "Financial Support",
			contribution_amt: "$10,000",
			city: "Test City",
			state: "Test State",
			sponsor_link: "https://example.com",
			ein: "12-3456789",
			created_at: "2023-01-01",
			fetched_at: "2023-01-02",
			type: "Corporate",
		};

		mockLocationState.mockReturnValue({ id: "123" });
		global.fetch.mockResolvedValue({
			ok: true,
			json: async () => minimalSponsorData,
		});

		render(
			<Router>
				<SponsorInstancePage />
			</Router>
		);

		await waitFor(() => {
			// Check that the sponsor name appears in the header and breadcrumb
			expect(screen.getByTestId("header")).toHaveTextContent("Minimal Sponsor");
			expect(screen.getByTestId("breadcrumb")).toHaveTextContent(
				"Minimal Sponsor"
			);

			// Check that the component handles missing fields without crashing
			expect(screen.getByText("Minimal description")).toBeInTheDocument();
			expect(screen.getByText("No image found")).toBeInTheDocument();

		});
	});
});
