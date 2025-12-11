import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
//import { useState, useEffect } from "react";
//import type { ObservationType } from "../types/types";
//import "leaflet/dist/leaflet.css";
//import { Link } from "react-router-dom";


const MapPage = () => {
  const position = [51.505, -0.09]

  return (
    <div>
      <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapPage;
