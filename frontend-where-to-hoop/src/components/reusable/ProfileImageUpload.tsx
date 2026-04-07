import { useEffect, useRef, useState } from "react";
import { MdCameraAlt } from "react-icons/md";
import { ProfileCircle } from "./ProfileCircle";
import ProfileImageCropper from "./ProfileImageCropper";
import { uploadProfileImage, removeProfileImage } from "../../services/requests";
import { useToast } from "../../contexts/ToastContext";
import { useTranslation } from "../../hooks/useTranslation";
import { MAX_PROFILE_IMAGE_SIZE_BYTES, MAX_PROFILE_IMAGE_SIZE_MB } from "../../utils/constants";
import type { ProfileImage } from "../../types/types";
import { Button } from "react-aria-components";

interface ProfileImageUploadProps {
  imageUrl?: string;
  userName: string;
  userId: string;
  image: ProfileImage | null;
  onImageUpdated: () => void;
}

const ProfileImageUpload = ({ imageUrl, userName, userId, image, onImageUpdated }: ProfileImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState<string>("profile.jpg");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    return () => {
      if (cropSrc) URL.revokeObjectURL(cropSrc);
    };
  }, [cropSrc]);

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file: File | undefined = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-selecting the same file triggers onChange
    e.target.value = "";

    if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      error(t("profile.imageTooLarge", { size: String(MAX_PROFILE_IMAGE_SIZE_MB) }));
      return;
    }

    setCropFileName(file.name);
    setCropSrc(URL.createObjectURL(file));
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleCropSave = async (blob: Blob) => {
    setIsUploading(true);
    try {
      const baseName: string = cropFileName.replace(/\.[^.]+$/, "") || "profile";
      const croppedFile: File = new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
      await uploadProfileImage(userId, croppedFile, image);
      onImageUpdated();
      success(t("profile.uploadSuccess"));
      if (cropSrc) URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    } catch {
      error(t("profile.uploadError"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!image?.imagePath || isUploading) return;

    setIsUploading(true);
    try {
      await removeProfileImage(userId, image);
      onImageUpdated();
      success(t("profile.removeSuccess"));
    } catch {
      error(t("profile.removeError"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Button
        type="button"
        onClick={handleClick}
        className="relative cursor-pointer group"
        isDisabled={isUploading}
      >
        <ProfileCircle name={userName} imageUrl={imageUrl} size="xl" />

        {/* Camera overlay */}
        <div className={`absolute inset-0 rounded-full bg-black/40 flex items-center justify-center ${image ? 'opacity-0' : 'xsm:opacity-0'}  group-hover:opacity-100`}>
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <MdCameraAlt size={20} className="text-white" />
          )}
        </div>

        {/* Loading overlay (always visible when uploading) */}
        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </Button>

      {/* Remove button */}
      {imageUrl && !isUploading && (
        <Button
          type="button"
          onClick={handleRemove}
          className="absolute -bottom-0 -right-0 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-xs transition-colors"
          //title={t("profile.removeImage")}
        >
          ✕
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {cropSrc && (
        <ProfileImageCropper
          imageSrc={cropSrc}
          onCancel={handleCropCancel}
          onSave={handleCropSave}
          onError={() => error(t("profile.cropError"))}
          isSaving={isUploading}
        />
      )}
    </div>
  );
};

export default ProfileImageUpload;
