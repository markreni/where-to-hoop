import breakpoints from "../assets/style";
import type { BasketballHoop, ColorMode, Condition } from "../types/types";
import { HoopCard } from "./reusable/HoopCard";
import { useMediaQuery } from 'usehooks-ts'
import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import useLocateUser from "../hooks/useLocateUser";
import { SearchField } from "./reusable/SearchField";
import { CiFilter } from "react-icons/ci";
import { useColorModeValues } from "../contexts/DarkModeContext";
import { useTranslation } from "../hooks/useTranslation";
import { MapLabel } from "./reusable/MapLabel";
import { conditionOptions, doorOptions } from "../utils/options";
import { Button } from "react-aria-components";

interface FilterState {
  selectedConditions: Set<Condition>;
  selectedDoors: Set<"indoor" | "outdoor">;
  onToggleCondition: (condition: Condition) => void;
  onToggleDoor: (door: "indoor" | "outdoor") => void;
  clearConditionFilters: () => void;
  clearDoorFilters: () => void;
}

interface ListProps {
  filteredAndSortedHoops: { hoop: BasketballHoop; distance: number; }[];
  toggleFunction: (value: boolean) => void;
  mapView: boolean;
  filters: FilterState;
}

const List = ({ filteredAndSortedHoops, toggleFunction, mapView, filters }: ListProps) => {
  const { selectedConditions, selectedDoors, onToggleCondition, onToggleDoor, clearConditionFilters, clearDoorFilters } = filters;
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const md: boolean = useMediaQuery(`(min-width: ${breakpoints.md})`);
  const locateUser = useLocateUser();
  const colorModeContext: ColorMode = useColorModeValues();
  const { t } = useTranslation();

  useEffect(() => {
    locateUser();
  }, [locateUser]);
  
  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {   
      const target: Node = event.target as Node;
      if (
        filterRef.current &&
        !filterRef.current.contains(target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(target)
      ) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showFilters]);
  
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
              placeholder={t('hoops.searchPlaceholder')}
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="relative">
            <Button 
              ref={filterButtonRef} 
              onClick={() => setShowFilters(!showFilters)}
              className={`${colorModeContext} rounded-lg p-1 bg-background background-hover border-label-component transition-colors`}
              aria-label="Filter hoops"
              aria-pressed={showFilters}
            >
              <CiFilter 
                size={25} 
                className={`${colorModeContext} background-text`} 
              />
            </Button>
          
            {/* Filters - Show below the filter button */}
            {showFilters && (
              <div ref={filterRef} className="absolute top-full right-0 mt-1 flex flex-col min-w-[200px]">
                <MapLabel groups={[{ title: t('hoops.doorType'), selectedItems: selectedDoors, onToggleItems: onToggleDoor, options: doorOptions, clearFilter:  clearDoorFilters},{ title: t('hoops.courtCondition'), selectedItems: selectedConditions, onToggleItems: onToggleCondition, options: conditionOptions, clearFilter: clearConditionFilters }]} />
              </div>
            )}
        </div>
      </div>
    </div>

      {/* Hoop Cards Grid/List */}
      <div className="flex-1 pb-4 px-4 sm:px-6 md:px-8 ">
        {md ? (
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