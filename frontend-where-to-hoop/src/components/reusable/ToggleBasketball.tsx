import { ToggleButton } from "react-aria-components";
import { IoBasketballOutline, IoBasketballSharp } from "react-icons/io5";

const ToggleBasketball = ({ isSelected, toggleFunction }: {isSelected: boolean; toggleFunction: (value: boolean) => void}) => {
  return (
    <ToggleButton 
      isSelected={isSelected} 
      onChange={() => toggleFunction(!isSelected)}
      className="ml-4 rounded-full p-1 transition-colors bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-gray-700"
    >
      {isSelected ? <IoBasketballOutline size={35} /> : <IoBasketballSharp size={35} />}
    </ToggleButton>
  );
}

export { ToggleBasketball };