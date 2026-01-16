import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="pt-10 pb-4 flex flex-col items-center gap-4 text-fluid-sm text-gray-600 dark:text-gray-400">
      <nav className="flex items-center gap-2">
        <Link to="/about" className="hover:text-first-color transition-colors">About</Link>
        <span>·</span>
        <Link to="/privacy" className="hover:text-first-color transition-colors">Privacy</Link>
        <span>·</span>
        <Link to="/contact" className="hover:text-first-color transition-colors">Contact</Link>
        <span>·</span>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-first-color transition-colors"
          aria-label="GitHub"
        >
          <FaGithub size={18} />
        </a>
      </nav>
      <p>&copy; 2026 WhereHoops. All rights reserved.</p>
    </footer>
  );
};

export default Footer;