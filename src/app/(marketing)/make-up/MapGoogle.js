"use client";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "300px"
};

const center = { lat: 21.0285, lng: 105.8542 }; // Vị trí mặc định (Hà Nội)

export default function MapGoogle({ position = center }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY" // Thay bằng API key của bạn
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={position} zoom={13}>
      <Marker position={position} />
    </GoogleMap>
  );
}
