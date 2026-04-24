import { Link } from "react-router-dom";
import { useColorModeValues } from "../../contexts/ColorModeContext";
import { useTranslation } from "../../hooks/useTranslation";

type Props = {
  titleKey: string;
  linkKey: string;
  linkTo?: string;
};

const AlreadySignedInCard = ({ titleKey, linkKey, linkTo = "/myprofile" }: Props) => {
  const colorModeContext = useColorModeValues();
  const { t } = useTranslation();

  return (
    <div className={`${colorModeContext} w-full max-w-md bg-background rounded-lg shadow-xl p-6 sm:p-8 text-center`}>
      <h1 className={`${colorModeContext} text-fluid-2xl poppins-semibold background-text mb-4`}>
        {t(titleKey)}
      </h1>
      <Link
        to={linkTo}
        className={`${colorModeContext} inline-block px-4 py-2 rounded-lg bg-first-color first-color-text text-base font-medium main-color-hover transition-colors`}
      >
        {t(linkKey)}
      </Link>
    </div>
  );
};

export { AlreadySignedInCard };
