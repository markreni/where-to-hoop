import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { BasketballHoop } from "../types/types";
import initialHoops from "../mockhoops";
import type { condition } from "../types/types";
import { conditionColors }from "../assets/style";
//import { Link } from "react-router-dom";
//import { useState, useEffect } from "react";


const conditionClass = (condition?: condition) => {
  switch (condition) {
    case 'excellent': return conditionColors.excellent;
    case 'good':      return conditionColors.good;
    case 'fair':      return conditionColors.fair;
    case 'poor':      return conditionColors.poor;
    default:          return conditionColors.unknown;
  }
};

const Hoops = () => {
  const position: LatLngTuple = [40.7128, -74.0060];

  return (
    <div className="pt-16 relative">
      <MapContainer center={position} zoom={13} zoomControl={false} scrollWheelZoom={true} style={{ height: "94.5vh", width: "100vw"}}>
        <ZoomControl position="bottomright" /> 
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {initialHoops.map((hoop: BasketballHoop) => {
          const icon = L.divIcon({
            html: '<div class="hoop-emoji">🏀</div>',
            className: `hoop-icon-container ${conditionClass(hoop.condition)}`,
            iconSize: [33, 33],
            iconAnchor: [16.5, 16.5],
            popupAnchor: [0, -22],
          });

          return (
            <Marker key={hoop.id} position={[hoop.latitude, hoop.longitude]} icon={icon}>
              <Popup>
                <strong>{hoop.name}</strong><br />
                {hoop.description}<br />
                Condition: {hoop.condition}<br />
                {hoop.indoor ? "Indoor" : "Outdoor"}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-400">
          <h4 className="text-sm text-gray-700 mb-2"><strong>Court Condition</strong> </h4>
          <div className="flex flex-col gap-1.5">
            {[
              { label: 'Excellent', color: conditionColors.excellent },
              { label: 'Good', color: conditionColors.good },
              { label: 'Fair', color: conditionColors.fair },
              { label: 'Poor', color: conditionColors.poor },
              { label: 'Unknown', color: conditionColors.unknown },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div 
                  className={`w-4 h-4 rounded-full border-2 border-white shadow ${item.color}`}
                />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default Hoops;
