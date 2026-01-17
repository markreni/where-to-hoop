const centerCoordinates: [number, number] = [60.1695, 24.9354]; // Default to Helsinki if no location

const MAX_NAME_LENGTH = 40;
const MAX_DESCRIPTION_LENGTH = 100;
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_IMAGES = 5;

export { centerCoordinates, MAX_NAME_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_IMAGE_SIZE_MB, MAX_IMAGE_SIZE_BYTES, MAX_IMAGES };