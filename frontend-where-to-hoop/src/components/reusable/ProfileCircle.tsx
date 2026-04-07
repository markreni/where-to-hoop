import { useEffect, useState } from "react";
import { Button, Dialog, Modal, ModalOverlay } from "react-aria-components";
import { MdClose } from "react-icons/md";
import { useTranslation } from "../../hooks/useTranslation";

interface ProfileCircleProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  expandable?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl',
} as const;

const ProfileCircle = ({ name, imageUrl, size = 'md', expandable = false }: ProfileCircleProps) => {
  const [imgError, setImgError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const baseClasses = `${sizeClasses[size]} rounded-full shrink-0`;

  if (imageUrl && !imgError) {
    // Only image-backed circles are expandable — initials have nothing to enlarge.
    if (expandable) {
      return (
        <>
          <Button
            type="button"
            onPress={() => setIsOpen(true)}
            aria-label={t("profile.viewPhotoDialogLabel")}
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-first-color cursor-zoom-in"
          >
            <img
              src={imageUrl}
              alt={name}
              className={`${baseClasses} object-cover`}
              onError={() => setImgError(true)}
            />
          </Button>
          <ModalOverlay
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            isDismissable
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          >
            <Modal className="outline-none">
              <Dialog
                aria-label={t("profile.viewPhotoDialogLabel")}
                className="relative outline-none flex items-center justify-center"
              >
                <img
                  src={imageUrl}
                  alt={name}
                  className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                />
                <Button
                  type="button"
                  onPress={() => setIsOpen(false)}
                  aria-label={t("profile.closePhoto")}
                  className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 outline-none focus-visible:ring-2 focus-visible:ring-first-color"
                >
                  <MdClose size={24} />
                </Button>
              </Dialog>
            </Modal>
          </ModalOverlay>
        </>
      );
    }

    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${baseClasses} object-cover`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${baseClasses} bg-blue-600 flex items-center justify-center text-white font-semibold`}>
      {initials}
    </div>
  );
};

export { ProfileCircle };
