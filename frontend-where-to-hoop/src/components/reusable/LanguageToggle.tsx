import { Button } from "react-aria-components";
import { useLanguage, useSetLanguage } from "../../contexts/LanguageContext";
import type { JSX } from "react";
import { useColorModeValues } from "../../contexts/ColorModeContext.tsx";
import type { ColorMode } from "../../types/types.ts";

const LanguageToggle = (): JSX.Element => {
  const language = useLanguage();
  const setLanguage = useSetLanguage();
  const colorModeContext: ColorMode = useColorModeValues();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fi' : 'en');
  };

  return (
    <Button
      onPress={toggleLanguage}
      className={`${colorModeContext} ml-2 px-2 py-1 rounded-md bg-first-color text-background text-sm font-medium main-color-hover transition-colors cursor-pointer`}
    >
      {language.toUpperCase()}
    </Button>
  );
};

export { LanguageToggle };
