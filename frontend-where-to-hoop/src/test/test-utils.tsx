import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { ColorModeContextProvider } from '../contexts/DarkModeContext';
import { LocationContextProvider } from '../contexts/LocationContext';
import { LanguageContextProvider } from '../contexts/LanguageContext';
import { ToastProvider } from '../contexts/ToastContext';
import { BrowserRouter } from 'react-router-dom';

interface AllProvidersProps {
  children: ReactNode;
}

const AllProviders = ({ children }: AllProvidersProps) => {
  return (
    <BrowserRouter>
      <ColorModeContextProvider>
        <LocationContextProvider>
          <LanguageContextProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </LanguageContextProvider>
        </LocationContextProvider>
      </ColorModeContextProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
