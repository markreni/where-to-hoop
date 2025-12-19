import { Link } from "react-router-dom";
import { useMediaQuery } from 'usehooks-ts'
import { Logo } from "./reusable/Logo.tsx";
import { Button, Menu, MenuItem, MenuTrigger, Popover, ToggleButton } from 'react-aria-components';
import { FiAlignJustify } from "react-icons/fi";
import { IoBasketballOutline } from "react-icons/io5";
import { MdLocationPin } from "react-icons/md";
import { useEffect, useState } from "react";
import { ToggleBasketball } from "./reusable/ToggleBasketball.tsx";


const NavBar = () => {
  const sm = useMediaQuery('(min-width: 640px)');
  const [isDark, setIsDark] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="fixed z-401 left-0 right-0 top-0 bg-white dark:bg-black p-4 shadow-md">
      {sm ? (
        <div className="nav-bar">
          <div className="flex-center gap-4">
            <Link to="/"> 
              <Logo/>
            </Link>
            <ToggleBasketball isSelected={isDark} toggleFunction={setIsDark} />
          </div>
          <div className="flex-center gap-4">
            <Link to="/hoops"> 
              <Button 
                  className="flex items-center gap-2 bg-second-color text-white dark:bg-black px-4 py-2 rounded-md hover:bg-first-color transition-colors"
              >
                <MdLocationPin size={20}/>
                Show Hoops
              </Button>
            </Link>
            <Link to="/addhoop">
              <Button 
                  className="flex items-center gap-2 bg-third-color text-white dark:bg-black px-4 py-2 rounded-md hover:bg-fourth-color transition-colors"
              >
                <IoBasketballOutline size={20}/>
                Add Hoop
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="nav-bar">
           <div className="flex-center gap-4">
            <Link to="/"> 
              <Logo/>
            </Link>
            <ToggleBasketball isSelected={isDark} toggleFunction={setIsDark} />
          </div>
          <div className="flex-center gap-2">
            <MenuTrigger>
              <Button>
                <FiAlignJustify size={28} className="text-first-color dark:text-yellow-400"/>
              </Button>
              <Popover className="w-full pr-6">
                <Menu className="bg-second-color text-white rounded-md shadow-lg p-2 dark:bg-gray-800">
                  <MenuItem className="mb-2 rounded-md hover:text-black dark:hover:text-yellow-400">
                    <Link to="/hoops" className="flex items-center gap-2">
                      <MdLocationPin size={20}/>
                      Show Hoops
                    </Link>
                  </MenuItem>
                  <MenuItem className="rounded-md hover:text-black dark:hover:text-yellow-400">  
                    <Link to="/addhoop" className="flex items-center gap-2">
                      <IoBasketballOutline size={20}/>
                      Add Hoop
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