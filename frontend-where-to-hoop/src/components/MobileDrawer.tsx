import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoMdPerson, IoMdPersonAdd, IoMdLogOut, IoMdClose } from "react-icons/io";
import { MdLocationPin, MdPersonSearch, MdAdminPanelSettings } from "react-icons/md";
import { GiBasketballBasket } from "react-icons/gi";
import { FaUserCircle } from "react-icons/fa";
import { useTranslation } from "../hooks/useTranslation.ts";
import { useAuth } from "../contexts/AuthContext.tsx";
import useIsAdmin from "../hooks/useIsAdmin.ts";
import useLocateUser from "../hooks/useLocateUser.ts";
import { useColorModeValues } from "../contexts/ColorModeContext.tsx";
import type { ColorMode } from "../types/types.ts";
import { DrawerItem } from "./reusable/DrawerItem.tsx";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileDrawer = ({ isOpen, onClose }: MobileDrawerProps) => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const locateUser = useLocateUser();
  const location = useLocation();
  const colorModeContext: ColorMode = useColorModeValues();

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const nickname = user?.user_metadata?.nickname ?? user?.email ?? "";
  const email = user?.email ?? "";
  const initials = nickname
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = () => {
    signOut();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-500 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed top-0 right-0 z-501 h-full w-4/5 max-w-xs bg-background shadow-xl animate-slide-in-right flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className={`${colorModeContext} absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
        >
          <IoMdClose size={24} />
        </button>

        {/* User section */}
        {user && (
          <div className={`${colorModeContext} px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className={`${colorModeContext} font-semibold text-sm background-text-black truncate`}>
                  {nickname}
                </p>
                <p className={`${colorModeContext} text-xs text-gray-500 dark:text-gray-400 truncate`}>
                  {email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Menu sections */}
        <nav className={`${!user && "mt-8"} flex-1 overflow-y-auto px-4 py-4`}>
          {/* EXPLORE */}
          <p className="text-xs font-semibold text-first-color uppercase tracking-wider px-2 mb-2">
            {t("nav.drawer.explore")}
          </p>
          <DrawerItem
            to="/hoops"
            icon={<MdLocationPin size={22} />}
            label={t("nav.showHoops")}
            onClick={() => locateUser()}
          />
          {user && (
            <DrawerItem
              to="/addhoop"
              icon={<GiBasketballBasket size={22} />}
              label={t("nav.addHoop")}
            />
          )}

          {/* COMMUNITY */}
          <p className="text-xs font-semibold text-first-color uppercase tracking-wider px-2 mt-5 mb-2">
            {t("nav.drawer.community")}
          </p>
          <DrawerItem
            to="/players"
            icon={<FaUserCircle size={22} />}
            label={t("nav.players")}
          />
          {user && (
            <DrawerItem
              to="/search-players"
              icon={<MdPersonSearch size={22} />}
              label={t("nav.findFriend")}
            />
          )}

          {/* ACCOUNT (only when logged in) */}
          {user && (
            <>
              <p className="text-xs font-semibold text-first-color uppercase tracking-wider px-2 mt-5 mb-2">
                {t("nav.drawer.account")}
              </p>
              <DrawerItem
                to="/myprofile"
                icon={<IoMdPerson size={22} />}
                label={t("nav.myAccount")}
              />
              {isAdmin && (
                <DrawerItem
                  to="/admin"
                  icon={<MdAdminPanelSettings size={22} />}
                  label={t("nav.drawer.admin")}
                />
              )}
            </>
          )}
        </nav>

        {/* Bottom action */}
        {user ? (
          <div className={`${colorModeContext} px-4 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700`}>
            <button
              onClick={handleSignOut}
              className={`${colorModeContext} flex items-center gap-3 w-full px-3 py-3 rounded-lg text-first-color font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800`}
            >
              <IoMdLogOut size={22} />
              {t("nav.signOut")}
            </button>
          </div>
        ) : (
          <div className={`${colorModeContext} px-4 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-2`}>
            <Link to="/signin" className="w-full">
              <button className={`${colorModeContext} w-full flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-first-color hover:bg-second-color text-white dark:text-black font-medium transition-colors`}>
                <IoMdPerson size={22} />
                {t("nav.signIn")}
              </button>
            </Link>
            <Link to="/signup" className="w-full">
              <button className={`${colorModeContext} w-full flex items-center justify-center gap-2 px-3 py-3 rounded-lg border border-first-color text-first-color font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800`}>
                <IoMdPersonAdd size={22} />
                {t("nav.signUp")}
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileDrawer;
