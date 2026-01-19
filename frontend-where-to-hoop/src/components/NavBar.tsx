import { Link } from "react-router-dom";
import { useMediaQuery } from 'usehooks-ts'
import { Logo } from "./reusable/Logo.tsx";
import { Button, Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components';
import { FiAlignJustify } from "react-icons/fi";
import { GiBasketballBasket } from "react-icons/gi";
import { MdLocationPin } from "react-icons/md";
import { ColorModeToggle } from "./reusable/colormodeToggle.tsx";
import { LanguageToggle } from "./reusable/LanguageToggle.tsx";
import { useColorModeValues } from "../contexts/DarkModeContext.tsx";
import { useTranslation } from "../hooks/useTranslation.ts";
import type { ColorMode } from "../types/types.ts";
import breakpoints from "../assets/style.ts";
import useLocateUser from "../hooks/useLocateUser.ts";


const NavBar = () => {
  const locateUser = useLocateUser();
  const sm = useMediaQuery(`(min-width: ${breakpoints.sm})`);
  const colorModeContext: ColorMode = useColorModeValues();
  const { t } = useTranslation();
  
  return (
    <div className={`${colorModeContext} fixed z-402 left-0 right-0 top-0 bg-background p-4 shadow-md`}>
      {sm ? (
        <div className="nav-bar">
          <div className="flex-center gap-2">
            <Link to="/">
              <Logo/>
            </Link>
            <ColorModeToggle />
          </div>
          <div className="flex-center gap-4">
            <LanguageToggle />
            <Link to="/hoops">
              <Button
                className={`${colorModeContext} flex items-center gap-2 px-4 py-2 rounded-md bg-first-color main-color-hover first-color-text font-medium transition-colors`}
                onClick={() => locateUser()}
              >
                <MdLocationPin size={22}/>
                {t('nav.showHoops')}
              </Button>
            </Link>
            <Link to="/addhoop">
              <Button
                  className={`${colorModeContext} flex items-center gap-2 bg-third-color text-white font-medium px-4 py-2 rounded-md hover:bg-fourth-color transition-colors dark:text-black`}
              >
                <GiBasketballBasket size={22}/>
                {t('nav.addHoop')}
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="nav-bar">
           <div className="flex-center gap-1">
            <Link to="/">
              <Logo/>
            </Link>
            <div className="flex-center gap-3">
              <ToggleBasketball />
              <LanguageToggle />
            </div>
          </div>
          <div className="flex-center gap-2">
            <MenuTrigger>
              <Button>
                <FiAlignJustify size={28} className="text-first-color dark:text-yellow-400"/>
              </Button>
              <Popover className="w-24/25 sm:w-full pr-6">
                <Menu className={"bg-second-color text-white rounded-md shadow-lg p-2"}>
                  <MenuItem className={`${colorModeContext} mb-2 rounded-md hover:text-black dark:text-black dark:hover:text-yellow-400`}>
                    <Link to="/hoops" className="flex items-center gap-2">
                      <Button onClick={() => locateUser()}>
                        <MdLocationPin size={22}/>
                      </Button>
                      {t('nav.showHoops')}
                    </Link>
                  </MenuItem>
                  <MenuItem className={`${colorModeContext} rounded-md hover:text-black dark:text-black dark:hover:text-yellow-400`}>
                    <Link to="/addhoop" className="flex items-center gap-2">
                      <GiBasketballBasket size={22}/>
                      {t('nav.addHoop')}
                    </Link>
                  </MenuItem>
                </Menu>
              </Popover>
            </MenuTrigger>
          </div>
        </div>
      )}
    </div>
  );
}

export default NavBar;