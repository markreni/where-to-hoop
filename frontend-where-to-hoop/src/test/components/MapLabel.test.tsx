import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { MapLabel } from '../../components/reusable/MapLabel';
import type { Condition } from '../../types/types';

const mockConditionOptions = [
  { labelKey: 'common.excellent', name: 'excellent' as Condition, color: 'hoop-icon--excellent' },
  { labelKey: 'common.good', name: 'good' as Condition, color: 'hoop-icon--good' },
  { labelKey: 'common.fair', name: 'fair' as Condition, color: 'hoop-icon--fair' },
  { labelKey: 'common.poor', name: 'poor' as Condition, color: 'hoop-icon--poor' },
];

const mockDoorOptions = [
  { labelKey: 'common.indoor', name: 'indoor' as 'indoor' | 'outdoor', color: 'bg-blue-500' },
  { labelKey: 'common.outdoor', name: 'outdoor' as 'indoor' | 'outdoor', color: 'bg-green-500' },
];

describe('MapLabel', () => {
  const defaultProps = {
    groups: [
      {
        title: 'Court Condition',
        selectedItems: new Set(['excellent', 'good', 'fair', 'poor']),
        onToggleItems: vi.fn(),
        options: mockConditionOptions,
        clearFilter: vi.fn(),
      },
    ],
  };

  it('renders group title', () => {
    render(<MapLabel {...defaultProps} />);
    expect(screen.getByText('Court Condition')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<MapLabel {...defaultProps} />);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Fair')).toBeInTheDocument();
    expect(screen.getByText('Poor')).toBeInTheDocument();
  });

  it('calls onToggleItems when option is clicked', async () => {
    const user = userEvent.setup();
    const onToggleItems = vi.fn();
    const props = {
      groups: [{
        ...defaultProps.groups[0],
        onToggleItems,
      }],
    };

    render(<MapLabel {...props} />);

    const excellentButton = screen.getByRole('button', { name: 'Excellent' });
    await user.click(excellentButton);

    expect(onToggleItems).toHaveBeenCalledWith('excellent');
  });

  it('renders multiple groups', () => {
    const props = {
      groups: [
        {
          title: 'Door Type',
          selectedItems: new Set(['indoor', 'outdoor']),
          onToggleItems: vi.fn(),
          options: mockDoorOptions,
          clearFilter: vi.fn(),
        },
        {
          title: 'Court Condition',
          selectedItems: new Set(['excellent', 'good', 'fair', 'poor']),
          onToggleItems: vi.fn(),
          options: mockConditionOptions,
          clearFilter: vi.fn(),
        },
      ],
    };

    render(<MapLabel {...props} />);

    expect(screen.getByText('Door Type')).toBeInTheDocument();
    expect(screen.getByText('Court Condition')).toBeInTheDocument();
    expect(screen.getByText('Indoor')).toBeInTheDocument();
    expect(screen.getByText('Outdoor')).toBeInTheDocument();
  });

  it('shows clear filter button when not all items selected', () => {
    const props = {
      groups: [{
        ...defaultProps.groups[0],
        selectedItems: new Set(['excellent']), // Only one selected
      }],
    };

    render(<MapLabel {...props} />);
    expect(screen.getByRole('button', { name: 'Clear filter' })).toBeInTheDocument();
  });

  it('hides clear filter button when all items selected', () => {
    render(<MapLabel {...defaultProps} />);
    expect(screen.queryByRole('button', { name: 'Clear filter' })).not.toBeInTheDocument();
  });

  it('calls clearFilter when clear button is clicked', async () => {
    const user = userEvent.setup();
    const clearFilter = vi.fn();
    const props = {
      groups: [{
        ...defaultProps.groups[0],
        selectedItems: new Set(['excellent']),
        clearFilter,
      }],
    };

    render(<MapLabel {...props} />);

    const clearButton = screen.getByRole('button', { name: 'Clear filter' });
    await user.click(clearButton);

    expect(clearFilter).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(<MapLabel {...defaultProps} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
