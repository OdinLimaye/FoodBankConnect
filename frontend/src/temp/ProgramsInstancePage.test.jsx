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
    image: 'https://example.com/image.jpg',
    eligibility: 'Everybody'
  };

  const mockFoodbanksData = {
    items: [
      { id: 'fb1', name: 'Test Food Bank' },
      { id: 'fb2', name: 'Other Food Bank' }
    ]
  };

  const mockSponsorsData = {
    items: [
      { id: 123, name: 'Test Sponsor' },
      { id: 122, name: 'Neighbor Sponsor' }
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
    
    global.fetch.mockImplementation((url) => {
      if (url.includes('/programs/123')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProgramData,
        });
      }
      if (url.includes('/foodbanks')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockFoodbanksData,
        });
      }
      if (url.includes('/sponsors')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSponsorsData,
        });
      }
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

  it('finds and sets foodbank correctly and navigates', async () => {
    mockLocationState.mockReturnValue({ id: '123' });
    
    global.fetch.mockImplementation((url) => {
      if (url.includes('/programs/123')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProgramData,
        });
      }
      if (url.includes('/foodbanks')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockFoodbanksData,
        });
      }
      if (url.includes('/sponsors')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSponsorsData,
        });
      }
    });

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Food Bank')).toBeInTheDocument();
    });

    // Click the foodbank link
    const hostLink = screen.getByText('Test Food Bank');
    fireEvent.click(hostLink);

    expect(mockedNavigate).toHaveBeenCalledWith('/foodbanks/Test%20Food%20Bank', {
      state: { id: 'fb1', name: 'Test Food Bank' }
    });
  });

  it('renders foodbank that does not match host name', async () => {
    const programWithDifferentHost = {
      ...mockProgramData,
      host: 'Non-existent Food Bank'
    };

    mockLocationState.mockReturnValue({ id: '123' });
    
    global.fetch.mockImplementation((url) => {
      if (url.includes('/programs/123')) {
        return Promise.resolve({
          ok: true,
          json: async () => programWithDifferentHost,
        });
      }
      if (url.includes('/foodbanks')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockFoodbanksData,
        });
      }
      if (url.includes('/sponsors')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSponsorsData,
        });
      }
    });

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Summer Food Program')).toBeInTheDocument();
    });

    // Since the host doesn't match any foodbank, component fills with first 2 foodbanks
    // The rendered foodbanks will be the first 2 from mockFoodbanksData
    expect(screen.getByText('Test Food Bank')).toBeInTheDocument();
    expect(screen.getByText('Other Food Bank')).toBeInTheDocument();
  });

  it('navigates to sponsor page when sponsor link is clicked', async () => {
    mockLocationState.mockReturnValue({ id: '123' });
    
    global.fetch.mockImplementation((url) => {
      if (url.includes('/programs/123')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProgramData,
        });
      }
      if (url.includes('/foodbanks')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockFoodbanksData,
        });
      }
      if (url.includes('/sponsors')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSponsorsData,
        });
      }
    });

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Sponsor')).toBeInTheDocument();
    });

    const sponsorLink = screen.getByText('Test Sponsor');
    fireEvent.click(sponsorLink);

    expect(mockedNavigate).toHaveBeenCalledWith('/sponsors/Test%20Sponsor', {
      state: { id: 123, name: 'Test Sponsor' }
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
      // eligibility is missing (will default to "Everybody")
    };

    mockLocationState.mockReturnValue({ id: '123' });
    
    global.fetch.mockImplementation((url) => {
      if (url.includes('/programs/123')) {
        return Promise.resolve({
          ok: true,
          json: async () => minimalProgramData,
        });
      }
      if (url.includes('/foodbanks')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      }
      if (url.includes('/sponsors')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      }
    });

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Minimal Program')).toBeInTheDocument();
    });

    // Check that N/A is shown for missing fields (frequency, cost, sign_up_link)
    expect(screen.getAllByText('N/A')).toHaveLength(3);
    expect(screen.getByText('No description available.')).toBeInTheDocument();
    expect(screen.getByText('No image available')).toBeInTheDocument();
    // Eligibility defaults to "Everybody"
    expect(screen.getByText(/Everybody/)).toBeInTheDocument();
  });

  it('fetches foodbanks and sponsors even when program has no host', async () => {
    const programWithoutHost = {
      ...mockProgramData,
      host: null
    };

    mockLocationState.mockReturnValue({ id: '123' });
    
    global.fetch.mockImplementation((url) => {
      if (url.includes('/programs/123')) {
        return Promise.resolve({
          ok: true,
          json: async () => programWithoutHost,
        });
      }
      if (url.includes('/foodbanks')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockFoodbanksData,
        });
      }
      if (url.includes('/sponsors')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSponsorsData,
        });
      }
    });

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Summer Food Program')).toBeInTheDocument();
    });

    // Should call fetch 3 times (program, foodbanks, sponsors)
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(global.fetch).toHaveBeenCalledWith('https://api.foodbankconnect.me/v1/programs/123');
    expect(global.fetch).toHaveBeenCalledWith('https://api.foodbankconnect.me/v1/foodbanks?size=100&start=1');
    expect(global.fetch).toHaveBeenCalledWith('https://api.foodbankconnect.me/v1/sponsors?size=100&start=1');
  });

  it('handles foodbanks fetch error gracefully', async () => {
    mockLocationState.mockReturnValue({ id: '123' });
    
    global.fetch.mockImplementation((url) => {
      if (url.includes('/programs/123')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProgramData,
        });
      }
      if (url.includes('/foodbanks')) {
        return Promise.reject(new Error('Foodbanks fetch failed'));
      }
      if (url.includes('/sponsors')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSponsorsData,
        });
      }
    });

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Summer Food Program')).toBeInTheDocument();
    });

    // Should still render the program even if foodbanks fetch fails
    expect(screen.getByText('Program Details')).toBeInTheDocument();
    
    // Foodbanks section should be empty (no links)
    const relatedFoodbanksSection = screen.getByText('Related Foodbanks').closest('section');
    const foodbankLinks = relatedFoodbanksSection.querySelectorAll('a');
    expect(foodbankLinks).toHaveLength(0);
  });

  it('renders child components', async () => {
    mockLocationState.mockReturnValue({ id: '123' });
    
    global.fetch.mockImplementation((url) => {
      if (url.includes('/programs/123')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProgramData,
        });
      }
      if (url.includes('/foodbanks')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockFoodbanksData,
        });
      }
      if (url.includes('/sponsors')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSponsorsData,
        });
      }
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
    
    global.fetch.mockImplementation((url) => {
      if (url.includes('/programs/123')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProgramData,
        });
      }
      if (url.includes('/foodbanks')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockFoodbanksData,
        });
      }
      if (url.includes('/sponsors')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSponsorsData,
        });
      }
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
    
    global.fetch.mockImplementation((url) => {
      if (url.includes('/programs/123')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockProgramData,
        });
      }
      if (url.includes('/foodbanks')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] }),
        });
      }
      if (url.includes('/sponsors')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSponsorsData,
        });
      }
    });

    render(
      <Router>
        <ProgramsInstancePage />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Summer Food Program')).toBeInTheDocument();
    });

    // With empty foodbanks array, no foodbank links should be rendered
    const relatedFoodbanksSection = screen.getByText('Related Foodbanks').closest('section');
    const foodbankLinks = relatedFoodbanksSection.querySelectorAll('a');
    expect(foodbankLinks).toHaveLength(0);
  });
});