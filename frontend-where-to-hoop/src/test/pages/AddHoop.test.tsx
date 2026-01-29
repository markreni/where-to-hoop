import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import AddHoop from '../../pages/AddHoop';

// Mock MiniMap component (uses Leaflet)
vi.mock('../../components/MiniMap', () => ({
  MiniMap: ({ setFormData }: { setFormData: (fn: (prev: any) => any) => void }) => (
    <div data-testid="mini-map">
      <button
        type="button"
        onClick={() =>
          setFormData((prev: any) => ({
            ...prev,
            coordinates: { latitude: 60.1699, longitude: 24.9384 },
          }))
        }
      >
        Set Location
      </button>
    </div>
  ),
}));

// Mock useLocateUser hook
vi.mock('../../hooks/useLocateUser', () => ({
  default: () => vi.fn(),
}));

// Mock URL.createObjectURL
vi.stubGlobal('URL', {
  ...URL,
  createObjectURL: vi.fn(() => 'mock-url'),
  revokeObjectURL: vi.fn(),
});

describe('AddHoop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', () => {
    render(<AddHoop />);
    expect(screen.getByText('Add Basketball Hoop')).toBeInTheDocument();
  });

  it('renders all required form fields', () => {
    render(<AddHoop />);
    expect(screen.getByText(/Name \*/)).toBeInTheDocument();
    expect(screen.getByText(/Location \*/)).toBeInTheDocument();
    expect(screen.getByText(/Condition \*/)).toBeInTheDocument();
    expect(screen.getByText(/Court Type \*/)).toBeInTheDocument();
    expect(screen.getByText(/Images \*/)).toBeInTheDocument();
  });

  it('renders submit and reset buttons', () => {
    render(<AddHoop />);
    expect(screen.getByRole('button', { name: 'Add Hoop' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  it('submit button is disabled when form is incomplete', () => {
    render(<AddHoop />);
    const submitButton = screen.getByRole('button', { name: 'Add Hoop' });
    expect(submitButton).toBeDisabled();
  });

  it('shows progress indicator starting at 0/5', () => {
    render(<AddHoop />);
    expect(screen.getByText('0/5 required')).toBeInTheDocument();
  });

  it('updates name field and shows progress', async () => {
    const user = userEvent.setup();
    render(<AddHoop />);

    const nameInput = screen.getByPlaceholderText('e.g., Central Park Court');
    await user.type(nameInput, 'Test Court');

    expect(screen.getByDisplayValue('Test Court')).toBeInTheDocument();
    expect(screen.getByText('1/5 required')).toBeInTheDocument();
  });

  it('shows character count for name field', async () => {
    const user = userEvent.setup();
    render(<AddHoop />);

    const nameInput = screen.getByPlaceholderText('e.g., Central Park Court');
    await user.type(nameInput, 'Test');

    expect(screen.getByText('4/40')).toBeInTheDocument();
  });

  it('renders condition options', () => {
    render(<AddHoop />);
    expect(screen.getByRole('button', { name: /Excellent/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Good/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fair/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Poor/i })).toBeInTheDocument();
  });

  it('selects condition when clicked', async () => {
    const user = userEvent.setup();
    render(<AddHoop />);

    const excellentButton = screen.getByRole('button', { name: /Excellent/i });
    await user.click(excellentButton);

    // Should show check mark and update progress
    expect(screen.getByText('1/5 required')).toBeInTheDocument();
  });

  it('renders court type options', () => {
    render(<AddHoop />);
    expect(screen.getByRole('button', { name: /Outdoor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Indoor/i })).toBeInTheDocument();
  });

  it('selects outdoor court type when clicked', async () => {
    const user = userEvent.setup();
    render(<AddHoop />);

    const outdoorButton = screen.getByRole('button', { name: /Outdoor/i });
    await user.click(outdoorButton);

    expect(screen.getByText('1/5 required')).toBeInTheDocument();
  });

  it('selects indoor court type when clicked', async () => {
    const user = userEvent.setup();
    render(<AddHoop />);

    const indoorButton = screen.getByRole('button', { name: /Indoor/i });
    await user.click(indoorButton);

    expect(screen.getByText('1/5 required')).toBeInTheDocument();
  });

  it('renders Use Current Location button', () => {
    render(<AddHoop />);
    expect(screen.getByRole('button', { name: /Use Current Location/i })).toBeInTheDocument();
  });

  it('renders description field', () => {
    render(<AddHoop />);
    expect(screen.getByPlaceholderText('Add details about the court...')).toBeInTheDocument();
  });

  it('updates description field', async () => {
    const user = userEvent.setup();
    render(<AddHoop />);

    const descriptionInput = screen.getByPlaceholderText('Add details about the court...');
    await user.type(descriptionInput, 'Great court');

    expect(screen.getByDisplayValue('Great court')).toBeInTheDocument();
  });

  it('renders file input for images', () => {
    render(<AddHoop />);
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it('shows 0/5 image count initially', () => {
    render(<AddHoop />);
    expect(screen.getByText('0/5')).toBeInTheDocument();
  });

  it('resets form when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<AddHoop />);

    // Fill in name
    const nameInput = screen.getByPlaceholderText('e.g., Central Park Court');
    await user.type(nameInput, 'Test Court');
    expect(screen.getByDisplayValue('Test Court')).toBeInTheDocument();

    // Click reset
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    await user.click(resetButton);

    // Form should be cleared
    expect(screen.queryByDisplayValue('Test Court')).not.toBeInTheDocument();
    expect(screen.getByText('0/5 required')).toBeInTheDocument();
  });

  it('updates location via mock map', async () => {
    const user = userEvent.setup();
    render(<AddHoop />);

    // Click the mocked map button to set location
    const setLocationButton = screen.getByRole('button', { name: 'Set Location' });
    await user.click(setLocationButton);

    // Progress should update
    expect(screen.getByText('1/5 required')).toBeInTheDocument();
  });

  it('renders back arrow button', () => {
    render(<AddHoop />);
    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
  });

  it('fills complete form and enables submit', async () => {
    const user = userEvent.setup();
    render(<AddHoop />);

    // Fill name
    const nameInput = screen.getByPlaceholderText('e.g., Central Park Court');
    await user.type(nameInput, 'Test Court');

    // Set location via mock
    const setLocationButton = screen.getByRole('button', { name: 'Set Location' });
    await user.click(setLocationButton);

    // Select condition
    const excellentButton = screen.getByRole('button', { name: /Excellent/i });
    await user.click(excellentButton);

    // Select court type
    const outdoorButton = screen.getByRole('button', { name: /Outdoor/i });
    await user.click(outdoorButton);

    // Add image
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    await user.upload(fileInput, file);

    // All 5 fields should be filled
    await waitFor(() => {
      expect(screen.getByText('5/5 required')).toBeInTheDocument();
    });

    // Submit button should be enabled
    const submitButton = screen.getByRole('button', { name: 'Add Hoop' });
    expect(submitButton).not.toBeDisabled();
  });
});
