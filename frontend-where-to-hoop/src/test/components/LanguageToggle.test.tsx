import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { LanguageToggle } from '../../components/reusable/LanguageToggle';

describe('LanguageToggle', () => {
  it('renders toggle button', () => {
    render(<LanguageToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays current language in uppercase', () => {
    render(<LanguageToggle />);
    // Default language should be displayed (EN or FI)
    const button = screen.getByRole('button');
    expect(button.textContent).toMatch(/^(EN|FI)$/);
  });

  it('toggles language when clicked', async () => {
    const user = userEvent.setup();
    render(<LanguageToggle />);

    const toggleButton = screen.getByRole('button');
    const initialLanguage = toggleButton.textContent;

    await user.click(toggleButton);

    const newLanguage = screen.getByRole('button').textContent;

    // Language should have changed
    expect(newLanguage).not.toBe(initialLanguage);
  });

  it('toggles between EN and FI', async () => {
    const user = userEvent.setup();
    render(<LanguageToggle />);

    const toggleButton = screen.getByRole('button');

    // Click once
    await user.click(toggleButton);
    const firstToggle = screen.getByRole('button').textContent;

    // Click again
    await user.click(toggleButton);
    const secondToggle = screen.getByRole('button').textContent;

    // Should toggle back
    expect(secondToggle).not.toBe(firstToggle);
    expect(['EN', 'FI']).toContain(firstToggle);
    expect(['EN', 'FI']).toContain(secondToggle);
  });
});
