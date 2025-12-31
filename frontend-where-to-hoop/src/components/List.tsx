import breakpoints from "../assets/style";
import initialHoops from "../mockhoops";
import type { BasketballHoop } from "../types/types";
import { HoopCard } from "./reusable/HoopCard";
import { useMediaQuery } from 'usehooks-ts'
import { Link } from "react-router-dom";

interface ListProps {
  toggleFunction: (value: boolean) => void;
  mapView: boolean;
}

const List = ({ toggleFunction, mapView }: ListProps) => {
  const xmd = useMediaQuery(`(min-width: ${breakpoints.xmd})`);

  initialHoops.sort

  return (
    <div className="pt-40 h-[100vh] w-[100vw] overflow-y-auto">
    {xmd ? (
      <div className="grid grid-cols-2 2xl:grid-cols-3 grid-rows-2 gap-6 px-8">
        {initialHoops.map((hoop: BasketballHoop) => {
            return(
              <Link key={hoop.id} to={`/hoops/${hoop.id}`}>
                <HoopCard hoop={hoop} toggleFunction={toggleFunction} mapView={mapView} />
              </Link>);
        })}
      </div>
    ) : (
      <div className="flex flex-col items-center gap-4 px-4">
        {initialHoops.map((hoop: BasketballHoop) => {
            return(
             <Link key={hoop.id} to={`/hoops/${hoop.id}`}>
                <HoopCard hoop={hoop} toggleFunction={toggleFunction} mapView={mapView} />
              </Link>);
        })}
    </div>
    )}
  </div>);
}

export { List };