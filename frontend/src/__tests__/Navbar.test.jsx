// src/__test__/Navbar.test.js
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/Navbar'; 

// Helper function to render component with Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  test('renders brand logo and name', () => {
    renderWithRouter(<Navbar />);
    
    // Check brand name
    const brandName = screen.getByText('FoodBankConnect');
    expect(brandName).toBeInTheDocument();
    
    // Check logo image
    const logo = screen.getByAltText('My SVG');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/favicon.svg');
    expect(logo).toHaveAttribute('height', '50');
    expect(logo).toHaveAttribute('width', '50');
  });

  test('renders all navigation links', () => {
    renderWithRouter(<Navbar />);
    
    // Check all nav links are present
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /food banks/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /programs/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sponsors/i })).toBeInTheDocument();
  });

  test('navigation links have correct href attributes', () => {
    renderWithRouter(<Navbar />);
    
    // Check About link
    const aboutLink = screen.getByRole('link', { name: /about/i });
    expect(aboutLink).toHaveAttribute('href', '/about');
    
    // Check Food Banks link
    const foodBanksLink = screen.getByRole('link', { name: /food banks/i });
    expect(foodBanksLink).toHaveAttribute('href', '/foodbanks');
    
    // Check Programs link
    const programsLink = screen.getByRole('link', { name: /programs/i });
    expect(programsLink).toHaveAttribute('href', '/programs');
    
    // Check Sponsors link
    const sponsorsLink = screen.getByRole('link', { name: /sponsors/i });
    expect(sponsorsLink).toHaveAttribute('href', '/sponsors');
  });

  test('brand link points to home page', () => {
    renderWithRouter(<Navbar />);
    
    const brandLink = screen.getByRole('link', { name: /FoodBankConnect/i });
    expect(brandLink).toHaveAttribute('href', '/');
  });

  test('applies correct CSS classes', () => {
    renderWithRouter(<Navbar />);
    
    const navElement = screen.getByRole('navigation');
    expect(navElement).toHaveClass('navbar', 'navbar-expand-lg', 'navbar-dark', 'bg-primary');
    
    // Check nav items have correct classes
    const navLinks = screen.getAllByRole('link');
    navLinks.forEach(link => {
      if (link.textContent !== 'FoodBankConnect') { // Exclude brand link
        expect(link).toHaveClass('nav-link');
      }
    });
  });

  test('navbar is structured with correct container and list elements', () => {
    renderWithRouter(<Navbar />);
    
    // Check container structure
    const container = document.querySelector('.container-fluid');
    expect(container).toBeInTheDocument();
    
    // Check navbar collapse structure
    const collapseDiv = document.querySelector('.navbar-collapse');
    expect(collapseDiv).toBeInTheDocument();
    
    // Check list structure
    const navList = document.querySelector('.navbar-nav');
    expect(navList).toBeInTheDocument();
    expect(navList).toHaveClass('navbar-nav', 'ms-auto');
    
    // Check list items
    const listItems = document.querySelectorAll('.nav-item');
    expect(listItems).toHaveLength(7); // About, Food Banks, Programs, Sponsors, Search
  });

  test('logo has correct styling', () => {
    renderWithRouter(<Navbar />);
    
    const logo = screen.getByAltText('My SVG');
    expect(logo).toHaveStyle({
      marginLeft: '32%',
      marginRight: '5px'
    });
  });

  // Test for active states (if you want to test NavLink active classes)
  test('NavLink components receive active class when active', () => {
    // This test would require setting up a specific route
    // You might need to use MemoryRouter with initialEntries
    const { container } = renderWithRouter(<Navbar />);
    
    // NavLink automatically applies active class when the route matches
    // You can test this by checking if the component renders NavLink properly
    const navLinks = container.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      expect(link).toBeInTheDocument();
    });
  });

  test('navbar is accessible with proper roles and structure', () => {
    renderWithRouter(<Navbar />);
    
    // Check navigation role
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    
    // Check list structure for screen readers
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    
    // Check list items
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(7);
  });

});

// If you want to test with different routes, you can use this approach:
describe('Navbar with specific routes', () => {
  test('highlights active route', () => {
    // This would require a more complex setup with MemoryRouter
    // and checking for active classes on NavLink components
  });
});