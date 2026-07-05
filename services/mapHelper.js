const extractLatLng = (location) => {
  if (!location?.location?.coordinates) return { lat: null, lng: null };
  const [lng, lat] = location.location.coordinates;
  return { lat, lng };
};