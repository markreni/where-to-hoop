import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import Footer from '../../components/Footer';

describe('Footer', () => {
  it('renders footer element', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders About link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
  });

  it('renders Privacy link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Privacy' })).toBeInTheDocument();
  });

  it('renders Contact link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
  });

  it('renders GitHub link with aria-label', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
  });

  it('GitHub link opens in new tab', () => {
    render(<Footer />);
    const githubLink = screen.getByRole('link', { name: 'GitHub' });
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/WhereHoops\. All rights reserved\./)).toBeInTheDocument();
  });

  it('renders copyright year', () => {
    render(<Footer />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('About link points to /about', () => {
    render(<Footer />);
    const aboutLink = screen.getByRole('link', { name: 'About' });
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  it('Privacy link points to /privacy', () => {
    render(<Footer />);
    const privacyLink = screen.getByRole('link', { name: 'Privacy' });
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  it('Contact link points to /contact', () => {
    render(<Footer />);
    const contactLink = screen.getByRole('link', { name: 'Contact' });
    expect(contactLink).toHaveAttribute('href', '/contact');
  });
});
