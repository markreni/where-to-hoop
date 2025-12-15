import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
//import { useState, useEffect } from "react";
//import type { ObservationType } from "../types/types";
//import "leaflet/dist/leaflet.css";
//import { Link } from "react-router-dom";


const Hoops = () => {
  const position: LatLngTuple = [60.184230669318474, 24.83009157017735];

  return (
    <div>
       <MapContainer
            center={position}
            zoom={13}
            style={{ height: "80vh", width: "100%", borderRadius: "8px" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
        <Marker position={position}>
        
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Hoops;
