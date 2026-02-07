import { Link } from "react-router-dom";
import { FaInfoCircle } from "react-icons/fa";

const InfoLink = ({ className }: { className?: string }) => {
  return (
    <Link to="/faq">
      <FaInfoCircle className={`text-gray-400 cursor-pointer ${className}`} size={20} />
    </Link>
  );
};

export default InfoLink;
