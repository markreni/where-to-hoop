import {
  SearchField as AriaSearchField,
  Input, FieldError, Label, Group,
  type SearchFieldProps as AriaSearchFieldProps,
  type ValidationResult,
} from 'react-aria-components';
import { FaSearch } from "react-icons/fa";
//import { MdCancel } from "react-icons/md";
import { useColorModeValues } from "../../contexts/DarkModeContext.tsx";
import type { ColorMode } from "../../types/types.ts";


interface SearchFieldProps extends AriaSearchFieldProps {
  label?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

const SearchField = ({ label, errorMessage, placeholder, value, onChange }: SearchFieldProps) => {
  const colorModeContext: ColorMode = useColorModeValues();
  
  return (
    <AriaSearchField aria-label='search' className="w-full flex flex-col">
      {label && (
        <Label className={`${colorModeContext} text-sm background-text`}>
          {label}
        </Label>
      )}
      <Group className={`${colorModeContext} w-full flex items-center gap-2 pl-3 py-1.5 rounded-lg bg-background border-label-component focus-within:ring-2 focus-within:ring-gray-500 transition-shadow`}>
        <FaSearch aria-hidden className={`${colorModeContext} flex-none w-4 h-4 background-text transition-colors`} />
        <Input 
          placeholder={placeholder} 
          className={`${colorModeContext} min-w-2 flex-1 px-2 bg-transparent outline-none background-text placeholder:text-gray-400 dark:placeholder:text-gray-500`} 
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
        {/*Clear button - functionality to be added later 
        <Button className={`${colorModeContext} flex-none w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors dark:text-white dark:hover:text-gray-300`}>
          <MdCancel aria-hidden className="w-5 h-5" />
        </Button>
        */}
      </Group>

      {errorMessage && (
        <FieldError className={`${colorModeContext} text-xs text-red-600 dark:text-red-400`}>
          {errorMessage}
        </FieldError>
      )}
    </AriaSearchField>
  );
}

export { SearchField };
export type { SearchFieldProps };