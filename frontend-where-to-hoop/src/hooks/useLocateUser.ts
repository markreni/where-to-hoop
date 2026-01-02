import { useCallback } from "react";
import { useLocationDispatch } from "../contexts/LocationContext";

interface LocateOptions {
  mapRef?: React.RefObject<L.Map | null>;
  zoom?: number;
  onAdditionForm?: (coords: GeolocationCoordinates) => void;
}

// Fetch user location, update context, optionally recenter map, and trigger a callback
export const useLocateUser = (): ((options?: LocateOptions) => void) => {
  const dispatch = useLocationDispatch();

  return useCallback(
    (options?: LocateOptions) => {
      console.log("Locating user...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          dispatch({
            payload: {
              latitude,
              longitude,
            },
          });

          if (options?.mapRef?.current) {
            const map = options.mapRef.current;
            const targetZoom = options.zoom ?? map.getZoom();
            map.setView([latitude, longitude], targetZoom);
          }

          options?.onAdditionForm?.(position.coords);
        },
        (error) => {
          console.error("Error getting user's location:", error);
        },
        { enableHighAccuracy: true }
      );
    },
    [dispatch]
  );
};

export default useLocateUser;
