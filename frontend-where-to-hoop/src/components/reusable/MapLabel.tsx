
import type { ColorMode, Condition } from "../../types/types.ts";
import { useColorModeValues } from "../../contexts/DarkModeContext.tsx";
import { Button } from "react-aria-components";


interface MapLabelProps {
  selectedItems: Set<Condition | string>;
  onToggleItems: (condition: any) => void;
  title: string;
  options: { label: string; condition: Condition | string; color: string }[];
}

// Type guard function
const isCondition = (value: Condition | string): value is Condition => {
  return ['excellent', 'good', 'fair', 'poor'].includes(value as Condition);
};

const MapLabel = ({ title, selectedItems, onToggleItems, options }: MapLabelProps) => {
  const colorModeContext: ColorMode = useColorModeValues();
  
  return (
     <div className={`${colorModeContext} bg-background border-maplabel rounded-lg shadow-lg p-3`}>
          <h4 className={`${colorModeContext} text-sm text-gray-800 font-normal mb-2 dark:text-gray-200`}><strong>{title}</strong> </h4>
          <div className="flex flex-col gap-1.5">
            {options.map((item) => {
              const isSelected = selectedItems.has(item.condition);
              return (
                <Button
                  key={item.label}
                  type="button"
                  onClick={() => onToggleItems(item.condition)}
                  className={`flex items-center gap-2 px-2 py-1 rounded transition-colors cursor-pointer ${
                    isSelected ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white'
                  }`}
                >
                  {isCondition(item.condition) ? (
                  <div 
                    className={`${colorModeContext} w-4 h-4 rounded-full border-2 shadow ${isSelected ? `${item.color} border-white dark:border-black` : 'white border-gray-300 dark:border-gray-600'}`}
                  /> 
                  ) : null}
                  <span className={`text-sm ${isSelected ? 'text-gray-600 font-medium' : 'text-gray-600'}`}>
                    {item.label}
                  </span>
                </Button>
              );
            })}
          </div>
      </div>
  );
}

export { MapLabel };