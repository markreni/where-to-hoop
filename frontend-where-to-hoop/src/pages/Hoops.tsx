import "leaflet/dist/leaflet.css";
import { useState } from "react";
import Map from "../components/Map";
import List from "../components/List";
import ListToggle from "../components/ListToggle";
//import { Link } from "react-router-dom";
//import { useState, useEffect } from "react";


const Hoops = () => {
  const [mapView, toggleView] = useState<boolean>(true);
  
  return (
    <div className="relative">
      <ListToggle toggleFunction={toggleView} mapView={mapView} />
      { mapView ? (<Map />) : (<List /> ) }
    </div>
  );
};

export default Hoops;
