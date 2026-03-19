import { useState } from "react";
import { Label, TextField, Button } from "react-aria-components";
import { useNavigate, Link } from "react-router-dom";
import { useColorModeValues } from "../contexts/ColorModeContext";
import { useToast } from "../contexts/ToastContext";
import { BackArrow } from "../components/reusable/BackArrow";
import Footer from "../components/Footer";
import type { ColorMode } from "../types/types";
import { signUp } from "../utils/requests";

const SignUp = () => {
  const colorModeContext: ColorMode = useColorModeValues();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      await signUp(email.trim(), password, nickname.trim());
      success("Account created! Check your email to confirm your account.");
      navigate("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign up failed.";
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
            Sign up
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <TextField isRequired className="flex flex-col gap-1">
              <Label className={`${colorModeContext} text-fluid-sm background-text`}>
                Email *
              </Label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${colorModeContext} form-input bg-background`}
                placeholder="your@email.com"
                autoComplete="email"
              />
            </TextField>

            {/* Nickname */}
            <TextField isRequired className="flex flex-col gap-1">
              <Label className={`${colorModeContext} text-fluid-sm background-text`}>
                Nickname *
              </Label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className={`${colorModeContext} form-input bg-background`}
                placeholder="How others will see you"
                autoComplete="username"
                maxLength={30}
              />
            </TextField>

            {/* Password */}
            <TextField isRequired className="flex flex-col gap-1">
              <Label className={`${colorModeContext} text-fluid-sm background-text`}>
                Password *
              </Label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${colorModeContext} form-input bg-background`}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </TextField>

            {/* Confirm Password */}
            <TextField isRequired className="flex flex-col gap-1">
              <Label className={`${colorModeContext} text-fluid-sm background-text`}>
                Confirm password *
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
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-red-500 text-fluid-xs">Passwords do not match</p>
              )}
            </TextField>

            <Button
              type="submit"
              isDisabled={!isFormValid || isSubmitting}
              className={`${colorModeContext} mt-2 px-4 py-2 rounded-lg bg-first-color first-color-text text-base font-medium main-color-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className={`${colorModeContext} text-fluid-sm background-text mt-6 text-center`}>
            Already have an account?{" "}
            <Link to="/signin" className="text-first-color hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignUp;
