import conditionOptions from "../utils/courtCondition.tsx";
import type { Condition } from "../types/types";


interface MapLabelProps {
  selectedConditions: Set<Condition>;
  onToggleCondition: (condition: Condition) => void;
}

const MapLabel = ({ selectedConditions, onToggleCondition }: MapLabelProps) => {
  return (
     <div className="absolute bottom-6 left-3 bg-white dark:bg-black rounded-lg shadow-lg py-2 px-4 z-400">
          <h4 className="text-sm text-gray-800 dark:text-gray-200 mb-2"><strong>Court Condition</strong> </h4>
          <div className="flex flex-col gap-1.5">
            {conditionOptions.map((item) => {
              const isSelected = selectedConditions.has(item.condition);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => onToggleCondition(item.condition)}
                  className={`flex items-center gap-2 px-2 py-1 rounded transition-colors cursor-pointer ${
                    isSelected ? 'bg-gray-100' : 'bg-white'
                  }`}
                >
                  <div 
                    className={`w-4 h-4 rounded-full border-2 shadow ${isSelected ? `${item.color} border-white dark:border-black` : 'white border-gray-300 dark:border-gray-600'}`}
                  />
                  <span className={`text-sm ${isSelected ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
      </div>
  );
}

export { MapLabel };