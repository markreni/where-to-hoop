import { Link } from "react-router-dom";
import { FaInfoCircle } from "react-icons/fa";

const InfoLink = ({ className, sectionId }: { className?: string, sectionId?: string }) => {
  return (
    <Link to={`/faq#${sectionId}`} className="inline-flex items-center gap-1">
      <FaInfoCircle className={`text-gray-400 cursor-pointer ${className}`} size={20} />
    </Link>
  );
};

export default InfoLink;
