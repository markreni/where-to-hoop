import initialHoops from "../mockhoops";
import type { BasketballHoop } from "../types/types";
import HoopCard from "./reusable/HoopCard";

const List = () => {
  return (
    <div className="flex flex-col items-center gap-4 px-4 pt-40 h-[100vh] w-[100vw] overflow-y-auto pb-5">
        {initialHoops.map((hoop: BasketballHoop) => {
            return(
            <HoopCard key={hoop.id} hoop={hoop} />);
        })}
    </div>
  );
}

export default List;