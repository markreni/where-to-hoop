import { ToggleButton } from "react-aria-components";
import { IoBasketballOutline, IoBasketballSharp } from "react-icons/io5";
import { useColorModeValues, useColorModeDispatch } from "../../contexts/DarkModeContext.tsx";
import type { ColorMode } from "../../types/types.ts";
import type { JSX } from "react";

const ColorModeToggle = (): JSX.Element => {
  const colorModeContext: ColorMode = useColorModeValues();
  const colorModeDispatch = useColorModeDispatch();

  return (
    <ToggleButton 
      isSelected={colorModeContext === 'dark'} 
      onChange={() => colorModeDispatch(colorModeContext === 'dark' ? 'light' : 'dark')}
      className="ml-4 rounded-full bg-first-color text-gray-800 main-color-hover hover:scale-110 transition-colors transition-transform cursor-pointer"
    >
      {colorModeContext === 'dark' ? <IoBasketballOutline size={35} /> : <IoBasketballSharp size={35} />}
    </ToggleButton>
  );
}

export { ColorModeToggle };