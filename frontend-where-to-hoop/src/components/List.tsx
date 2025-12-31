import breakpoints from "../assets/style";
import initialHoops from "../mockhoops";
import type { BasketballHoop } from "../types/types";
import { HoopCard } from "./reusable/HoopCard";
import { useMediaQuery } from 'usehooks-ts'
import { Link } from "react-router-dom";
import haversineDistance from "../utils/functions";
import { useLocationValues } from "../contexts/LocationContext";
import { useMemo } from "react";

interface ListProps {
  toggleFunction: (value: boolean) => void;
  mapView: boolean;
}

const List = ({ toggleFunction, mapView }: ListProps) => {
  const xmd = useMediaQuery(`(min-width: ${breakpoints.xmd})`);
  const userLocation = useLocationValues();

  // Sort hoops by distance from user
  const sortedHoopsWithDistance: { hoop: BasketballHoop; distance: number }[] = useMemo(() => {
  if (!userLocation.latitude || !userLocation.longitude) {
    return initialHoops.map(hoop => ({ hoop, distance: 0 }));
  }

  return initialHoops
    .map(hoop => ({
      hoop,
      distance: haversineDistance(
        [userLocation.latitude!, userLocation.longitude!],
        [hoop.coordinates.latitude!, hoop.coordinates.longitude!]
      )
    }))
    .sort((a, b) => a.distance - b.distance);
}, [userLocation.latitude, userLocation.longitude]);

  return (
    <div className="pt-40 h-[100vh] w-[100vw] overflow-y-auto">
    {xmd ? (
      <div className="grid grid-cols-2 2xl:grid-cols-3 grid-rows-2 gap-6 px-8">
        {sortedHoopsWithDistance.map(({ hoop, distance }) => (
        <Link key={hoop.id} to={`/hoops/${hoop.id}`}>
          <HoopCard hoop={hoop} distance={distance} toggleFunction={toggleFunction} mapView={mapView} />
        </Link>
      ))}
      </div>
    ) : (
      <div className="flex flex-col items-center gap-4 px-4">
        {sortedHoopsWithDistance.map(({ hoop, distance }) => (
        <Link key={hoop.id} to={`/hoops/${hoop.id}`}>
          <HoopCard hoop={hoop} distance={distance} toggleFunction={toggleFunction} mapView={mapView} />
        </Link>
      ))}
    </div>
    )}
  </div>);
}

export { List };