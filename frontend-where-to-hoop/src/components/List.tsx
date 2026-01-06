import breakpoints from "../assets/style";
import type { BasketballHoop, ColorMode } from "../types/types";
import { HoopCard } from "./reusable/HoopCard";
import { useMediaQuery } from 'usehooks-ts'
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import useLocateUser from "../hooks/useLocateUser";
import { SearchField } from "./reusable/SearchField";
import { CiFilter } from "react-icons/ci";
import { useColorModeValues } from "../contexts/DarkModeContext";

interface ListProps {
  toggleFunction: (value: boolean) => void;
  mapView: boolean;
  filteredAndSortedHoops: { hoop: BasketballHoop; distance: number; }[];
}

const List = ({ filteredAndSortedHoops, toggleFunction, mapView }: ListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const xmd = useMediaQuery(`(min-width: ${breakpoints.xmd})`);
  const locateUser = useLocateUser();
  const colorModeContext: ColorMode = useColorModeValues();

  useEffect(() => {
    locateUser();
  }, [locateUser]);

  const filteredWithSearchHoops = useMemo(() => {
    return filteredAndSortedHoops.filter(({ hoop }) =>
      hoop.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, filteredAndSortedHoops]);

  return (
    <div className="pt-19 h-[100vh] w-full flex flex-col gap-4 overflow-y-auto padding-b-for-page">
      {/* Filter and Search Bar - Fixed at top */}
      <div className="sticky top-0 px-3">
        <div className="flex items-center justify-end gap-1 xsm:gap-2 sm:gap-4 max-w-screen-2xl mx-auto">
          <div className="w-1/2 xsm:w-3/5 sm:w-2/3">
            <SearchField  
              placeholder="Find hoops"
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <button 
            className={`${colorModeContext} rounded-lg p-1 bg-background hover:bg-gray-100 border-maplabel transition-colors dark:hover:bg-gray-700`}
            aria-label="Filter hoops"
          >
            <CiFilter size={25} className={`${colorModeContext} text-black dark:text-white`} />
          </button>
        </div>
      </div>

      {/* Hoop Cards Grid/List */}
      <div className="flex-1 pb-4 px-4 sm:px-6 md:px-8 ">
        {xmd ? (
          <div className="grid grid-cols-2 2xl:grid-cols-3 gap-6 max-w-screen-2xl mx-auto">
            {filteredWithSearchHoops.map(({ hoop, distance }) => (
              <Link key={hoop.id} to={`#`}>
                <HoopCard hoop={hoop} distance={distance} toggleFunction={toggleFunction} mapView={mapView} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {filteredWithSearchHoops.map(({ hoop, distance }) => (
              <Link key={hoop.id} to={`#`}>
                <HoopCard hoop={hoop} distance={distance} toggleFunction={toggleFunction} mapView={mapView} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { List };