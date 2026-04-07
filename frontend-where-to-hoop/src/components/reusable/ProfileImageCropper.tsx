import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "react-aria-components";
import { useTranslation } from "../../hooks/useTranslation";

interface ProfileImageCropperProps {
  imageSrc: string;
  onCancel: () => void;
  onSave: (blob: Blob) => void;
  onError?: (err: unknown) => void;
  isSaving?: boolean;
}

const OUTPUT_SIZE = 512;

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image: HTMLImageElement = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.crossOrigin = "anonymous";
    image.src = url;
  });

const getCroppedBlob = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
  const image: HTMLImageElement = await createImage(imageSrc);
  const canvas: HTMLCanvasElement = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  // Interpolate pixels when scaling instead of nearest-neighbor (avoids jagged edges)
  ctx.imageSmoothingEnabled = true;
  // Use the browser's best resampling algorithm — slower but cleaner up/downscaling
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas is empty"));
      },
      "image/jpeg",
      0.9
    );
  });
};

const ProfileImageCropper = ({ imageSrc, onCancel, onSave, onError, isSaving }: ProfileImageCropperProps) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      const blob: Blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
      onSave(blob);
    } catch (err) {
      console.error("Crop failed:", err);
      onError?.(err);
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/85 flex flex-col items-center justify-center p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative w-full max-w-md h-[60vh] bg-black rounded-lg overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="w-full max-w-md mt-4 flex flex-col gap-4">
        <label className="flex items-center gap-3 text-white text-fluid-sm">
          <span className="min-w-12">{t("profile.zoom")}</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-first-color"
            aria-label={t("profile.zoom")}
          />
        </label>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            onClick={onCancel}
            isDisabled={isSaving}
            className="px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors"
          >
            {t("profile.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            isDisabled={isSaving || !croppedAreaPixels}
            className="px-4 py-2 rounded-lg bg-first-color text-black font-medium hover:bg-second-color transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              t("profile.save")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageCropper;
