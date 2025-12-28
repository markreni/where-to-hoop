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
      className={`${colorModeContext} fixed top-20 left-2 rounded-full p-2 hover:bg-gray-800/10 transition-colors dark:hover:bg-gray-100/10`}
      aria-label="Go back"
    > 
    {colorModeContext === "dark" ? 
        <IoArrowBackSharp size={26} color="black" /> : 
        <IoArrowBackSharp size={26} color="white" />}
    </Button>  
  );
}

export { BackArrow };