import type { JSX } from "react";
import { Button } from "react-aria-components";
import { useColorModeValues } from "../contexts/DarkModeContext.tsx";
import type { ColorMode } from "../types/types";
import { FaMap } from "react-icons/fa";
import { PiListBold } from "react-icons/pi";

const ListToggle = ({ toggleFunction, mapView }: { toggleFunction: (value: boolean) => void; mapView: boolean }): JSX.Element => {
  const colorModeContext: ColorMode = useColorModeValues();

  return (
    <Button 
      className={`${colorModeContext} flex-center gap-3 bg-background hover:bg-gray-100 border-maplabel transition-colors rounded-lg shadow-lg py-2 px-3 text-sm text-gray-700 font-normal cursor-pointer dark:text-white dark:hover:bg-gray-700`}
      onClick={() => toggleFunction(!mapView)}
      >
      {mapView ? <PiListBold size={15}/> : <FaMap size={15}/>}
      <strong>{mapView ? "Show List" : "Show Map"}</strong>
    </Button>
  );
}

export { ListToggle };