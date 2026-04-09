import type { LatLngBoundsExpression } from "leaflet";

const centerCoordinates: [number, number] = [60.1695, 24.9354]; // Default to Helsinki if no location
// Helsinki greater area bounds: SW corner to NE corner
const helsinkiBounds: LatLngBoundsExpression = [
  [59.9, 24.5],  // Southwest corner (Kirkkonummi area)
  [60.5, 25.5],  // Northeast corner (Sipoo/Porvoo area)
];
// Validation constants for adding a new hoop
const MAX_NAME_LENGTH: number = 20;
const MAX_DESCRIPTION_LENGTH: number = 120;
const MAX_IMAGE_SIZE_MB: number = 3; // 3 MB
const MAX_IMAGE_SIZE_BYTES: number = MAX_IMAGE_SIZE_MB * 1024 * 1024;
// Profile photos are cropped client-side to a 512x512 JPEG (~30-80 KB) before upload,
// so the pre-crop limit just needs to keep typical phone camera files in and absurd inputs (e.g. 50 MP RAW) out.
const MAX_PROFILE_IMAGE_SIZE_MB: number = 15;
const MAX_PROFILE_IMAGE_SIZE_BYTES: number = MAX_PROFILE_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_IMAGES: number = 3;

const emailDomain: string = "mark.renssi@gmail.com";

// Note length constant for adding enrollment
const MAX_NOTE_LENGTH = 75;

// Bio length constant for user profile
const MAX_BIO_LENGTH = 280;

export { centerCoordinates, MAX_NAME_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_IMAGE_SIZE_MB, MAX_IMAGE_SIZE_BYTES, MAX_PROFILE_IMAGE_SIZE_MB, MAX_PROFILE_IMAGE_SIZE_BYTES, MAX_IMAGES, helsinkiBounds, MAX_NOTE_LENGTH, MAX_BIO_LENGTH, emailDomain };