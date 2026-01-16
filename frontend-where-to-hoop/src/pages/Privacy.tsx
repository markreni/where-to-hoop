import { useColorModeValues } from "../contexts/DarkModeContext";
import type { ColorMode } from "../types/types";
import { BackArrow } from "../components/reusable/BackArrow";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const Privacy = () => {
  const colorModeContext: ColorMode = useColorModeValues();

  return (
    <div className={`${colorModeContext} padding-for-back-arrow min-h-screen flex flex-col`}>
      <BackArrow />
      <div className="flex-grow padding-x-for-page padding-b-for-page">
        <div className={`${colorModeContext} max-w-2xl mx-auto bg-background rounded-lg shadow-lg p-6 sm:p-8`}>
          <h1 className={`${colorModeContext} text-fluid-2xl poppins-bold background-text mb-4`}>
            Privacy & Data Policy
          </h1>

          <p className={`${colorModeContext} text-fluid-base background-text mb-8`}>
            We take your privacy seriously. This page explains what data we collect,
            how we use it, and the choices you have about your information.
          </p>

          <div className="flex flex-col gap-6">
            <section>
              <h2 className={`${colorModeContext} text-fluid-lg poppins-semibold background-text mb-2`}>
                What We Collect
              </h2>
              <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-400`}>
                When you add a basketball court, we collect the details you submit including
                photos, description, location coordinates, and court condition. We also store
                metadata such as the submission date. If you enable location services, we
                temporarily access your location to show nearby courts and calculate distances
                — this data is not stored on our servers.
              </p>
            </section>

            <section>
              <h2 className={`${colorModeContext} text-fluid-lg poppins-semibold background-text mb-2`}>
                How We Use Your Data
              </h2>
              <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-400`}>
                Court information you submit is visible to all users to help the community
                find places to play. We may use aggregated, anonymized data to improve
                the service and understand usage patterns. We do not sell your personal
                information to third parties.
              </p>
            </section>

            <section>
              <h2 className={`${colorModeContext} text-fluid-lg poppins-semibold background-text mb-2`}>
                Images & Licensing
              </h2>
              <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-400`}>
                By uploading photos of basketball courts, you confirm you have the right
                to share them. Images are displayed publicly on the site to help other
                users identify courts. If you need an image removed, contact us and we
                will handle your request promptly.
              </p>
            </section>

            <section>
              <h2 className={`${colorModeContext} text-fluid-lg poppins-semibold background-text mb-2`}>
                Location Data
              </h2>
              <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-400`}>
                WhereHoops uses your device location (with your permission) to show nearby
                courts and calculate distances. This location data is processed locally in
                your browser and is not stored on our servers. You can disable location
                access at any time through your browser settings.
              </p>
            </section>

            <section>
              <h2 className={`${colorModeContext} text-fluid-lg poppins-semibold background-text mb-2`}>
                Data Retention & Deletion
              </h2>
              <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-400`}>
                You can request deletion of any court data you've submitted by contacting us.
                Requests are processed within a reasonable timeframe. Some aggregated
                statistics may remain in anonymized form.
              </p>
            </section>

            <section className={`${colorModeContext} p-4 rounded-lg border border-gray-200 dark:border-gray-700`}>
              <h2 className={`${colorModeContext} text-fluid-lg poppins-semibold background-text mb-2`}>
                Contact
              </h2>
              <p className={`${colorModeContext} text-fluid-sm text-gray-600 dark:text-gray-400`}>
                For privacy requests or questions, please visit our{" "}
                <Link to="/contact" className="text-first-color hover:underline">Contact page</Link>{" "}
                or email us at <strong>contact@wherehoops.com</strong>.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
