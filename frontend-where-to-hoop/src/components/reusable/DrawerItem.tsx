import { Link } from "react-router-dom";
import type { ColorMode } from "../../types/types";
import { useColorModeValues } from "../../contexts/ColorModeContext";

interface DrawerItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export const DrawerItem = ({ to, icon, label, onClick }: DrawerItemProps) => {
  const colorModeContext: ColorMode = useColorModeValues();

  return (
  <Link
    to={to}
    onClick={onClick}
    className={`${colorModeContext} flex items-center gap-3 px-3 py-3 rounded-lg background-text-black transition-colors hover:bg-gray-100 dark:hover:bg-gray-800`}
  >
    <span className={`${colorModeContext} text-gray-500 dark:text-gray-400`}>{icon}</span>
    <span className={"font-medium text-sm"}>{label}</span>
  </Link>
)};
