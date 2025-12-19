import type { JSX } from "react";
import { Button } from "react-aria-components";
import { TfiViewList } from "react-icons/tfi";
import { useColorModeValues } from "../contexts/DarkModeContext.tsx";
import type { ColorMode } from "../types/types";

const ListToggle = ({ toggleFunction, mapView }: { toggleFunction: (value: boolean) => void; mapView: boolean }): JSX.Element => {
  const colorModeContext: ColorMode = useColorModeValues();

  return (
    <Button 
        className={`${colorModeContext} absolute flex-center gap-3 top-20 left-2 bg-white hover:bg-gray-100 transition-colors rounded-lg shadow-lg py-2 px-3 z-401 text-sm text-gray-700 font-normal cursor-pointer dark:text-white dark:bg-black dark:hover:bg-gray-700`}
        onClick={() => toggleFunction(!mapView)}
        >
        <TfiViewList size={15}/>
        <strong>{mapView ? "Show List" : "Show Map"}</strong>
      </Button>
  );
}

export default ListToggle;