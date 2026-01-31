import type { JSX, Dispatch } from "react";
import { Button } from "react-aria-components";
import { useColorModeValues } from "../contexts/DarkModeContext.tsx";
import type { ColorMode, MapView } from "../types/types";
import { FaMap } from "react-icons/fa";
import { PiListBold } from "react-icons/pi";
import { useTranslation } from "../hooks/useTranslation.ts";
import { useMapViewDispatch, useMapViewValues } from "../contexts/MapViewContext.tsx";

const ListToggle = (): JSX.Element => {
  const colorModeContext: ColorMode = useColorModeValues();
  const { t } = useTranslation();
  const mapViewDispatch: Dispatch<MapView> = useMapViewDispatch();
  const mapView: MapView = useMapViewValues();
  const isMapView = mapView === 'map';

  return (
    <Button
      className={`${colorModeContext} flex-center gap-3 py-2 px-3 rounded-lg bg-background background-hover background-text border-label-component text-sm font-normal transition-colors cursor-pointer`}
      onClick={() => mapViewDispatch(isMapView ? 'list' : 'map')}
      >
      {isMapView ? <PiListBold size={15}/> : <FaMap size={15}/>}
      <strong>{isMapView ? t('common.showlist') : t('common.showmap')}</strong>
    </Button>
  );
}

export { ListToggle };