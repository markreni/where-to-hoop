import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../types/types';
import en from '../locales/en.json';
import fi from '../locales/fi.json';

type TranslationParams = Record<string, string | number>;

const translations: Record<Language, typeof en> = {
  en,
  fi,
};

export const useTranslation = () => {
  const language: Language = useLanguage();

  const t = (key: string, params?: TranslationParams): string => {
    const keys: string[] = key.split('.');
    let value: unknown = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Return the key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Handle interpolation {{param}}
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey: string) => {
        return params[paramKey]?.toString() ?? `{{${paramKey}}}`;
      });
    }

    return value;
  };

  return { t, language };
};
