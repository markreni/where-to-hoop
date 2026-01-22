import { Label, TextField, TextArea, Button } from "react-aria-components";
import { Link } from "react-router-dom";
import { type BasketballHoop, type ColorMode, type Condition, type ObservationImage } from "../types/types";
import { useColorModeValues } from "../contexts/DarkModeContext";
import { useTranslation } from "../hooks/useTranslation";
import { useToast } from "../contexts/ToastContext";
import { useState, useRef } from "react";
import { MiniMap } from "../components/MiniMap";
import useLocateUser from "../hooks/useLocateUser";
import { BackArrow } from "../components/reusable/BackArrow";
import { MdOutlineMyLocation } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { FaStar, FaRegStar, FaInfoCircle, FaCheckCircle } from "react-icons/fa";
import { MAX_NAME_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_IMAGE_SIZE_MB, MAX_IMAGE_SIZE_BYTES, MAX_IMAGES } from "../utils/constants";


const conditionConfig: Record<Condition, { color: string; labelKey: string }> = {
  excellent: { color: 'bg-green-500', labelKey: 'addHoop.excellent' },
  good: { color: 'bg-blue-500', labelKey: 'addHoop.good' },
  fair: { color: 'bg-amber-500', labelKey: 'addHoop.fair' },
  poor: { color: 'bg-red-500', labelKey: 'addHoop.poor' },
};


type FormData = Omit<BasketballHoop, "id" | "condition" | "isIndoor"> & {
  condition: Condition | null;
  isIndoor: boolean | null;
};

