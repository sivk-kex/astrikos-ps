import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useEffect, useState } from "react";

export default function MapViewer({ filePath }) {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch(filePath)
      .then((res) => res.json())
      .then(setGeoData);
  }, [filePath]);

  if (!geoData) return <p>Loading map...</p>;

  return (
    <MapContainer style={{ height: "100%", width: "100%" }} center={[0, 0]} zoom={2}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <GeoJSON data={geoData} />
    </MapContainer>
  );
}
