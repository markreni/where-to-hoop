import breakpoints from "../assets/style";
import initialHoops from "../mockhoops";
import type { BasketballHoop } from "../types/types";
import { HoopCardLarge } from "./reusable/HoopCardLarge";
import { HoopCardSmall } from "./reusable/HoopCardSmall";
import { useMediaQuery } from 'usehooks-ts'

const List = () => {
  const md = useMediaQuery(`(min-width: ${breakpoints.md})`);

  return (
    <div className="pt-40 h-[100vh] w-[100vw] overflow-y-auto">
    {md ? (
      <div className="grid grid-cols-2 grid-rows-3 gap-6 px-8">
        {initialHoops.map((hoop: BasketballHoop) => {
            return(
            <HoopCardLarge key={hoop.id} hoop={hoop} />);
        })}
      </div>
    ) : (
      <div className="flex flex-col items-center gap-4 px-4">
        {initialHoops.map((hoop: BasketballHoop) => {
            return(
            <HoopCardSmall key={hoop.id} hoop={hoop} />);
        })}
    </div>
    )}
  </div>);
}

export { List };