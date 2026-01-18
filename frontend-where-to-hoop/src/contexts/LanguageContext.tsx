import { createContext, useReducer, useContext, type Dispatch, type ReactNode, useEffect } from 'react';

type Language = 'en' | 'fi';

interface LanguageContextValue {
  state: Language;
  dispatch: Dispatch<Language>;
}

interface LanguageProviderProps {
  children: ReactNode;
}

const initialState: Language = 'en';

const initState = (init: Language): Language => {
  try {
    const raw = localStorage.getItem('language') as Language | null;
    return raw && (raw === 'en' || raw === 'fi') ? raw : init;
  } catch {
    return init;
  }
};

const languageReducer = (_: Language, action: Language): Language => {
  return action;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageContextProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(languageReducer, initState(initialState));

  useEffect(() => {
    try {
      localStorage.setItem('language', state);
    } catch {
      localStorage.setItem('language', 'en');
    }
  }, [state]);

  return (
    <LanguageContext.Provider value={{ state, dispatch }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): Language => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageContextProvider');
  }
  return ctx.state;
};

export const useSetLanguage = (): Dispatch<Language> => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useSetLanguage must be used within a LanguageContextProvider');
  }
  return ctx.dispatch;
};

export type { Language };
export default LanguageContext;
