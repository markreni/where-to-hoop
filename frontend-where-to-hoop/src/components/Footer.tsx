import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import { useTranslation } from "../hooks/useTranslation";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="pt-10 pb-4 flex flex-col items-center gap-4 text-fluid-sm text-gray-600 dark:text-gray-400">
      <nav className="flex items-center gap-2">
        <Link to="/about" className="hover:text-third-color transition-colors">{t('footer.about')}</Link>
        <span>·</span>
        <Link to="/privacy" className="hover:text-third-color transition-colors">{t('footer.privacy')}</Link>
        <span>·</span>
        <Link to="/contact" className="hover:text-third-color transition-colors">{t('footer.contact')}</Link>
        <span>·</span>
        <Link to="/faq" className="hover:text-third-color transition-colors">{t('footer.faq')}</Link>
        <span>·</span>
        {
        /* GitHub Link 
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-third-color transition-colors"
          aria-label="GitHub"
        >
          <FaGithub size={18} />
        </a>
        */}
      </nav>
      <p>&copy; 2026 {t('footer.copyright')}</p>
    </footer>
  );
};

export default Footer;
