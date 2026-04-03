import { MapContainer, Marker, TileLayer } from "react-leaflet";
import type { LatLngTuple, LeafletEvent } from "leaflet";
import L from "leaflet";
import type { Coordinates } from "../types/types";
import { centerCoordinates } from "../utils/constants";
import { useLocationValues } from "../contexts/LocationContext";
import { MapController } from "./reusable/MapController";

interface MiniMapProps {
  coordinates: Coordinates;
  mapRef: React.RefObject<L.Map | null>;
  onCoordinatesChange?: (coordinates: Coordinates) => void;
  readOnly?: boolean;
}

const pinIcon = L.divIcon({
  html: '<svg fill="#F88158" viewBox="0 0 288 512" height="28" width="28" xmlns="http://www.w3.org/2000/svg"><defs><filter id="pin-shadow"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" flood-opacity="0.5"/></filter></defs><path filter="url(#pin-shadow)" stroke="white" stroke-width="15" d="M112 316.94v156.69l22.02 33.02c4.75 7.12 15.22 7.12 19.97 0L176 473.63V316.94c-10.39 1.92-21.06 3.06-32 3.06s-21.61-1.14-32-3.06zM144 0C64.47 0 0 64.47 0 144s64.47 144 144 144 144-64.47 144-144S223.53 0 144 0zm0 76c-37.5 0-68 30.5-68 68 0 6.62-5.38 12-12 12s-12-5.38-12-12c0-50.73 41.28-92 92-92 6.62 0 12 5.38 12 12s-5.38 12-12 12z"></path></svg>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
})

const DraggableMarker = ({
  position,
  onCoordinatesChange,
}: {
  position: LatLngTuple
  onCoordinatesChange: (coordinates: Coordinates) => void
}) => {
  const eventHandlers = {
    dragend(e: LeafletEvent) {
      const marker = e.target
      const latLng = marker.getLatLng()
      onCoordinatesChange({ latitude: Number(latLng.lat), longitude: Number(latLng.lng) })
    },
  }
  return <Marker position={position} draggable eventHandlers={eventHandlers} icon={pinIcon} />
}

const MiniMap = ({ coordinates, onCoordinatesChange, mapRef, readOnly = false }: MiniMapProps) => {
  const mapCenterValues: Coordinates = useLocationValues()

  const centerPosition: LatLngTuple = (mapCenterValues.latitude && mapCenterValues.longitude)
    ? [mapCenterValues.latitude, mapCenterValues.longitude]
    : centerCoordinates

  const markerPosition: LatLngTuple | null =
    coordinates.latitude !== null && coordinates.longitude !== null
      ? [coordinates.latitude, coordinates.longitude]
      : null

  return (
    <div className="h-50">
      <MapContainer
        center={markerPosition ?? centerPosition}
        zoom={markerPosition ? 14 : 10}
        className="h-full w-full rounded-lg"
        scrollWheelZoom
      >
        <MapController onMapReady={(map) => { mapRef.current = map }} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markerPosition && (
          readOnly
            ? <Marker position={markerPosition} icon={pinIcon} />
            : <DraggableMarker position={markerPosition} onCoordinatesChange={onCoordinatesChange!} />
        )}
      </MapContainer>
    </div>
  )
}

export { MiniMap };
