import type { ReactNode } from "react";
import type { Condition } from "../../types/types.ts";
import { conditionColorSelector } from "../../utils/options.tsx";
import { IoSunnyOutline, IoHomeOutline } from "react-icons/io5";
import { MdOutlineDateRange } from "react-icons/md";

type BadgeVariant = 'indoor' | 'outdoor' | 'condition' | 'date';

interface HoopBadgeProps {
  variant: BadgeVariant;
  condition?: Condition;
  text: string;
  showIcon?: boolean;
  iconSize?: number;
  textClassName?: string;
  icon?: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  indoor: 'bg-blue-100 text-blue-700',
  outdoor: 'bg-amber-100 text-amber-700',
  condition: 'text-white',
  date: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

const defaultIcons: Record<Exclude<BadgeVariant, 'condition'>, (size: number) => ReactNode> = {
  indoor: (size) => <IoHomeOutline size={size} />,
  outdoor: (size) => <IoSunnyOutline size={size} />,
  date: (size) => <MdOutlineDateRange size={size} />,
};

const HoopBadge = ({
  variant,
  condition,
  text,
  showIcon = true,
  iconSize = 14,
  textClassName = 'text-fluid-xs',
  icon,
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
    <div className={`hoop-card-icon ${variantStyles[variant]} ${conditionClass}`}>
      {renderIcon()}
      <span className={`${textClassName} ${variant === 'condition' ? 'capitalize' : ''}`}>
        {text}
      </span>
    </div>
  );
};

export { HoopBadge };
