import type { BasketballHoop } from "../../types/types";
import { IoLocationSharp } from "react-icons/io5";
import { MdOutlineDateRange } from "react-icons/md";
import { conditionColors }from "../../utils/hoopCondition.tsx";

interface HoopCardProps {
  hoop: BasketballHoop;
}

const HoopCard = ({ hoop }: HoopCardProps) => {

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full hover:shadow-xl hover:bg-gray-100 transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">{hoop.name}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
            <IoLocationSharp size={16} />
            <span>{hoop.indoor ? "Indoor" : "Outdoor"}</span>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${conditionColors[hoop.condition]}`} title={hoop.condition} />
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{hoop.description}</p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="font-semibold">Condition:</span>
          <span className="capitalize">{hoop.condition}</span>
        </div>
        <div className="flex items-center gap-1">
          <MdOutlineDateRange size={14} />
          <span>{new Date(hoop.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>                      
  );
}

export default HoopCard;