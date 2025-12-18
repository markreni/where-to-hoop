import "leaflet/dist/leaflet.css";
import Map from "../components/Map";
import List from "../components/List";
import { Button } from "react-aria-components";
import { TfiViewList } from "react-icons/tfi";
import { useState } from "react";
//import { Link } from "react-router-dom";
//import { useState, useEffect } from "react";

const Hoops = () => {
  const [mapView, toggleView] = useState<boolean>(true);
  
  return (
    <div className="relative">
      <Button 
        className="absolute flex-center gap-3 top-20 left-2 bg-white hover:bg-gray-100 transition-colors rounded-lg shadow-lg py-2 px-3 z-401 text-sm text-gray-700 cursor-pointer"
        onClick={() => toggleView(!mapView)}
        >
        <TfiViewList size={15}/>
        <strong>{mapView ? "Show List" : "Show Map"}</strong>
      </Button>
      { mapView ? (<Map />) : (<List /> ) }
    </div>
  );
};

export default Hoops;
