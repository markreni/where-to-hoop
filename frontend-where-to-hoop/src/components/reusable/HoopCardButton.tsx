import { Button } from "react-aria-components";
import { useColorModeValues } from "../../contexts/DarkModeContext.tsx";
import type { ColorMode } from "../../types/types.ts";
import type { FocusableElement } from "@react-types/shared/src/dom";
import type { MouseEvent } from "react"; 

interface HoopCardButtonProps {
  actionFunction: (e: MouseEvent<FocusableElement>) => void;
  title: string;
  bgColor: string;
}
const HoopCardButton = ({ actionFunction, title, bgColor }: HoopCardButtonProps) => {
  const colorModeContext: ColorMode = useColorModeValues();

  return (
    <Button 
      className={`${colorModeContext} flex items-center gap-2 padding-y-for-elements padding-x-for-elements border-1 border-black/20 shadow-md ${bgColor} text-white rounded-xl transition-colors text-fluid-sm md:text-fluid-base whitespace-nowrap cursor-pointer dark:border-white/50`}
        onClick={(e) => actionFunction(e)}
      >
        {/*<IoMapOutline size={16} /> --- IGNORE ---*/}
          {title}
    </Button>
  );
}

export { HoopCardButton };