
import type { ColorMode, Condition } from "../../types/types.ts";
import { useColorModeValues } from "../../contexts/DarkModeContext.tsx";
import { useTranslation } from "../../hooks/useTranslation.ts";
import { Button } from "react-aria-components";
import { TbFilterX } from "react-icons/tb";
//import InfoLink from "./InfoLink";


type MapLabelGroup = {
  title: string;
  selectedItems: Set<any>;
  onToggleItems: (value: any) => void;
  options: { labelKey: string; name: any; color: string }[];
  clearFilter: () => void;
};

interface MapLabelProps {
  groups: MapLabelGroup[];
  className?: string;
}

// Type guard function
const isCondition = (value: Condition | string): value is Condition => {
  return ['excellent', 'good', 'fair', 'poor'].includes(value as Condition);
};

const hasAllValues = <T,>(set: Set<T>, allValues: readonly T[]): boolean => {
  return allValues.every(value => set.has(value));
};

const MapLabel = ({ groups, className }: MapLabelProps) => {
  const colorModeContext: ColorMode = useColorModeValues();
  const { t } = useTranslation();

  return (
     <div className={`${colorModeContext} bg-background border-label-component rounded-lg shadow-lg p-3 ${className ?? ""}`}>
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-1.5 pb-3 last:pb-0">
          <div className="flex items-center justify-start gap-2.5">
            <div className="flex items-center gap-2">                                       
              <h4 className={`${colorModeContext} text-fluid-sm background-text font-normal`}>                                                                                             
                <strong>{group.title}</strong>                                                   
              </h4>                                                                                                                             
            </div>   
            {!hasAllValues(group.selectedItems, group.options.map(option => option.name)) && (
              <Button onClick={group.clearFilter} aria-label="Clear filter">
                <TbFilterX className={`${colorModeContext} mb-1 text-black dark:text-white cursor-pointer`} />
              </Button>
            )}
          </div>
          {group.options.map((item) => {
            const isSelected = group.selectedItems.has(item.name);
            return (
              <Button
                key={item.labelKey}
                type="button"
                onClick={() => group.onToggleItems(item.name)}
                className={`flex items-center gap-2 w-full px-2 py-1 rounded transition-colors cursor-pointer ${
                  isSelected ? "bg-gray-100 hover:bg-gray-200" : "bg-white"
                }`}
              >
                {isCondition(item.name) && (
                  <div
                    className={`${colorModeContext} w-4 h-4 rounded-full border-2 shadow ${
                      isSelected ? `${item.color} background-border-reverse` : "white border-gray-300 dark:border-gray-600"
                    }`}
                  />
                )}
                <span className={`text-fluid-sm ${isSelected ? "text-gray-600 font-medium" : "text-gray-600"}`}>{t(item.labelKey)}</span>
              </Button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export { MapLabel };