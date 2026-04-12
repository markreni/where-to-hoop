import type { ReactNode } from "react";
import type { Condition } from "../../types/types.ts";
import { conditionColorSelector } from "../../utils/options.tsx";
import { IoSunnyOutline, IoHomeOutline, IoPeopleOutline, IoCheckmarkCircle } from "react-icons/io5";
import { MdOutlineDateRange, MdMoneyOff, MdAttachMoney } from "react-icons/md";

type BadgeVariant = 'indoor' | 'outdoor' | 'condition' | 'date' | 'players' | 'free' | 'paid' | 'verified';

interface HoopBadgeProps {
  variant: BadgeVariant;
  condition?: Condition;
  text: string;
  showIcon?: boolean;
  iconSize?: number;
  textClassName?: string;
  icon?: ReactNode;
  tooltip?: string;
  capitalize?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  indoor: 'bg-blue-100 text-blue-700',
  outdoor: 'bg-amber-100 text-amber-700',
  condition: '',
  date: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  players: 'bg-purple-100 text-purple-700',
  free: 'bg-green-100 text-green-700',
  paid: 'bg-red-100 text-red-700',
  verified: 'bg-green-100 text-green-700',
};

const defaultIcons: Record<Exclude<BadgeVariant, 'condition'>, (size: number) => ReactNode> = {
  indoor: (size) => <IoHomeOutline size={size} />,
  outdoor: (size) => <IoSunnyOutline size={size} />,
  date: (size) => <MdOutlineDateRange size={size} />,
  players: (size) => <IoPeopleOutline size={size} />,
  free: (size) => <MdMoneyOff size={size} />,
  paid: (size) => <MdAttachMoney size={size} />,
  verified: (size) => <IoCheckmarkCircle size={size} />,
};

const HoopBadge = ({
  variant,
  condition,
  text,
  showIcon = true,
  iconSize = 14,
  textClassName = 'text-fluid-xs',
  icon,
  tooltip,
  capitalize = true,
}: HoopBadgeProps) => {
  const conditionClass = variant === 'condition' && condition
    ? conditionColorSelector(condition)
    : '';

  const renderIcon = () => {
    if (!showIcon) return null;
    if (icon) return icon;
    if (variant !== 'condition' && defaultIcons[variant]) {
      return defaultIcons[variant](iconSize);
    }
    return null;
  };

  return (
    <div className={`hoop-card-icon ${variantStyles[variant]} ${conditionClass}`} title={tooltip}>
      {renderIcon()}
      <span className={`${textClassName} ${capitalize ? 'capitalize' : ''}`}>
        { text }
      </span>
    </div>
  );
};

export { HoopBadge };
export type { HoopBadgeProps };
