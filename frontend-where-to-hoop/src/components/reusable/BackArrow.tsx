import { Button } from "react-aria-components";
import { useNavigate } from "react-router-dom";
import { useColorModeValues } from "../../contexts/ColorModeContext";
import { IoArrowBackSharp } from "react-icons/io5";

const BackArrow = () => {
  const navigate = useNavigate();
  const colorModeContext = useColorModeValues();

  return (
    <Button
      onPress={() => navigate(-1)}
      className={`${colorModeContext} fixed z-1002 top-20 left-2 p-1 rounded-full bg-background background-hover border-2 border-label-component transition-colors shadow-md`}
      aria-label="Go back"
    > 
    {colorModeContext === "dark" ? 
        <IoArrowBackSharp size={26} color="white" /> : 
        <IoArrowBackSharp size={26} color="black" />}
    </Button>  
  );
}

export { BackArrow };