import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { HoopCardButton } from '../../components/reusable/HoopCardButton';

describe('HoopCardButton', () => {
  const defaultProps = {
    actionFunction: vi.fn(),
    title: 'Test Button',
    colors: 'bg-blue-500',
  };

  it('renders button with title', () => {
    render(<HoopCardButton {...defaultProps} />);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('renders as a button element', () => {
    render(<HoopCardButton {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
  });

  it('calls actionFunction when clicked', async () => {
    const user = userEvent.setup();
    const actionFunction = vi.fn();

    render(<HoopCardButton {...defaultProps} actionFunction={actionFunction} />);

    const button = screen.getByRole('button', { name: 'Test Button' });
    await user.click(button);

    expect(actionFunction).toHaveBeenCalledTimes(1);
  });

  it('applies background color class', () => {
    render(<HoopCardButton {...defaultProps} colors="bg-red-500" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-500');
  });

  it('displays different titles correctly', () => {
    render(<HoopCardButton {...defaultProps} title="On Map" />);
    expect(screen.getByText('On Map')).toBeInTheDocument();
  });
});
