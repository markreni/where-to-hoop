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

      const onSuccess = (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;

        dispatch({
          type: 'SET_USER_LOCATION',
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
      };

      navigator.geolocation.getCurrentPosition(
        onSuccess,
        (error) => {
          if (error.code === error.TIMEOUT) {
            // High accuracy timed out, retry with low accuracy
            navigator.geolocation.getCurrentPosition(
              onSuccess,
              (fallbackError) => {
                console.error("Error getting user's location:", fallbackError);
              },
              { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
            );
          } else {
            console.error("Error getting user's location:", error);
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
      );
    },
    [dispatch]
  );
};

export default useLocateUser;
