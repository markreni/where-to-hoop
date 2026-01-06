import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { Map }from "../components/Map";
import { List } from "../components/List";
import { ListToggle } from "../components/ListToggle";
import { MapLabel } from "../components/reusable/MapLabel";
import type { BasketballHoop, Condition } from "../types/types";
import conditionOptions from "../utils/courtCondition.tsx";
import initialHoops from "../mockhoops";
import haversineDistance from "../utils/functions";
import { useLocationValues } from "../contexts/LocationContext.tsx";
//import { Link } from "react-router-dom";
//import { useState, useEffect } from "react";


const Hoops = () => {
  const [mapView, toggleView] = useState<boolean>(() => {
    const stored = localStorage.getItem("hoopsMapView");
    return stored ? JSON.parse(stored) : true;
  });
  const [selectedConditions, setSelectedConditions] = useState<Set<Condition>>(new Set(['excellent', 'good', 'fair', 'poor']));
  const [selectedDoors, setSelectedDoors] = useState<Set<'indoor' | 'outdoor'>>(new Set(['indoor', 'outdoor']));
  const mapCenterValues = useLocationValues();

  useEffect(() => {
    localStorage.setItem("hoopsMapView", JSON.stringify(mapView));
  }, [mapView]);

  const toggleCondition = (condition: Condition) => {
    setSelectedConditions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(condition)) {
        newSet.delete(condition);
      } else {
        newSet.add(condition);
      }
      return newSet;
    });
  };

  const toggleDoor = (door: 'indoor' | 'outdoor') => {
    setSelectedDoors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(door)) {
        newSet.delete(door);
      } else {
        newSet.add(door);
      }
      return newSet;
    });
  };

  // Sort hoops by distance from user
  const sortedHoopsWithDistance: { hoop: BasketballHoop; distance: number }[] = useMemo(() => {
  
  if (!mapCenterValues.latitude || !mapCenterValues.longitude) {
    return initialHoops.map(hoop => ({ hoop, distance: 0 }));
  }

  return initialHoops
    .map(hoop => ({
      hoop,
      distance: haversineDistance(
        [mapCenterValues.latitude!, mapCenterValues.longitude!],
        [hoop.coordinates.latitude!, hoop.coordinates.longitude!]
      ),
    }))
    .sort((a, b) => a.distance - b.distance);
}, [mapCenterValues.latitude, mapCenterValues.longitude]);

  // Filter hoops based on selected conditions and door types
  const filteredAndSortedHoops: ReturnType<typeof sortedHoopsWithDistance.filter> = sortedHoopsWithDistance.filter(({ hoop })=> selectedConditions.has(hoop.condition) && (hoop.isIndoor ? selectedDoors.has('indoor') : selectedDoors.has('outdoor')));
  
  return (
    <div className="relative h-screen">
      <div className="absolute top-19 left-[10px] z-401">
        <ListToggle toggleFunction={toggleView} mapView={mapView} />
      </div>
      { mapView ? (
      <div>
        <div className="absolute bottom-2 right-[10px] z-401">
          <MapLabel title={"Door Type"} selectedItems={selectedDoors} onToggleItems={toggleDoor} options={[{ label: 'Indoor', condition: 'indoor', color: 'bg-blue-500' }, { label: 'Outdoor', condition: 'outdoor', color: 'bg-green-500' }]} />
        </div>
        <div className="absolute bottom-2 left-[10px] z-401">
          <MapLabel title={"Court Condition"} selectedItems={selectedConditions} onToggleItems={toggleCondition} options={conditionOptions} />
        </div>
      </div>
      ) : null }
      { mapView ? (<Map filteredAndSortedHoops={filteredAndSortedHoops} />) : (<List filteredAndSortedHoops={filteredAndSortedHoops} toggleFunction={toggleView} mapView={mapView} /> ) }
    </div>
  );
};

export default Hoops;
