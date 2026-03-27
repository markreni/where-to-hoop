import { useState } from "react";
import { Label, TextField, Button } from "react-aria-components";
import { useNavigate, Link } from "react-router-dom";
import { useColorModeValues } from "../contexts/ColorModeContext";
import { useToast } from "../contexts/ToastContext";
import { BackArrow } from "../components/reusable/BackArrow";
import Footer from "../components/Footer";
import type { ColorMode } from "../types/types";
import { signIn } from "../utils/requests";
import { useTranslation } from "../hooks/useTranslation";

const SignIn = () => {
  const colorModeContext: ColorMode = useColorModeValues();
  const { success, error } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = email.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
      success(t('signIn.welcomeBack'));
      navigate("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('signIn.failed');
      error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col`}>
      <BackArrow />
      <div className="flex-grow padding-x-for-page padding-b-for-page flex items-center justify-center">
        <div className={`${colorModeContext} w-full max-w-md bg-background rounded-lg shadow-xl p-6 sm:p-8`}>
          <h1 className={`${colorModeContext} text-fluid-2xl poppins-semibold background-text mb-6`}>
            {t('signIn.title')}
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <TextField isRequired className="flex flex-col gap-1">
              <Label className={`${colorModeContext} text-fluid-sm background-text`}>
                {t('signIn.emailLabel')} *
              </Label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${colorModeContext} form-input bg-background`}
                placeholder={t('signIn.emailPlaceholder')}
                autoComplete="email"
              />
            </TextField>

            {/* Password */}
            <TextField isRequired className="flex flex-col gap-1">
              <Label className={`${colorModeContext} text-fluid-sm background-text`}>
                {t('signIn.passwordLabel')} *
              </Label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${colorModeContext} form-input bg-background`}
                placeholder={t('signIn.passwordPlaceholder')}
                autoComplete="current-password"
              />
            </TextField>

            <Button
              type="submit"
              isDisabled={!isFormValid || isSubmitting}
              className={`${colorModeContext} mt-2 px-4 py-2 rounded-lg bg-first-color first-color-text text-base font-medium main-color-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? t('signIn.submitting') : t('signIn.submit')}
            </Button>
          </form>

          <p className={`${colorModeContext} text-fluid-sm background-text mt-6 text-center`}>
            {t('signIn.noAccount')}{" "}
            <Link to="/signup" className="text-first-color hover:underline">
              {t('signIn.signUp')}
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignIn;
