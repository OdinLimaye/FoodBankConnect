import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ProgramsInstancePage from '../components/ProgramsInstancePage';

// Mock the useLocation and useNavigate hooks
const mockedNavigate = jest.fn();
const mockLocationState = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => ({
    state: mockLocationState()
  }),
}));

// Mock child components
jest.mock('../components/Navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('../components/Header', () => ({ headerText }) => <div data-testid="header">{headerText}</div>);
jest.mock('../components/Breadcrumb', () => ({ model_type, current_page }) => (
  <div data-testid="breadcrumb">{model_type} - {current_page}</div>
));
jest.mock('../components/Footer', () => () => <div data-testid="footer">Footer</div>);

// Mock window.alert
const mockedAlert = jest.fn();
global.alert = mockedAlert;

describe('ProgramsInstancePage', () => {
  const mockProgramData = {
    id: '123',
    name: 'Summer Food Program',
    frequency: 'Weekly',
    cost: 'Free',
    host: 'Test Food Bank',
    sign_up_link: 'https://example.com/signup',
    about: 'This is a test program description.',
    image: 'https://example.com/image.jpg'
  };

  const mockFoodbanksData = {
    items: [
      { id: 'fb1', name: 'Test Food Bank' },
      { id: 'fb2', name: 'Other Food Bank' }
    ]
  };

  beforeEach(() => {
    mockedNavigate.mockClear();
    mockedAlert.mockClear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    mockLocationState.mockReturnValue({ id: '123' });
    global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    expect(screen.getByText('Loading program details...')).toBeInTheDocument();
  });

  it('shows error state when no id is provided', async () => {
    mockLocationState.mockReturnValue(null);

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Program not found.')).toBeInTheDocument();
    });
  });

  it('shows error state when program fetch fails', async () => {
    mockLocationState.mockReturnValue({ id: '123' });
    global.fetch.mockRejectedValue(new Error('Fetch failed'));

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Program not found.')).toBeInTheDocument();
    });
  });

  it('renders program data when fetch is successful', async () => {
    mockLocationState.mockReturnValue({ id: '123' });
    
    // Mock program fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProgramData,
    });
    
    // Mock foodbanks fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFoodbanksData,
    });

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Summer Food Program')).toBeInTheDocument();
    });

    // Check all program data is rendered
    expect(screen.getByText('Program Details')).toBeInTheDocument();
    expect(screen.getByText(/Weekly/)).toBeInTheDocument();
    expect(screen.getByText(/Free/)).toBeInTheDocument();
    expect(screen.getByText(/Test Food Bank/)).toBeInTheDocument();
    expect(screen.getByText(/This is a test program description./)).toBeInTheDocument();
    expect(screen.getByText(/Everybody/)).toBeInTheDocument();
    
    // Check image
    const image = screen.getByAltText('Summer Food Program');
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(image).toHaveClass('img-fluid', 'rounded', 'shadow');
    
    // Check sign up link
    const signUpLink = screen.getByText('Sign Up Page');
    expect(signUpLink).toHaveAttribute('href', 'https://example.com/signup');
    expect(signUpLink).toHaveAttribute('target', '_blank');
  });

  it('finds and sets hostId when host exists', async () => {
    mockLocationState.mockReturnValue({ id: '123' });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProgramData,
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFoodbanksData,
    });

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Food Bank')).toBeInTheDocument();
    });

    // The hostId should be set to 'fb1' which matches 'Test Food Bank'
    const hostLink = screen.getByText('Test Food Bank');
    fireEvent.click(hostLink);

    expect(mockedNavigate).toHaveBeenCalledWith('/foodbanks/Test%20Food%20Bank', {
      state: { id: 'fb1', name: 'Test Food Bank' }
    });
  });

  it('shows alert when host link is clicked but hostId is not found', async () => {
    const programWithoutMatchingHost = {
      ...mockProgramData,
      host: 'Non-existent Food Bank'
    };

    mockLocationState.mockReturnValue({ id: '123' });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => programWithoutMatchingHost,
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFoodbanksData,
    });

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Non-existent Food Bank')).toBeInTheDocument();
    });

    const hostLink = screen.getByText('Non-existent Food Bank');
    fireEvent.click(hostLink);

    expect(mockedAlert).toHaveBeenCalledWith('Host foodbank not found yet. Please wait a moment.');
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('navigates to sponsor page when sponsor link is clicked', async () => {
    mockLocationState.mockReturnValue({ id: '123' });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProgramData,
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFoodbanksData,
    });

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('View Sponsor')).toBeInTheDocument();
    });

    const sponsorLink = screen.getByText('View Sponsor');
    fireEvent.click(sponsorLink);

    expect(mockedNavigate).toHaveBeenCalledWith('/sponsors/Summer%20Food%20Program', {
      state: { id: '123', name: 'Summer Food Program' }
    });
  });

  it('handles missing optional fields gracefully', async () => {
    const minimalProgramData = {
      id: '123',
      name: 'Minimal Program',
      // frequency is missing
      // cost is missing
      // host is missing
      // sign_up_link is missing
      // about is missing
      // image is missing
    };

    mockLocationState.mockReturnValue({ id: '123' });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => minimalProgramData,
    });

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Minimal Program')).toBeInTheDocument();
    });

    // Check that N/A is shown for missing fields
    expect(screen.getAllByText('N/A')).toHaveLength(4); // frequency, cost, host, sign_up_link
    expect(screen.getByText('No description available.')).toBeInTheDocument();
    expect(screen.getByText('No image available')).toBeInTheDocument();
  });

  it('does not fetch foodbanks when program has no host', async () => {
    const programWithoutHost = {
      ...mockProgramData,
      host: null
    };

    mockLocationState.mockReturnValue({ id: '123' });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => programWithoutHost,
    });

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Summer Food Program')).toBeInTheDocument();
    });

    // Should only call fetch once (for program), not for foodbanks
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('https://api.foodbankconnect.me/v1/programs/123');
  });

  it('handles foodbanks fetch error gracefully', async () => {
    mockLocationState.mockReturnValue({ id: '123' });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProgramData,
    });
    
    global.fetch.mockRejectedValueOnce(new Error('Foodbanks fetch failed'));

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Summer Food Program')).toBeInTheDocument();
    });

    // Should still render the program even if foodbanks fetch fails
    const hostLink = screen.getByText('Test Food Bank');
    fireEvent.click(hostLink);

    // Should show alert because hostId wasn't set due to fetch error
    expect(mockedAlert).toHaveBeenCalledWith('Host foodbank not found yet. Please wait a moment.');
  });

  it('renders child components', async () => {
    mockLocationState.mockReturnValue({ id: '123' });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProgramData,
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFoodbanksData,
    });

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  it('uses proper image styling', async () => {
    mockLocationState.mockReturnValue({ id: '123' });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProgramData,
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFoodbanksData,
    });

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      const image = screen.getByAltText('Summer Food Program');
      expect(image).toHaveStyle({
        maxHeight: '400px',
        objectFit: 'cover'
      });
    });
  });

  it('handles program with empty items array from foodbanks API', async () => {
    mockLocationState.mockReturnValue({ id: '123' });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProgramData,
    });
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [] }), // Empty array
    });

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Summer Food Program')).toBeInTheDocument();
    });

    const hostLink = screen.getByText('Test Food Bank');
    fireEvent.click(hostLink);

    expect(mockedAlert).toHaveBeenCalledWith('Host foodbank not found yet. Please wait a moment.');
  });
});