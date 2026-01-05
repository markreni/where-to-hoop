import breakpoints from "../assets/style";
import type { BasketballHoop } from "../types/types";
import { HoopCard } from "./reusable/HoopCard";
import { useMediaQuery } from 'usehooks-ts'
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import useLocateUser from "../hooks/useLocateUser";
import { SearchField } from "./reusable/SearchField";

interface ListProps {
  toggleFunction: (value: boolean) => void;
  mapView: boolean;
  filteredAndSortedHoops: { hoop: BasketballHoop; distance: number; }[];
}

const List = ({ filteredAndSortedHoops, toggleFunction, mapView }: ListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const xmd = useMediaQuery(`(min-width: ${breakpoints.xmd})`);
  const locateUser = useLocateUser();

  useEffect(() => {
    locateUser();
  }, [locateUser]);

  const filteredWithSearchHoops = useMemo(() => {
    return filteredAndSortedHoops.filter(({ hoop }) =>
      hoop.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, filteredAndSortedHoops]);

  return (
    <div className="pt-40 h-[83vh] w-[100vw] overflow-y-auto padding-b-for-page">
      <div className="absolute w-1/2 top-19 right-[10px]">
        <SearchField 
          placeholder="Find hoops"
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>
    {xmd ? (
      <div className="grid grid-cols-2 2xl:grid-cols-3 grid-rows-2 gap-6 px-8">
        {filteredWithSearchHoops.map(({ hoop, distance }) => (
        <Link key={hoop.id} to={`#`}> {/* Temporary link to prevent navigation on small screens -> /hoops/${hoop.id}*/}
          <HoopCard hoop={hoop} distance={distance} toggleFunction={toggleFunction} mapView={mapView} />
        </Link>
      ))}
      </div>
    ) : (
      <div className="flex flex-col items-center gap-4 px-4">
        {filteredWithSearchHoops.map(({ hoop, distance }) => (
        <Link key={hoop.id} to={`#`}> {/* Temporary link to prevent navigation on small screens -> /hoops/${hoop.id}*/}
          <HoopCard hoop={hoop} distance={distance} toggleFunction={toggleFunction} mapView={mapView} />
        </Link>
      ))}
    </div>
    )}
  </div>);
}

export { List };