const haversineDistance = ([lat1, lon1]: [number, number], [lat2, lon2]: [number, number], isMiles = false) => {
      const toRadian = (angle: number) => (Math.PI / 180) * angle;
      const distance = (a: number, b: number) => (Math.PI / 180) * (a - b);
      const RADIUS_OF_EARTH_IN_KM = 6371;

      const dLat = distance(lat2, lat1);
      const dLon = distance(lon2, lon1);

      lat1 = toRadian(lat1);
      lat2 = toRadian(lat2);

      // Haversine Formula
      const a =
        Math.pow(Math.sin(dLat / 2), 2) +
        Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.asin(Math.sqrt(a));

      let finalDistance = RADIUS_OF_EARTH_IN_KM * c;

      if (isMiles) {
        finalDistance /= 1.60934;
      }

      return finalDistance;
    };

export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!response.ok) return null;
    const data = await response.json(); 
    const address = data.address;
    const { road, house_number, city, state, postcode } = address;
    return house_number && road && city && state && postcode
      ? `${road} ${house_number}, ${postcode}, ${city}, ${state}`
      : null;
  } catch {
    return null;
  }
};

export const isWithinHoopRange = (
  userCoords: [number, number],
  hoopCoords: [number, number],
  rangeMeters = 100
): { within: boolean; distance: number } => {
  const distanceKm = haversineDistance(userCoords, hoopCoords)
  const distance = distanceKm * 1000
  return { within: distance <= rangeMeters, distance }
}

export const shortenAddress = (address: string, parts = 2): string => {
  const segments = address.split(', ');
  return segments.length <= parts ? address : segments.slice(0, parts).join(', ');
};

export default haversineDistance;