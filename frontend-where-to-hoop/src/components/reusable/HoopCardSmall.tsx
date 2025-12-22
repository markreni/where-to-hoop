import type { BasketballHoop } from "../../types/types.ts";
import { IoLocationSharp } from "react-icons/io5";
import { MdOutlineDateRange } from "react-icons/md";
import { conditionColorSelector } from "../../utils/courtCondition.tsx";
import { useMediaQuery } from 'usehooks-ts'
import breakpoints from "../../assets/style.ts";

interface HoopCardProps {
  hoop: BasketballHoop;
}

const HoopCardSmall = ({ hoop }: HoopCardProps) => {
  const sm = useMediaQuery(`(min-width: ${breakpoints.sm})`);

  return (
    <div className="h-1/3 w-full flex flex-col justify-start gap-2 bg-white rounded-lg shadow-lg p-4 hover:shadow-xl hover:bg-gray-100 transition-shadow">
      <div>
        <h5>{hoop.name}</h5>
      </div>
      <div className="flex flex-row justify-start gap-8">
        <div className="flex-3 w-2/4 h-1/4 object-cover">
          <img className="rounded-lg"
            src={hoop.profile_images.length > 0 ? hoop.profile_images[0].imageName : 'https://via.placeholder.com/150'}
            alt={hoop.name}
            
          />
        </div>
        <div className="flex flex-col justify-between text-sm">
            {sm && (<p className="w-40 w-full mb-1">{hoop.description}</p>)}
            <div className="hoop-card-spacer">
              <IoLocationSharp size={14}/>
              <p> {hoop.indoor ? "Indoor" : "Outdoor"} court </p>
            </div>
            <div className="hoop-card-spacer">
              <div className={`w-3 h-3 rounded-full ${conditionColorSelector(hoop.condition)}`} title={hoop.condition} />
              <span>{`${hoop.condition} condition`}</span> 
            </div>
            <div className="hoop-card-spacer">
              <MdOutlineDateRange size={14} />
              <span>{`${new Date(hoop.createdAt).toLocaleDateString()}`}</span>
            </div>
          </div>
      </div>
      
    </div>                        
  );
}

export { HoopCardSmall };