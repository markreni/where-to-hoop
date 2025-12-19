import { ToggleButton } from "react-aria-components";
import { IoBasketballOutline, IoBasketballSharp } from "react-icons/io5";
import { useColorModeValues, useColorModeDispatch } from "../../contexts/DarkModeContext.tsx";
import type { ColorMode } from "../../types/types.ts";
import type { JSX } from "react";

const ToggleBasketball = (): JSX.Element => {
  const colorModeContext: ColorMode = useColorModeValues();
  const colorModeDispatch = useColorModeDispatch();

  return (
    <ToggleButton 
      isSelected={colorModeContext === 'dark'} 
      onChange={() => colorModeDispatch(colorModeContext === 'dark' ? 'light' : 'dark')}
      className="ml-4 rounded-full transition-colors bg-second-color dark:bg-gray-800 text-gray-800 dark:text-yellow-400 hover:bg-first-color dark:hover:bg-gray-700 cursor-pointer"
    >
      {colorModeContext === 'dark' ? <IoBasketballOutline size={35} /> : <IoBasketballSharp size={35} />}
    </ToggleButton>
  );
}

export { ToggleBasketball };