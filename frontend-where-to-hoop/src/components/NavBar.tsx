import { Link } from "react-router-dom";
import { FiAlignJustify } from "react-icons/fi";
import { IoBasketballOutline } from "react-icons/io5";
import { MdLocationPin } from "react-icons/md";
import { useMediaQuery } from 'usehooks-ts'
import Logo from "./Logo.tsx";
import {Button, Menu, MenuItem, MenuTrigger, Popover} from 'react-aria-components';


const NavBar = () => {
  const sm = useMediaQuery('(min-width: 640px)');

  return (
    <div className="top-0 bg-white p-4 shadow-md">
      {sm ? (
        <div className="nav-bar">
          <div>
            <Logo/>
          </div>
          <div className="flex items-center justify-between gap-4">
            <Link to="/hoops"> 
              <Button 
                  className="flex items-center gap-2 bg-second-color text-white px-4 py-2 rounded-md hover:bg-first-color transition-colors"
                >
                  <MdLocationPin size={20}/>
                  Show Hoops
                </Button>
            </Link>
            <Link to="/addhoop"> 
              <Button 
                  className="flex items-center gap-2 bg-third-color text-white px-4 py-2 rounded-md hover:bg-fourth-color transition-colors"
                >
                  <IoBasketballOutline size={20}/>
                  Add Hoop
                </Button>
            </Link>
            </div>
        </div>
        ) : (
        <div className="nav-bar">
          <Logo/>
          <MenuTrigger>
            <Button>
              <FiAlignJustify size={28} className="text-first-color"/>
            </Button>
            <Popover className="w-full pr-6">
              <Menu className="bg-second-color text-white rounded-md shadow-lg p-2">
                <MenuItem className="mb-2">
                  <Link to="/hoops" className="flex items-center gap-2">
                    <MdLocationPin size={20}/>
                    Show Hoops
                  </Link>
                </MenuItem>
                <MenuItem>  
                   <Link to="/addhoop" className="flex items-center gap-2">
                    <IoBasketballOutline size={20}/>
                    Add Hoop
                  </Link>
                </MenuItem>
              </Menu>
            </Popover>
          </MenuTrigger>
        </div>
      )}
    </div>
  );
}

export default NavBar;