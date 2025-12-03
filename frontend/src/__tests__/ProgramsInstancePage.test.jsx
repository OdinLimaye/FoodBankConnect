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

describe('ProgramsInstancePage without fetch', () => {
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

  const mockFoodbanksData = [
    { id: 'fb1', name: 'Test Food Bank' },
    { id: 'fb2', name: 'Other Food Bank' }
  ];

  const mockSponsorsData = [
    { id: 123, name: 'Test Sponsor' },
    { id: 122, name: 'Neighbor Sponsor' }
  ];

  beforeEach(() => {
    mockedNavigate.mockClear();
    mockedAlert.mockClear();
  });

  it('renders program and related data correctly', async () => {
    mockLocationState.mockReturnValue({ id: '123' });

    render(
      <Router>
        <ProgramsInstancePage
          programData={mockProgramData}
          foodbanks={mockFoodbanksData}
          sponsors={mockSponsorsData}
        />
      </Router>
    );

    // Wait for component to "render"
    await waitFor(() => {
      expect(screen.getByText('Summer Food Program')).toBeInTheDocument();
    });

    // Program details
    expect(screen.getByText('Program Details')).toBeInTheDocument();
    expect(screen.getByText(/Weekly/)).toBeInTheDocument();
    expect(screen.getByText(/Free/)).toBeInTheDocument();
    expect(screen.getByText(/Test Food Bank/)).toBeInTheDocument();
    expect(screen.getByText(/This is a test program description./)).toBeInTheDocument();
    expect(screen.getByText(/Everybody/)).toBeInTheDocument();

    // Image
    const image = screen.getByAltText('Summer Food Program');
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');

    // Sign up link
    const signUpLink = screen.getByText('Sign Up Page');
    expect(signUpLink).toHaveAttribute('href', 'https://example.com/signup');

    // Foodbank navigation
    const hostLink = screen.getByText('Test Food Bank');
    fireEvent.click(hostLink);
    expect(mockedNavigate).toHaveBeenCalledWith('/foodbanks/Test%20Food%20Bank', {
      state: { id: 'fb1', name: 'Test Food Bank' }
    });

    // Sponsor navigation
    const sponsorLink = screen.getByText('Test Sponsor');
    fireEvent.click(sponsorLink);
    expect(mockedNavigate).toHaveBeenCalledWith('/sponsors/Test%20Sponsor', {
      state: { id: 123, name: 'Test Sponsor' }
    });

    // Child components
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders gracefully when optional fields are missing', async () => {
    const minimalProgramData = {
      id: '123',
      name: 'Minimal Program'
      // all other fields missing
    };

    mockLocationState.mockReturnValue({ id: '123' });

    render(
      <Router>
        <ProgramsInstancePage
          programData={minimalProgramData}
          foodbanks={[]}
          sponsors={[]}
        />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Minimal Program')).toBeInTheDocument();
    });

    // Check that missing fields render N/A or defaults
    expect(screen.getAllByText('N/A')).toHaveLength(3);
    expect(screen.getByText('No description available.')).toBeInTheDocument();
    expect(screen.getByText('No image available')).toBeInTheDocument();
    expect(screen.getByText(/Everybody/)).toBeInTheDocument();
  });
});
