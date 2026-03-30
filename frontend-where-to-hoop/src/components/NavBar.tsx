import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useMediaQuery } from 'usehooks-ts'
import { Logo } from "./reusable/Logo.tsx";
import { Button, Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components';
import { FiAlignJustify } from "react-icons/fi";
import { SearchFilter } from "./reusable/SearchFilter.tsx";
import { GiBasketballBasket } from "react-icons/gi";
import { MdLocationPin, MdPersonSearch } from "react-icons/md";
import { DarkModeToggle } from "./reusable/DarkModeToggle.tsx";
import { LanguageToggle } from "./reusable/LanguageToggle.tsx";
import { useColorModeValues } from "../contexts/ColorModeContext.tsx";
import { useTranslation } from "../hooks/useTranslation.ts";
import type { ColorMode } from "../types/types.ts";
import breakpoints from "../assets/style.ts";
import useLocateUser from "../hooks/useLocateUser.ts";
import { IoMdPerson, IoMdPersonAdd, IoMdLogOut } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext.tsx";
import useIsAdmin from "../hooks/useIsAdmin.ts";
import { MdAdminPanelSettings } from "react-icons/md";


const NavBar = () => {
  const locateUser = useLocateUser();
  const sm = useMediaQuery(`(min-width: ${breakpoints.sm})`);
  const colorModeContext: ColorMode = useColorModeValues();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [playerSearch, setPlayerSearch] = useState('');

  const isOnPlayersPage = location.pathname === '/players';

  useEffect(() => {
    if (isOnPlayersPage) setPlayerSearch('');
  }, [isOnPlayersPage]);
  const navbarSearchValue = isOnPlayersPage ? (searchParams.get('q') ?? '') : playerSearch;

  const handleNavbarSearchChange = (value: string) => {
    if (isOnPlayersPage) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (value.trim()) {
          next.set('q', value);
        } else {
          next.delete('q');
        }
        return next;
      }, { replace: true });
    } else {
      setPlayerSearch(value);
    }
  };

  const handlePlayerSearchSubmit = (value: string) => {
    if (!isOnPlayersPage && value.trim()) {
      navigate(`/players?q=${encodeURIComponent(value.trim())}`)
      setPlayerSearch('')
    }
  }
  
  return (
    <div className={`${colorModeContext} fixed z-402 left-0 right-0 top-0 bg-background p-4 shadow-md`}>
      {sm ? (
        <div className="nav-bar">
          <div className="flex-center gap-2">
            <Link to="/">
              <Logo/>
            </Link>
            <DarkModeToggle />
            <LanguageToggle />
          </div>
          
          <div className="hidden xl:flex flex-1 mx-4">
            <SearchFilter
              placeholder={t('players.search')}
              value={navbarSearchValue}
              onChange={handleNavbarSearchChange}
              onSubmit={handlePlayerSearchSubmit}
            />
          </div>
          
          <div className="flex-center gap-4">
            <Link to="/players" className="xl:hidden">
              <Button className={`${colorModeContext} flex items-center gap-2 px-2.5 py-1 rounded-md border border-first-color text-first-color font-medium hover:bg-first-color hover:text-white dark:hover:text-black transition-colors tracking-normal`}>
                <FaUserCircle size={18}/>
                {t('nav.players')}
              </Button>
            </Link>
            <div className="flex-center gap-4 shrink-0">
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
                  <Button className={`${colorModeContext} hidden md:flex items-center gap-2 px-2 py-1 rounded-md border border-first-color text-first-color text-fluid-sm font-medium hover:bg-first-color hover:text-white dark:hover:text-black transition-colors`}>
                    <IoMdPerson size={18}/>
                    {t('nav.signIn')}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/myprofile">
                    <Button className={`${colorModeContext} hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-first-color hover:text-first-color/70 transition-colors`}>
                      <IoMdPerson size={18}/>
                      {t('nav.myAccount')}
                    </Button>
                  </Link>
                  <Button
                    className={`${colorModeContext} hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-first-color hover:text-first-color/70 transition-colors`}
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
                      <MenuItem className={`${colorModeContext} mb-2 rounded-md background-hover-text-gray background-text-reverse-black`}>
                        <Link to="/players#find-friend" className="flex items-center gap-2">
                          <MdPersonSearch size={22}/>
                          {t('nav.findFriend')}
                        </Link>
                      </MenuItem>
                      <MenuItem className={`${colorModeContext} mb-2 lg:hidden rounded-md background-hover-text-gray background-text-reverse-black`}>
                        <Link to="/myprofile" className="flex items-center gap-2">
                          <IoMdPerson size={22}/>
                          {t('nav.myAccount')}
                        </Link>
                      </MenuItem>
                      <MenuItem
                        className={`${colorModeContext} mb-2 lg:hidden rounded-md background-hover-text-gray background-text-reverse-black`}
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
                    <MenuItem className={`${colorModeContext} ${isAdmin && 'mb-2'} rounded-md background-hover-text-gray background-text-reverse-black`}>
                      <Link to="/addhoop" className="flex items-center gap-2">
                        <GiBasketballBasket size={22}/>
                        {t('nav.addHoop')}
                      </Link>
                    </MenuItem>
                  )}
                  {isAdmin && (
                    <MenuItem className={`${colorModeContext} rounded-md background-hover-text-gray background-text-reverse-black`}>
                      <Link to="/admin" className="flex items-center gap-2">
                        <MdAdminPanelSettings size={22}/>
                        Admin
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
                        <Link to="/players#find-friend" className="flex items-center gap-2">
                          <MdPersonSearch size={22}/>
                          {t('nav.findFriend')}
                        </Link>
                      </MenuItem>
                      <MenuItem className={`${colorModeContext} mb-2 rounded-md background-hover-text-gray background-text-reverse-black`}>
                        <Link to="/myprofile" className="flex items-center gap-2">
                          <IoMdPerson size={22}/>
                          {t('nav.myAccount')}
                        </Link>
                      </MenuItem>
                       <MenuItem className={`${colorModeContext} mb-2 rounded-md background-hover-text-gray background-text-reverse-black`}>
                        <Link to="/players" className="flex items-center gap-2">
                          <FaUserCircle size={22}/>
                          {t('nav.players')}
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
                    <MenuItem className={`${colorModeContext} ${isAdmin && 'mb-2'} rounded-md background-hover-text-gray background-text-reverse-black`}>
                      <Link to="/addhoop" className="flex items-center gap-2">
                        <GiBasketballBasket size={22}/>
                        {t('nav.addHoop')}
                      </Link>
                    </MenuItem>
                  )}
                  {isAdmin && (
                    <MenuItem className={`${colorModeContext} rounded-md background-hover-text-gray background-text-reverse-black`}>
                      <Link to="/admin" className="flex items-center gap-2">
                        <MdAdminPanelSettings size={22}/>
                        Admin
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