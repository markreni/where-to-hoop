import type { LatLngBoundsExpression } from "leaflet";

const centerCoordinates: [number, number] = [60.1695, 24.9354]; // Default to Helsinki if no location
// Helsinki greater area bounds: SW corner to NE corner
const helsinkiBounds: LatLngBoundsExpression = [
  [59.9, 24.5],  // Southwest corner (Kirkkonummi area)
  [60.5, 25.5],  // Northeast corner (Sipoo/Porvoo area)
];
// Validation constants for adding a new hoop
const MAX_NAME_LENGTH: number = 40;
const MAX_DESCRIPTION_LENGTH: number = 100;
const MAX_IMAGE_SIZE_MB: number = 5;
const MAX_IMAGE_SIZE_BYTES: number = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_IMAGES: number = 5;

const emailDomain: string = "mark.renssi@gmail.com";

// Note length constant for adding enrollment
const MAX_NOTE_LENGTH = 80

export { centerCoordinates, MAX_NAME_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_IMAGE_SIZE_MB, MAX_IMAGE_SIZE_BYTES, MAX_IMAGES, helsinkiBounds, MAX_NOTE_LENGTH, emailDomain };