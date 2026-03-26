import { Link } from "react-router-dom";
import { useMediaQuery } from 'usehooks-ts'
import { Logo } from "./reusable/Logo.tsx";
import { Button, Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components';
import { FiAlignJustify } from "react-icons/fi";
import { GiBasketballBasket } from "react-icons/gi";
import { MdLocationPin } from "react-icons/md";
import { DarkModeToggle } from "./reusable/DarkModeToggle.tsx";
import { LanguageToggle } from "./reusable/LanguageToggle.tsx";
import { useColorModeValues } from "../contexts/ColorModeContext.tsx";
import { useTranslation } from "../hooks/useTranslation.ts";
import type { ColorMode } from "../types/types.ts";
import breakpoints from "../assets/style.ts";
import useLocateUser from "../hooks/useLocateUser.ts";
import { IoMdPerson, IoMdPersonAdd, IoMdLogOut } from "react-icons/io";
import { useAuth } from "../contexts/AuthContext.tsx";


const NavBar = () => {
  const locateUser = useLocateUser();
  const sm = useMediaQuery(`(min-width: ${breakpoints.sm})`);
  const colorModeContext: ColorMode = useColorModeValues();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  
  return (
    <div className={`${colorModeContext} fixed z-402 left-0 right-0 top-0 bg-background p-4 shadow-md`}>
      {sm ? (
        <div className="nav-bar">
          <div className="flex-center gap-2">
            <Link to="/">
              <Logo/>
            </Link>
            <DarkModeToggle />
          </div>
          <div className="flex-center gap-6">
            <LanguageToggle />
            <div className="flex-center gap-4">
              <Link to="/hoops">
                <Button
                  className={`${colorModeContext} flex items-center gap-2 px-4 py-2 rounded-md bg-first-color main-color-hover first-color-text font-medium transition-colors tracking-normal`}
                  onClick={() => locateUser()}
                >
                  <MdLocationPin size={22}/>
                  {t('nav.showHoops')}
                </Button>
              </Link>
              {!user ? (
                <Link to="/signin">
                  <Button className={`${colorModeContext} hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-first-color text-first-color text-fluid-sm font-medium hover:bg-first-color hover:text-white dark:hover:text-black transition-colors`}>
                    <IoMdPerson size={18}/>
                    {t('nav.signIn')}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/myprofile">
                    <Button className={`${colorModeContext} hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-first-color hover:text-first-color/70 transition-colors`}>
                      <IoMdPerson size={18}/>
                      {t('nav.myAccount')}
                    </Button>
                  </Link>
                  <Button
                    className={`${colorModeContext} hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-first-color hover:text-first-color/70 transition-colors`}
                    onPress={() => signOut()}
                  >
                    <IoMdLogOut size={18}/>
                    {t('nav.signOut')}
                  </Button>
                </>
              )}
            </div>
            { /*
            <Link to="/signup" className={`${colorModeContext} hidden lg:block text-fluid-sm background-text hover:text-first-color transition-colors`}>
              {t('nav.signUp')}
            </Link>
            */
            }
            <MenuTrigger>
              <Button>
                <FiAlignJustify size={28} className="text-first-color dark:text-yellow-400"/>
              </Button>
              <Popover className="w-24/25 xsm:w-1/3 sm:w-1/4 xmd:1/5 pr-6">
                <Menu className={"bg-second-color text-white rounded-md shadow-lg p-2"}>
                  {!user ? (
                      <MenuItem className={`${colorModeContext} md:hidden mb-2 rounded-md background-hover-text-gray background-text-reverse-black`}>
                        <Link to="/signin" className="flex items-center gap-2">
                          <IoMdPerson size={22}/>
                          {t('nav.signIn')}
                        </Link>
                      </MenuItem>
                  ) : (
                    <>
                      <MenuItem className={`${colorModeContext} mb-2 md:hidden rounded-md background-hover-text-gray background-text-reverse-black`}>
                        <Link to="/myprofile" className="flex items-center gap-2">
                          <IoMdPerson size={22}/>
                          {t('nav.myAccount')}
                        </Link>
                      </MenuItem>
                      <MenuItem
                        className={`${colorModeContext} mb-2 md:mb-0 md:hidden rounded-md background-hover-text-gray background-text-reverse-black`}
                        onAction={() => signOut()}
                      >
                        <span className="flex items-center gap-2">
                          <IoMdLogOut size={22}/>
                          {t('nav.signOut')}
                        </span>
                      </MenuItem>
                    </>
                  )}
                  {user && (
                    <MenuItem className={`${colorModeContext} rounded-md background-hover-text-gray background-text-reverse-black`}>
                      <Link to="/addhoop" className="flex items-center gap-2">
                        <GiBasketballBasket size={22}/>
                        {t('nav.addHoop')}
                      </Link>
                    </MenuItem>
                  )}
                  {!user && (
                    <MenuItem className={`${colorModeContext} rounded-md background-hover-text-gray background-text-reverse-black`}>
                      <Link to="/signup" className="flex items-center gap-2">
                         <IoMdPersonAdd size={22}/>
                         {t('nav.signUp')}
                      </Link>
                    </MenuItem>
                  )}
                </Menu>
              </Popover>
            </MenuTrigger>
            {/*
            <Link to="/addhoop">
              <Button
                  className={`${colorModeContext} flex items-center gap-2 bg-third-color text-white font-medium px-4 py-2 rounded-md hover:bg-fourth-color transition-colors dark:text-black`}
              >
                <GiBasketballBasket size={22}/>
                {t('nav.addHoop')}
              </Button>
            </Link>
            */}
          </div>
        </div>
      ) : (
        <div className="nav-bar">
           <div className="flex-center gap-1">
            <Link to="/">
              <Logo/>
            </Link>
            <div className="flex-center gap-4">
              <DarkModeToggle />
              <div className="xsm:hidden">
                <LanguageToggle />
              </div>
            </div>
          </div>
          <div className="flex-center gap-5">
            <div className="hidden xsm:block">
              <LanguageToggle />
            </div>
            <MenuTrigger>
              <Button>
                <FiAlignJustify size={28} className="text-first-color dark:text-yellow-400"/>
              </Button>
              <Popover className="w-24/25 sm:w-full pr-6">
                <Menu className={"bg-second-color text-white rounded-md shadow-lg p-2"}>
                  <MenuItem className={`${colorModeContext} mb-2 rounded-md background-hover-text-gray background-text-reverse-black`}>
                    <Link to="/hoops" className="flex items-center gap-2">
                      <Button onClick={() => locateUser()}>
                        <MdLocationPin size={22}/>
                      </Button>
                      {t('nav.showHoops')}
                    </Link>
                  </MenuItem>
                  {!user ? (
                      <MenuItem className={`${colorModeContext} mb-2 rounded-md background-hover-text-gray background-text-reverse-black`}>
                        <Link to="/signin" className="flex items-center gap-2">
                          <IoMdPerson size={22}/>
                          {t('nav.signIn')}
                        </Link>
                      </MenuItem>
                  ) : (
                    <>
                      <MenuItem className={`${colorModeContext} mb-2 rounded-md background-hover-text-gray background-text-reverse-black`}>
                        <Link to="/myprofile" className="flex items-center gap-2">
                          <IoMdPerson size={22}/>
                          {t('nav.myAccount')}
                        </Link>
                      </MenuItem>
                      <MenuItem
                        className={`${colorModeContext} mb-2 rounded-md background-hover-text-gray background-text-reverse-black`}
                        onAction={() => signOut()}
                      >
                        <span className="flex items-center gap-2">
                          <IoMdLogOut size={22}/>
                          {t('nav.signOut')}
                        </span>
                      </MenuItem>
                    </>
                  )}
                  {user && (
                    <MenuItem className={`${colorModeContext} rounded-md background-hover-text-gray background-text-reverse-black`}>
                      <Link to="/addhoop" className="flex items-center gap-2">
                        <GiBasketballBasket size={22}/>
                        {t('nav.addHoop')}
                      </Link>
                    </MenuItem>
                  )}
                  {!user && (
                    <MenuItem className={`${colorModeContext} rounded-md background-hover-text-gray background-text-reverse-black`}>
                      <Link to="/signup" className="flex items-center gap-2">
                        <IoMdPersonAdd size={22}/>
                        {t('nav.signUp')}
                      </Link>
                    </MenuItem>
                  )}
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