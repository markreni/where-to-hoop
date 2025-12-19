import { Link } from "react-router-dom";
import { useMediaQuery } from 'usehooks-ts'
import { Logo } from "./reusable/Logo.tsx";
import { Button, Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components';
import { FiAlignJustify } from "react-icons/fi";
import { GiBasketballBasket } from "react-icons/gi";
import { MdLocationPin } from "react-icons/md";
import { ToggleBasketball } from "./reusable/ToggleBasketball.tsx";
import { useColorModeValues } from "../contexts/DarkModeContext.tsx";
import type { ColorMode } from "../types/types.ts";


const NavBar = () => {
  const sm = useMediaQuery('(min-width: 640px)');
  const colorModeContext: ColorMode = useColorModeValues();

  return (
    <div className={`${colorModeContext} fixed z-401 left-0 right-0 top-0 bg-white p-4 shadow-md dark:bg-black`}>
      {sm ? (
        <div className="nav-bar">
          <div className="flex-center gap-1">
            <Link to="/"> 
              <Logo/>
            </Link>
            <ToggleBasketball />
          </div>
          <div className="flex-center gap-4">
            <Link to="/hoops"> 
              <Button 
                  className={`${colorModeContext} flex items-center gap-2 bg-second-color text-white px-4 py-2 rounded-md hover:bg-first-color transition-colors dark:text-black`}
              >
                <MdLocationPin size={20}/>
                Show Hoops
              </Button>
            </Link>
            <Link to="/addhoop">
              <Button 
                  className={`${colorModeContext} flex items-center gap-2 bg-third-color text-white px-4 py-2 rounded-md hover:bg-fourth-color transition-colors dark:text-black`}
              >
                <GiBasketballBasket size={20}/>
                Add Hoop
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
            <ToggleBasketball />
          </div>
          <div className="flex-center gap-2">
            <MenuTrigger>
              <Button>
                <FiAlignJustify size={28} className="text-first-color dark:text-yellow-400"/>
              </Button>
              <Popover className="w-full pr-6">
                <Menu className={"bg-second-color text-white rounded-md shadow-lg p-2"}>
                  <MenuItem className={`${colorModeContext} mb-2 rounded-md hover:text-black dark:text-black dark:hover:text-yellow-400`}>
                    <Link to="/hoops" className="flex items-center gap-2">
                      <MdLocationPin size={20}/>
                      Show Hoops
                    </Link>
                  </MenuItem>
                  <MenuItem className={`${colorModeContext} rounded-md hover:text-black dark:text-black dark:hover:text-yellow-400`}>  
                    <Link to="/addhoop" className="flex items-center gap-2">
                      <GiBasketballBasket size={20}/>
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