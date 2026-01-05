import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import L from "leaflet";
//import "leaflet.locatecontrol/dist/L.Control.Locate.min.css"; // Import styles
import "leaflet/dist/leaflet.css";
import type { BasketballHoop, Coordinates, ColorMode } from "../types/types";
import { useRef } from "react";
import { useLocationValues } from "../contexts/LocationContext.tsx";
//import { ImLocation2 } from "react-icons/im";
import { conditionColorSelector } from "../utils/courtCondition.tsx";
import { MapMarkerPopup } from "./reusable/MapMarkerPopup.tsx";
import { UserLocator } from "./UserLocator.tsx";
import centerCoordinates from "../utils/constants.ts";
import { MapController } from "./reusable/MapController.tsx";
import { useColorModeValues } from "../contexts/DarkModeContext.tsx";



const Map = ({ filteredAndSortedHoops }: { filteredAndSortedHoops: { hoop: BasketballHoop; distance: number; }[] }) => {
  const mapCenterValues: Coordinates = useLocationValues();
  const mapRef = useRef<L.Map | null>(null);
  const colorModeContext: ColorMode = useColorModeValues();

  const centerPosition: LatLngTuple = (mapCenterValues.latitude && mapCenterValues.longitude) ? [mapCenterValues.latitude!, mapCenterValues.longitude!] : centerCoordinates; 

  return (
    <div>
      <MapContainer className="h-[100vh] w-[100vw]" center={centerPosition} zoom={11} zoomControl={false} scrollWheelZoom={true}>
      <MapController onMapReady={(map) => { mapRef.current = map; }} />
      <ZoomControl position="topright" /> 
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {filteredAndSortedHoops.map(({ hoop }) => {
          const icon = L.divIcon({
            html: '<div class="hoop-emoji">🏀</div>',
            className: `hoop-icon-container-${colorModeContext} ${conditionColorSelector(hoop.condition)}`,
            iconSize: [33, 33],
            iconAnchor: [16.5, 16.5],
            popupAnchor: [0, -22],
          });

          return (
            <Marker key={hoop.id} position={[hoop.coordinates.latitude!, hoop.coordinates.longitude!]} icon={icon}>
              <MapMarkerPopup hoop={hoop} />
            </Marker>
          );
        })}

      </MapContainer>
      <UserLocator mapRef={mapRef} />
      
      
    </div>
  );
}

export { Map };