const emptyHoop: FormData = {
  name: '',
  profile_images: [],
  coordinates: { latitude: null, longitude: null },
  description: '',
  condition: null,
  isIndoor: null,
  createdAt: new Date().toISOString(),
  currentPlayers: 0,
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AddHoop = () => {
  const mapRef = useRef<L.Map | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyHoop);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [profileImageIndex, setProfileImageIndex] = useState<number>(0);
  const locateUser = useLocateUser();
  const colorModeContext: ColorMode = useColorModeValues();
  const { t } = useTranslation();
  const { success, error, warning } = useToast();

  const isLocationSelected = formData.coordinates.latitude !== null && formData.coordinates.longitude !== null;
  const isNameFilled = formData.name.trim().length > 0;
  const isConditionSelected = formData.condition !== null;
  const isCourtTypeSelected = formData.isIndoor !== null;
  const hasProfileImage = imageFiles.length > 0;
  const isFormValid = isNameFilled && isLocationSelected && isConditionSelected && isCourtTypeSelected && hasProfileImage;
  const completedRequiredFields = (isNameFilled ? 1 : 0) + (isLocationSelected ? 1 : 0) + (isConditionSelected ? 1 : 0) + (isCourtTypeSelected ? 1 : 0) + (hasProfileImage ? 1 : 0);
  const totalRequiredFields = 5;

  const handleLocateUser = () => {
    locateUser({
      mapRef,
      zoom: 10,
      onAdditionForm: ({ latitude, longitude }) =>
        setFormData((prev) => ({
          ...prev,
          coordinates: {
            latitude,
            longitude,
          },
        })),
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Check max images limit
      const remainingSlots = MAX_IMAGES - imageFiles.length;
      if (remainingSlots <= 0) {
        warning(t('addHoop.errors.maxImages', { count: MAX_IMAGES }));
        return;
      }

      // Filter oversized files
      const oversizedFiles = newFiles.filter(file => file.size > MAX_IMAGE_SIZE_BYTES);
      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles.map(f => `${f.name} (${formatFileSize(f.size)})`).join(', ');
        warning(t('addHoop.errors.imageTooLarge', { size: MAX_IMAGE_SIZE_MB, files: fileNames }));
      }

      let validFiles = newFiles.filter(file => file.size <= MAX_IMAGE_SIZE_BYTES);

      // Limit to remaining slots
      if (validFiles.length > remainingSlots) {
        warning(t('addHoop.errors.remainingImages', { count: remainingSlots }));
        validFiles = validFiles.slice(0, remainingSlots);
      }

      setImageFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    if (profileImageIndex === index) {
      setProfileImageIndex(0);
    } else if (profileImageIndex > index) {
      setProfileImageIndex((prev) => prev - 1);
    }
  };

  const addHoop = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all required fields
    if (!isFormValid) {
      if (!isNameFilled) error(t('addHoop.errors.enterName'));
      else if (!isLocationSelected) error(t('addHoop.errors.selectLocation'));
      else if (!isConditionSelected) error(t('addHoop.errors.selectCondition'));
      else if (!isCourtTypeSelected) error(t('addHoop.errors.selectCourtType'));
      else if (!hasProfileImage) error(t('addHoop.errors.addImage'));
      return;
    }

    // Convert images to ObservationImage format
    const observationImages: ObservationImage[] = imageFiles.map((file, index) => ({
      id: Date.now() + index,
      imageName: file.name,
      addedDate: new Date().toISOString(),
    }));

    // Reorder so profile image is first
    if (profileImageIndex > 0) {
      const profileImage = observationImages[profileImageIndex];
      observationImages.splice(profileImageIndex, 1);
      observationImages.unshift(profileImage);
    }

    const hoopData: Omit<BasketballHoop, "id"> = {
      name: formData.name,
      coordinates: formData.coordinates,
      description: formData.description,
      condition: formData.condition!,
      isIndoor: formData.isIndoor!,
      createdAt: formData.createdAt,
      profile_images: observationImages,
      currentPlayers: 0,
    };

    console.log("Form submitted:", hoopData);
    console.log("Image files:", imageFiles);

    success(t('addHoop.success'));
    resetForm();
  };

  const resetForm = () => {
    setFormData(emptyHoop);
    setImageFiles([]);
    setProfileImageIndex(0);
  };

  return (
    <div className="padding-for-back-arrow flex-center padding-x-for-page padding-b-for-page min-h-screen">
      <BackArrow />
      <div className={`${colorModeContext} flex flex-col bg-background rounded-lg shadow-xl max-w-xl w-full max-h-[85vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`${colorModeContext} sticky top-0 z-1001 flex flex-col p-6 border-b border-gray-200 bg-background`}>
          <div className="flex items-center justify-between">
            <h2 className={`${colorModeContext} text-gray-600 text-fluid-lg font-semibold dark:text-gray-300`}>{t('addHoop.title')}</h2>
            <Link to="/faq"><FaInfoCircle className="text-gray-400 cursor-pointer" size={20}/></Link>
          </div>
          {/* Progress indicator */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-first-color transition-all duration-300"
                style={{ width: `${(completedRequiredFields / totalRequiredFields) * 100}%` }}
              />
            </div>
            <span className={`${colorModeContext} text-fluid-xs text-gray-500 dark:text-gray-400 whitespace-nowrap`}>
              {completedRequiredFields}/{totalRequiredFields} {t('addHoop.required')}
            </span>
          </div>
        </div>  

        {/* Form */}
        <form onSubmit={addHoop} className="flex flex-col p-6 gap-8">
          <div className="flex flex-col gap-4">
            {/* Name */}
            <TextField isRequired className={"flex flex-col gap-2"}>
              <div className="flex items-center gap-2">
                <Label className={`${colorModeContext} block text-fluid-sm background-text`}>
                  {t('addHoop.name')} *
                </Label>
                {isNameFilled && (
                  <FaCheckCircle className="text-green-500" size={16} />
                )}
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`${colorModeContext} form-input`}
                placeholder={t('addHoop.namePlaceholder')}
                maxLength={MAX_NAME_LENGTH}
              />
              <span className={`${colorModeContext} text-fluid-xs text-gray-500 dark:text-gray-400 text-right`}>
                {formData.name.length}/{MAX_NAME_LENGTH}
              </span>
            </TextField>

            {/* Location */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label className={`${colorModeContext} block text-fluid-sm background-text`}>{t('addHoop.location')} *</Label>
                {isLocationSelected && (
                  <FaCheckCircle className="text-green-500" size={16} />
                )}
              </div>
              <MiniMap formData={formData} setFormData={setFormData} mapRef={mapRef} />
              <Button
                type="button"
                onPress={handleLocateUser}
                isDisabled={false}
                className={`${colorModeContext} w-full py-1.5 rounded-lg flex-center gap-2 bg-gray-100 hover:bg-gray-200 background-text disabled:opacity-50 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700`}
              >
                <MdOutlineMyLocation size={24} />
                {t('addHoop.useCurrentLocation')}
              </Button>
              { /*  
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    required
                    value={formData.coordinates.latitude ?? ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      coordinates: {
                        ...formData.coordinates,
                        latitude: Number(e.target.value) ?? null,
                      },
                    })}
                    className={`${colorModeContext} form-input`}
                    placeholder="Latitude"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    required
                    value={formData.coordinates.longitude ?? ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      coordinates: {
                        ...formData.coordinates,
                        longitude: Number(e.target.value) ?? null,
                      },
                    })}
                    className={`${colorModeContext} form-input`}
                    placeholder="Longitude"
                  />
                </div>
              </div>
              */}
            </div>

            {/* Description */}
            <TextField className={"flex flex-col gap-2"}>
              <Label className={`${colorModeContext} block text-fluid-sm background-text`}>
                {t('addHoop.description')}
              </Label>
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`${colorModeContext} form-input resize-none`}
                rows={3}
                placeholder={t('addHoop.descriptionPlaceholder')}
                maxLength={MAX_DESCRIPTION_LENGTH}
              />
              <span className={`${colorModeContext} text-fluid-xs text-gray-500 dark:text-gray-400 text-right`}>
                {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </TextField>

            {/* Condition */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label className={`${colorModeContext} block text-fluid-sm background-text`}>
                  {t('addHoop.condition')} *
                </Label>
                {isConditionSelected && (
                  <FaCheckCircle className="text-green-500" size={16} />
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(conditionConfig) as Condition[]).map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => setFormData({ ...formData, condition })}
                    className={`py-2 px-2 rounded-lg text-fluid-xs font-medium transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      formData.condition === condition
                        ? 'ring-2 ring-first-color ring-offset-2 dark:ring-offset-gray-900'
                        : ''
                    } ${colorModeContext} bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700`}
                  >
                    <span className={`w-3 h-3 rounded-full ${conditionConfig[condition].color}`} />
                    <span className="background-text">{t(conditionConfig[condition].labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Indoor/Outdoor */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label className={`${colorModeContext} block text-fluid-sm background-text`}>
                  {t('addHoop.courtType')} *
                </Label>
                {isCourtTypeSelected && (
                  <FaCheckCircle className="text-green-500" size={16} />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isIndoor: false })}
                  className={`flex-1 py-2 px-4 rounded-lg text-fluid-sm font-medium transition-colors cursor-pointer ${
                    formData.isIndoor === false
                      ? 'bg-first-color text-white dark:text-black'
                      : `${colorModeContext} bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700`
                  }`}
                >
                  🌳 {t('addHoop.outdoor')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isIndoor: true })}
                  className={`flex-1 py-2 px-4 rounded-lg text-fluid-sm font-medium transition-colors cursor-pointer ${
                    formData.isIndoor === true
                      ? 'bg-first-color text-white dark:text-black'
                      : `${colorModeContext} bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700`
                  }`}
                >
                  🏠 {t('addHoop.indoor')}
                </button>
              </div>
            </div>

          {/* Image Upload */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className={`${colorModeContext} block text-fluid-sm background-text`}>
                    {t('addHoop.images')} *
                  </Label>
                  {hasProfileImage && (
                    <FaCheckCircle className="text-green-500" size={16} />
                  )}
                </div>
                <span className={`${colorModeContext} text-fluid-xs text-gray-500 dark:text-gray-400`}>
                  {imageFiles.length}/{MAX_IMAGES}
                </span>
              </div>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className={`${colorModeContext} form-input file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer dark:file:bg-gray-700 dark:hover:file:bg-gray-600 dark:file:text-gray-100`}
              />

              {imageFiles.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  {imageFiles.length > 1 && (
                  <p className={`${colorModeContext} text-fluid-xs text-gray-600 dark:text-gray-400`}>
                    {t('addHoop.setProfilePicture')}
                  </p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {imageFiles.map((file, index) => (
                      <div
                        key={index}
                        className={`${colorModeContext} relative rounded-lg overflow-hidden border-2 ${
                          profileImageIndex === index
                            ? "border-first-color"
                            : "border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview image ${index + 1}`}
                          className="w-full h-32 object-contain"
                        />  
                        
                        {/* Image star button */}
                        <button
                          type="button"
                          onClick={() => setProfileImageIndex(index)}
                          className={`${colorModeContext} absolute top-2 left-2`}
                        >
                          {profileImageIndex === index ? (  
                            <FaStar className="text-first-color cursor-pointer" size={20} />
                          ) : (
                            <FaRegStar className={`${colorModeContext} text-gray-600 cursor-pointer dark:text-gray-300`} size={20} />
                          )}
                        </button>

                        {/* Image remove button */}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                        >
                          <IoMdClose size={16} />
                        </button>

                        {/* File size badge */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-fluid-xs py-1 text-center">
                          {profileImageIndex === index ? (
                            <span className="font-medium">{t('addHoop.profile')} • {formatFileSize(file.size)}</span>
                          ) : (
                            formatFileSize(file.size)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
           </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              isDisabled={!isFormValid}
              className={`${colorModeContext} flex-1 px-4 py-2 rounded-lg bg-first-color first-color-text text-base font-medium main-color-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {t('addHoop.submit')}
            </Button>
            <Button
              type="button"
              onPress={resetForm}
              className={`${colorModeContext} flex-1 px-4 py-2 background-hover background-text border border-gray-300 rounded-lg transition-colors dark:border-gray-100`}
            >
              {t('addHoop.reset')}
            </Button>
          </div>
        </form>
      </div>
    </div>
    );
}

export default AddHoop;