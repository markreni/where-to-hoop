import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { SearchField } from '../../components/reusable/SearchField';

describe('SearchField', () => {
  it('renders with placeholder text', () => {
    render(
      <SearchField
        placeholder="Search hoops..."
        value=""
        onChange={() => {}}
      />
    );
    expect(screen.getByPlaceholderText('Search hoops...')).toBeInTheDocument();
  });

  it('renders with label when provided', () => {
    render(
      <SearchField
        label="Search"
        placeholder="Search..."
        value=""
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    render(
      <SearchField
        placeholder="Search..."
        value=""
        onChange={() => {}}
      />
    );
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(
      <SearchField
        placeholder="Search..."
        value="basketball"
        onChange={() => {}}
      />
    );
    expect(screen.getByDisplayValue('basketball')).toBeInTheDocument();
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <SearchField
        placeholder="Search..."
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'test');

    expect(handleChange).toHaveBeenCalledTimes(4); // One call per character
    expect(handleChange).toHaveBeenLastCalledWith('t');
  });

  it('renders search icon', () => {
    const { container } = render(
      <SearchField
        placeholder="Search..."
        value=""
        onChange={() => {}}
      />
    );

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('has accessible search label', () => {
    render(
      <SearchField
        placeholder="Search..."
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-label', 'search');
  });
});
