import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { Map }from "../components/Map";
import { List } from "../components/List";
import { ListToggle } from "../components/ListToggle";
//import { Link } from "react-router-dom";
//import { useState, useEffect } from "react";


const Hoops = () => {
  const [mapView, toggleView] = useState<boolean>(() => {
    const stored = localStorage.getItem("hoopsMapView");
    return stored ? JSON.parse(stored) : true;
  });

  useEffect(() => {
    localStorage.setItem("hoopsMapView", JSON.stringify(mapView));
  }, [mapView]);
  
  return (
    <div className="relative">
      <ListToggle toggleFunction={toggleView} mapView={mapView} />
      { mapView ? (<Map />) : (<List toggleFunction={toggleView} mapView={mapView} /> ) }
    </div>
  );
};

export default Hoops;
