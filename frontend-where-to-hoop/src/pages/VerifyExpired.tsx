import { useState } from "react";
import { Label, TextField, Button } from "react-aria-components";
import { Link } from "react-router-dom";
import { useColorModeValues } from "../contexts/ColorModeContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { BackArrow } from "../components/reusable/BackArrow";
import { AlreadySignedInCard } from "../components/reusable/AlreadySignedInCard";
import Footer from "../components/Footer";
import type { ColorMode } from "../types/types";
import { resendVerification } from "../services/requests";
import { useTranslation } from "../hooks/useTranslation";

const VerifyExpired = () => {
  const colorModeContext: ColorMode = useColorModeValues();
  const { user } = useAuth();
  const { success, error } = useToast();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const isValidEmail: boolean = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFormValid = isValidEmail;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      await resendVerification(email.trim());
      success(t('verifyExpired.resendSuccess'));
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('verifyExpired.resendFailed');
      error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col`}>
      <BackArrow />
      <div className="flex-grow padding-x-for-page padding-b-for-page flex items-center justify-center">
        {user ? (
          <AlreadySignedInCard titleKey="signIn.alreadySignedIn" linkKey="signIn.goToProfile" />
        ) : (
          <div className={`${colorModeContext} w-full max-w-md bg-background rounded-lg shadow-xl p-6 sm:p-8`}>
            <h1 className={`${colorModeContext} text-fluid-2xl poppins-semibold background-text mb-4`}>
              {t('verifyExpired.title')}
            </h1>
            <p className={`${colorModeContext} text-fluid-sm background-text mb-6`}>
              {t('verifyExpired.message')}
            </p>

            {sent ? (
              <p className={`${colorModeContext} text-fluid-sm background-text mb-6`}>
                {t('verifyExpired.checkEmail')}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <TextField isRequired className="flex flex-col gap-1">
                  <Label className={`${colorModeContext} text-fluid-sm background-text`}>
                    {t('verifyExpired.emailLabel')} *
                  </Label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${colorModeContext} form-input bg-background`}
                    placeholder={t('verifyExpired.emailPlaceholder')}
                    autoComplete="email"
                  />
                  <p className={`${colorModeContext} text-fluid-xs background-text opacity-75 mt-1`}>
                    {t('verifyExpired.emailHint')}
                  </p>
                </TextField>

                <Button
                  type="submit"
                  isDisabled={!isFormValid || isSubmitting}
                  className={`${colorModeContext} mt-2 px-4 py-2 rounded-lg bg-first-color first-color-text text-base font-medium main-color-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? t('verifyExpired.submitting') : t('verifyExpired.submit')}
                </Button>
              </form>
            )}

            <p className={`${colorModeContext} text-fluid-sm background-text mt-6 text-center`}>
              {t('verifyExpired.alreadyVerifiedPrompt')}{" "}
              <Link to="/signin" className="text-first-color hover:underline">
                {t('verifyExpired.signInLink')}
              </Link>
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default VerifyExpired;
