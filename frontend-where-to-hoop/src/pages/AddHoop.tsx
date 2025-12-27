import { MdOutlineMyLocation } from "react-icons/md";
import { Label, TextField, TextArea, Button } from "react-aria-components";
import { type BasketballHoop, type ColorMode, type Condition } from "../types/types";
import { useColorModeValues } from "../contexts/DarkModeContext";
import { useState } from "react";

const AddHoop = () => {
  const [formData, setFormData] = useState<BasketballHoop>({
    id: '',
    name: '',
    profile_images: [],
    coordinates: { latitude: null, longitude: null },
    description: '',
    condition: 'good',
    indoor: false,
    createdAt: new Date().toISOString(),
  });
  const colorModeContext: ColorMode = useColorModeValues();
  

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${colorModeContext} bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className={`${colorModeContext} text-gray-900 text-lg font-semibold dark:text-gray-100`}>Add Basketball Hoop</h2>
          <Button
            onPress={() => {}}
            className={"text-gray-400 hover:text-gray-600 transition-colors"}
          >
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={() => {}} className="p-6">
          <div className="space-y-4">
            {/* Name */}
            <TextField isRequired className="flex flex-col">
              <Label className={`${colorModeContext} block text-sm text-gray-700 mb-1 dark:text-gray-100`}>
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
            <div>
              <Label className={`${colorModeContext} block text-sm text-gray-700 mb-1 dark:text-gray-100`}>Location *</Label>
              <Button
                type="button"
                onPress={() => {}}
                isDisabled={false}
                className={`${colorModeContext} w-full mb-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700`}
              >
                <MdOutlineMyLocation size={24} />
                Use Current Location
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    required
                    value={formData.coordinates.latitude ?? ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      coordinates: {
                        ...formData.coordinates,
                        latitude: e.target.value === "" ? null : parseFloat(e.target.value),
                      },
                    })}
                    className={`${colorModeContext} form-input`}
                    placeholder="Latitude"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    value={formData.coordinates.longitude ?? ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      coordinates: {
                        ...formData.coordinates,
                        longitude: e.target.value === "" ? null : parseFloat(e.target.value),
                      },
                    })}
                    className={`${colorModeContext} form-input`}
                    placeholder="Longitude"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <TextField className="flex flex-col">
              <Label className={`${colorModeContext} block text-sm text-gray-700 mb-1 dark:text-gray-100`}>
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
            <div>
              <Label className={`${colorModeContext} block text-sm text-gray-700 mb-1 dark:text-gray-100`}>
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
                onChange={(e) => setFormData({ ...formData, indoor: e.target.checked })}
                checked={formData.indoor}
                type="checkbox" 
                className="w-4 h-4 appearance-none border border-gray-300 rounded-sm checked:bg-first-color checked:border-first-color checked:ring-2 checked:ring-first-color/40 transition cursor-pointer" />
              <span className={`${colorModeContext} text-sm text-gray-700 dark:text-gray-100`}>Indoor court</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              onPress={() => {console.log("Cancel")}}
              className={`${colorModeContext} flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-100 dark:text-gray-100 dark:hover:bg-gray-700`}
            >
              Cancel
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