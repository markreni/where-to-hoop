import type { JSX } from "react";
import { Button } from "react-aria-components";
import { useColorModeValues } from "../contexts/DarkModeContext.tsx";
import type { ColorMode } from "../types/types";
import { FaMap } from "react-icons/fa";
import { PiListBold } from "react-icons/pi";
import { useTranslation } from "../hooks/useTranslation.ts";

interface ListToggleProps {
  toggleFunction: (value: boolean) => void;
  mapView: boolean;
}

const ListToggle = ({ toggleFunction, mapView }: ListToggleProps): JSX.Element => {
  const colorModeContext: ColorMode = useColorModeValues();
  const { t } = useTranslation();

  return (
    <Button 
      className={`${colorModeContext} flex-center gap-3 py-2 px-3 rounded-lg bg-background background-hover background-text border-label-component text-sm font-normal transition-colors cursor-pointer`}
      onClick={() => toggleFunction(!mapView)}
      >
      {mapView ? <PiListBold size={15}/> : <FaMap size={15}/>}
      <strong>{mapView ? t('common.showlist') : t('common.showmap')}</strong>
    </Button>
  );
}

export { ListToggle };