import { Button } from "react-aria-components";
import { useNavigate } from "react-router-dom";
import { useColorModeValues } from "../../contexts/DarkModeContext";
import { IoArrowBackSharp } from "react-icons/io5";

const BackArrow = () => {
  const navigate = useNavigate();
  const colorModeContext = useColorModeValues();

  return (
    <Button
      onPress={() => navigate(-1)}
      className={`${colorModeContext} fixed z-1002 top-20 left-2 rounded-full bg-background p-1 border-1 border-black hover:bg-gray-200 transition-colors dark:border-white dark:hover:bg-gray-700 `}
      aria-label="Go back"
    > 
    {colorModeContext === "dark" ? 
        <IoArrowBackSharp size={26} color="white" /> : 
        <IoArrowBackSharp size={26} color="black" />}
    </Button>  
  );
}

export { BackArrow };