import { useState } from "react";
import { Label, TextField, Button } from "react-aria-components";
import { useNavigate, Link } from "react-router-dom";
import { useColorModeValues } from "../contexts/ColorModeContext";
import { useToast } from "../contexts/ToastContext";
import { BackArrow } from "../components/reusable/BackArrow";
import Footer from "../components/Footer";
import type { ColorMode } from "../types/types";
import { signUp } from "../utils/requests";
import { useTranslation } from "../hooks/useTranslation";

const SignUp = () => {
  const colorModeContext: ColorMode = useColorModeValues();
  const { success, error } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordsMatch = password === confirmPassword;
  const isFormValid =
    email.trim().length > 0 &&
    nickname.trim().length > 0 &&
    password.length >= 6 &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      await signUp(email.trim(), password, nickname.trim(), isPublic);
      success(t('signUp.accountCreated'));
      navigate("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('signUp.failed');
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
            {t('signUp.title')}
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <TextField isRequired className="flex flex-col gap-1">
              <Label className={`${colorModeContext} text-fluid-sm background-text`}>
                {t('signUp.emailLabel')} *
              </Label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${colorModeContext} form-input bg-background`}
                placeholder={t('signUp.emailPlaceholder')}
                autoComplete="email"
              />
            </TextField>

            {/* Nickname */}
            <TextField isRequired className="flex flex-col gap-1">
              <Label className={`${colorModeContext} text-fluid-sm background-text`}>
                {t('signUp.nicknameLabel')} *
              </Label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className={`${colorModeContext} form-input bg-background`}
                placeholder={t('signUp.nicknamePlaceholder')}
                autoComplete="username"
                maxLength={30}
              />
            </TextField>

            {/* Password */}
            <TextField isRequired className="flex flex-col gap-1">
              <Label className={`${colorModeContext} text-fluid-sm background-text`}>
                {t('signUp.passwordLabel')} *
              </Label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${colorModeContext} form-input bg-background`}
                placeholder={t('signUp.passwordPlaceholder')}
                autoComplete="new-password"
              />
            </TextField>

            {/* Confirm Password */}
            <TextField isRequired className="flex flex-col gap-1">
              <Label className={`${colorModeContext} text-fluid-sm background-text`}>
                {t('signUp.confirmPasswordLabel')} *
              </Label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${colorModeContext} form-input bg-background ${
                  confirmPassword.length > 0 && !passwordsMatch
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder={t('signUp.confirmPasswordPlaceholder')}
                autoComplete="new-password"
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-red-500 text-fluid-xs">{t('signUp.passwordMismatch')}</p>
              )}
            </TextField>

            {/* Public/Private profile toggle */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <div className="flex flex-col gap-0.5">
                  <span className={`${colorModeContext} text-fluid-sm font-medium background-text`}>
                    {t('signUp.publicProfile')}
                  </span>
                  <span className={`${colorModeContext} text-fluid-xs text-gray-400 dark:text-gray-500`}>
                    {t('signUp.publicProfileHint')}
                  </span>
                </div>
                <div
                  onClick={() => setIsPublic(p => !p)}
                  className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-200 ${isPublic ? 'bg-first-color' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isPublic ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </label>
              <p className={`text-fluid-xs font-medium ${isPublic ? 'text-first-color' : 'text-gray-400 dark:text-gray-500'}`}>
                {isPublic ? t('signUp.statusPublic') : t('signUp.statusPrivate')}
              </p>
            </div>

            <Button
              type="submit"
              isDisabled={!isFormValid || isSubmitting}
              className={`${colorModeContext} mt-2 px-4 py-2 rounded-lg bg-first-color first-color-text text-base font-medium main-color-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? t('signUp.submitting') : t('signUp.submit')}
            </Button>
          </form>

          <p className={`${colorModeContext} text-fluid-sm background-text mt-6 text-center`}>
            {t('signUp.alreadyHaveAccount')}{" "}
            <Link to="/signin" className="text-first-color hover:underline">
              {t('signUp.signIn')}
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignUp;
