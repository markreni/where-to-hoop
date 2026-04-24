import { Button } from "react-aria-components";
import { useColorModeValues } from "../../contexts/ColorModeContext.tsx";
import type { ColorMode } from "../../types/types.ts";
import type { FocusableElement } from "@react-types/shared/src/dom";
import type { MouseEvent } from "react"; 

interface HoopCardButtonProps {
  actionFunction: (e: MouseEvent<FocusableElement>) => void;
  title: string;
  colors: string;
  text: string;
  className?: string;
}
const HoopCardButton = ({ actionFunction, title, colors, text, className = '' }: HoopCardButtonProps) => {
  const colorModeContext: ColorMode = useColorModeValues();
  const isGreen = colors === 'hoop-card-button-green';
  const fontStyle = isGreen ? 'fredoka-semibold tracking-wide' : 'font-light';

  return (
    <Button
      className={`${colorModeContext} flex items-center gap-2 text-white padding-y-for-elements px-3.5 shadow-lg ${colors} ${text} rounded-xl ${fontStyle} transition-colors whitespace-nowrap cursor-pointer ${className}`}
        onClick={(e) => actionFunction(e)}
      >
        {/*<IoMapOutline size={16} /> --- IGNORE ---*/}
          {title}
    </Button>
  );
}

export { HoopCardButton };
export type { HoopCardButtonProps };