import type { BasketballHoop } from "../../types/types.ts";
import { IoLocationSharp } from "react-icons/io5";
import { MdOutlineDateRange } from "react-icons/md";
import { conditionColorSelector } from "../../utils/courtCondition.tsx";

interface HoopCardProps {
  hoop: BasketballHoop;
}

const HoopCardLarge = ({ hoop }: HoopCardProps) => {

  return (
    <div className="flex items-start justify-between bg-white rounded-lg shadow-lg p-4 w-full hover:shadow-xl hover:bg-gray-100 transition-shadow">
      <div className="flex flex-col items-start gap-4">
        <h5>{hoop.name}</h5>
        <div className="flex flex-col h-35 justify-around gap-2">
          
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
            <span>{`Last updated: ${new Date(hoop.createdAt).toLocaleDateString()}`}</span>
          </div>
        </div>
      </div>
      <div className="w-2/4 h-full object-cover">
        <img className="rounded-lg"
          src={hoop.profile_images.length > 0 ? hoop.profile_images[0].imageName : 'https://via.placeholder.com/150'}
          alt={hoop.name}
          
        />
      </div>
      
    </div>                        
  );
}

export { HoopCardLarge };