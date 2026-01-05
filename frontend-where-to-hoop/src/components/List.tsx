import breakpoints from "../assets/style";
import initialHoops from "../mockhoops";
import type { BasketballHoop } from "../types/types";
import { HoopCard } from "./reusable/HoopCard";
import { useMediaQuery } from 'usehooks-ts'
import { Link } from "react-router-dom";
import haversineDistance from "../utils/functions";
import { useLocationValues } from "../contexts/LocationContext";
import { useEffect, useMemo } from "react";
import useLocateUser from "../hooks/useLocateUser";
import { SearchField } from "./reusable/SearchField";

interface ListProps {
  toggleFunction: (value: boolean) => void;
  mapView: boolean;
}

const List = ({ toggleFunction, mapView }: ListProps) => {
  const xmd = useMediaQuery(`(min-width: ${breakpoints.xmd})`);
  const mapCenterValues = useLocationValues();
  const locateUser = useLocateUser();

  useEffect(() => {
    locateUser();
  }, [locateUser]);

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

  return (
    <div className="pt-40 h-[100vh] w-[100vw] overflow-y-auto padding-b-for-page">
      <div className="absolute w-1/2 top-19 right-[10px]">
        <SearchField placeholder="Find hoops"/>
      </div>
    {xmd ? (
      <div className="grid grid-cols-2 2xl:grid-cols-3 grid-rows-2 gap-6 px-8">
        {sortedHoopsWithDistance.map(({ hoop, distance }) => (
        <Link key={hoop.id} to={`#`}> {/* Temporary link to prevent navigation on small screens -> /hoops/${hoop.id}*/}
          <HoopCard hoop={hoop} distance={distance} toggleFunction={toggleFunction} mapView={mapView} />
        </Link>
      ))}
      </div>
    ) : (
      <div className="flex flex-col items-center gap-4 px-4">
        {sortedHoopsWithDistance.map(({ hoop, distance }) => (
        <Link key={hoop.id} to={`#`}> {/* Temporary link to prevent navigation on small screens -> /hoops/${hoop.id}*/}
          <HoopCard hoop={hoop} distance={distance} toggleFunction={toggleFunction} mapView={mapView} />
        </Link>
      ))}
    </div>
    )}
  </div>);
}

export { List };