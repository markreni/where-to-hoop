import { BackArrow } from "../components/reusable/BackArrow";


const Privacy = () => {
  return (
    <div className="p-4 mb-4 bg-light rounded-3">
        <h1 className="display-6 mb-2">Privacy & Data Policy</h1>
        <p className="lead text-muted">
          We take your privacy seriously. This page explains what data we
          collect, how we use it, and the choices you have about your
          information.
        </p>

        <h5>What we collect</h5>
        <p className="text-muted">
          When you create observations we collect the details you submit
          (photos, descriptions, location, date) and metadata such as the
          upload time. If you create an account we store your name and
          email to authenticate and manage your contributions.
        </p>
        <h5>How we use your data</h5>
        <p className="text-muted">
          Observations you mark as public are visible to other users and may
          be used to generate aggregated statistics. Private observations
          remain accessible only to you. We may use your email for account
          security, important notifications, or to contact you about
          moderation issues.
        </p>

        <h5>Images & licensing</h5>
        <p className="text-muted">
          By uploading images you confirm you have the right to share them.
          Images in public observations are displayed on the site and may
          be cached by third-party services (e.g., CDNs). If you need an
          image removed, contact us and we will handle requests promptly.
        </p>

        <h5>Data retention & deletion</h5>
        <p className="text-muted">
          You can request deletion of your account and data by contacting
          us. Requests are processed within a reasonable timeframe and we
          will remove personal information from public views. Some
          aggregated statistics may remain anonymized.
        </p>

        <h5>Contact</h5>
        <p className="text-muted">
          For privacy requests, please email us at <b>mark.renssi@aalto.fi</b>.
        </p>
    </div>
  );
};

export default Privacy;
