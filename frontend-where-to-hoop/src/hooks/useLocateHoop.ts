import { useCallback, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { FocusableElement } from "@react-types/shared";
import type { Coordinates } from "../types/types";
import { useLocationDispatch } from "../contexts/LocationContext";
import { useMapViewDispatch } from "../contexts/MapViewContext";

export const useLocateHoop = (coordinates: Coordinates | undefined) => {
  const userLocationDispatch = useLocationDispatch();
  const mapViewDispatch = useMapViewDispatch();
  const navigate = useNavigate();

  return useCallback(
    (e: MouseEvent<FocusableElement>) => {
      e.preventDefault();
      if (!coordinates) return;
      userLocationDispatch({
        type: 'SET_MAP_CENTER',
        payload: { coordinates, source: 'hoop' },
      });
      mapViewDispatch('map');
      navigate('/hoops');
    },
    [coordinates, userLocationDispatch, mapViewDispatch, navigate]
  );
};

export default useLocateHoop;
