import { Button } from "react-aria-components";
import { useLanguage, useSetLanguage } from "../../contexts/LanguageContext";
import type { JSX } from "react";

const LanguageToggle = (): JSX.Element => {
  const language = useLanguage();
  const setLanguage = useSetLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fi' : 'en');
  };

  return (
    <Button
      onPress={toggleLanguage}
      className="ml-2 px-2 py-1 rounded-md bg-first-color text-white dark:text-black text-sm font-medium main-color-hover hover:scale-105 transition-colors transition-transform cursor-pointer"
    >
      {language.toUpperCase()}
    </Button>
  );
};

export { LanguageToggle };
