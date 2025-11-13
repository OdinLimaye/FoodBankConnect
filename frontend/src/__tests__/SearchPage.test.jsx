import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SearchPage from "../pages/SearchPage.jsx";

// Mock the child components
jest.mock("../components/Navbar", () => () => <div data-testid="navbar">Navbar</div>);
jest.mock("../components/Header", () => ({ headerText }) => (
  <div data-testid="header">{headerText}</div>
));
jest.mock("../components/Footer", () => () => <div data-testid="footer">Footer</div>);

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useSearchParams: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("SearchPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useSearchParams } = require("react-router-dom");
    useSearchParams.mockReturnValue([new URLSearchParams()]);
  });

  test("renders all components correctly", () => {
    renderWithRouter(<SearchPage />);
    
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toHaveTextContent("Search");
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search for food banks/i)).toBeInTheDocument();
  });

  test("displays search input and button", () => {
    renderWithRouter(<SearchPage />);
    
    const input = screen.getByPlaceholderText(/search for food banks/i);
    const button = screen.getByRole("button", { name: /search/i });
    
    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  test("updates input value when typing", () => {
    renderWithRouter(<SearchPage />);
    
    const input = screen.getByPlaceholderText(/search for food banks/i);
    fireEvent.change(input, { target: { value: "test query" } });
    
    expect(input.value).toBe("test query");
  });

  test("navigates with query on form submit", () => {
    renderWithRouter(<SearchPage />);
    
    const input = screen.getByPlaceholderText(/search for food banks/i);
    const form = input.closest("form");
    
    fireEvent.change(input, { target: { value: "food bank" } });
    fireEvent.submit(form);
    
    expect(mockNavigate).toHaveBeenCalledWith("/search?q=food%20bank");
  });

  test("does not navigate when query is empty", () => {
    renderWithRouter(<SearchPage />);
    
    const input = screen.getByPlaceholderText(/search for food banks/i);
    const form = input.closest("form");
    
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.submit(form);
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("performs search when URL has query parameter", async () => {
    const mockResults = {
      items: [
        {
          id: 1,
          name: "Test Food Bank",
          model: "foodbank",
          snippet: "A test food bank description",
        },
      ],
    };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    const { useSearchParams } = require("react-router-dom");
    useSearchParams.mockReturnValue([new URLSearchParams("q=test")]);

    renderWithRouter(<SearchPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.foodbankconnect.me/v1/search?q=test"
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Found 1 results")).toBeInTheDocument();
      expect(screen.getByText("Test Food Bank")).toBeInTheDocument();
    });
  });

  test("displays error message on fetch failure", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    const { useSearchParams } = require("react-router-dom");
    useSearchParams.mockReturnValue([new URLSearchParams("q=test")]);

    renderWithRouter(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to search/i)).toBeInTheDocument();
    });
  });

  test("displays 'No results found' when search returns empty", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [] }),
    });

    const { useSearchParams } = require("react-router-dom");
    useSearchParams.mockReturnValue([new URLSearchParams("q=test")]);

    renderWithRouter(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });

  test("displays loading state while searching", async () => {
    global.fetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { useSearchParams } = require("react-router-dom");
    useSearchParams.mockReturnValue([new URLSearchParams("q=test")]);

    renderWithRouter(<SearchPage />);

    const loadingText = screen.getAllByText("Searching...")[1]; 
    expect(loadingText).toBeInTheDocument();
    
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  test("renders result cards with correct model tags", async () => {
    const mockResults = {
      items: [
        {
          id: 1,
          name: "Food Bank 1",
          model: "foodbank",
          snippet: "Description 1",
        },
        {
          id: 2,
          name: "Sponsor 1",
          model: "sponsor",
          snippet: "Description 2",
        },
      ],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    const { useSearchParams } = require("react-router-dom");
    useSearchParams.mockReturnValue([new URLSearchParams("q=test")]);

    renderWithRouter(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText("Foodbank")).toBeInTheDocument();
      expect(screen.getByText("Sponsor")).toBeInTheDocument();
    });
  });
});