import { MdOutlineMyLocation } from "react-icons/md";
import { Label, TextField, TextArea, Button } from "react-aria-components";
import { type BasketballHoop, type ColorMode, type Condition } from "../types/types";
import { useColorModeValues } from "../contexts/DarkModeContext";
import { useState, useRef } from "react";
import { MiniMap } from "../components/MiniMap";
import useLocateUser from "../hooks/useLocateUser";
import { BackArrow } from "../components/reusable/BackArrow";


const emptyHoop: Omit<BasketballHoop, "id"> = {
  name: '',
  profile_images: [],
  coordinates: { latitude: null, longitude: null },
  description: '',
  condition: 'good',
  isIndoor: false,
  createdAt: new Date().toISOString(),
};

const AddHoop = () => {
  const mapRef = useRef<L.Map | null>(null);
  const [formData, setFormData] = useState<Omit<BasketballHoop, "id">>(emptyHoop);
  const locateUser = useLocateUser();
  const colorModeContext: ColorMode = useColorModeValues();

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

  const addHoop = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData(emptyHoop);
  };

  return (
    <div className="padding-for-back-arrow flex items-center justify-center padding-x-for-page padding-b-for-page min-h-screen">
      <BackArrow />
      <div className={`${colorModeContext} flex flex-col bg-background rounded-lg shadow-xl max-w-xl w-full max-h-[85vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`${colorModeContext} sticky top-0 z-1001 flex items-center justify-start p-6 border-b border-gray-200 bg-background`}>
          <h2 className={`${colorModeContext} text-gray-600 text-lg font-semibold dark:text-gray-300`}>Add Basketball Hoop</h2>   
        </div>  

        {/* Form */}
        <form onSubmit={addHoop} className="flex flex-col p-6 gap-6">
          <div className="flex flex-col gap-4">
            {/* Name */}
            <TextField isRequired className={"flex flex-col gap-2"}>
              <Label className={`${colorModeContext} block text-sm text-gray-700 dark:text-gray-100`}>
                Name *
              </Label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`${colorModeContext} form-input`}
                placeholder="e.g., Central Park Court"
              />
            </TextField>

            {/* Location */}
            <div className="flex flex-col gap-2">
              <Label className={`${colorModeContext} block text-sm text-gray-700 dark:text-gray-100`}>Location *</Label>
              <MiniMap formData={formData} setFormData={setFormData} mapRef={mapRef} />
              <Button
                type="button"
                onPress={handleLocateUser}
                isDisabled={false}
                className={`${colorModeContext} w-full py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700`}
              >
                <MdOutlineMyLocation size={24} />
                Use Current Location
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
              <Label className={`${colorModeContext} block text-sm text-gray-700 dark:text-gray-100`}>
                Description
              </Label>
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`${colorModeContext} form-input resize-none`}
                rows={3}
                placeholder="Add details about the court..."
              />
            </TextField>

            {/* Condition */}
            <div className="flex flex-col gap-2">
              <Label className={`${colorModeContext} block text-sm text-gray-700 dark:text-gray-100`}>
                Condition
              </Label>
              <select
                id="condition"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as Condition })}
                className={`${colorModeContext} form-input`}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            {/* Indoor/Outdoor */}
            <div className="flex items-center gap-2">
              <input 
                onChange={(e) => setFormData({ ...formData, isIndoor: e.target.checked })}
                checked={formData.isIndoor}
                type="checkbox" 
                className="w-4 h-4 appearance-none border border-gray-300 rounded-sm checked:bg-first-color checked:border-first-color checked:ring-2 checked:ring-first-color/40 transition cursor-pointer" />
              <span className={`${colorModeContext} text-sm text-gray-700 dark:text-gray-100`}>Indoor court</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              onPress={() => { setFormData(emptyHoop); }}
              className={`${colorModeContext} flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-100 dark:text-gray-100 dark:hover:bg-gray-700`}
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="flex-1 px-4 py-2 bg-first-color text-white rounded-lg hover:bg-second-color transition-colors"
            >
              Add Hoop
            </Button>
          </div>
        </form>
      </div>
    </div>
    );
}

export default AddHoop;