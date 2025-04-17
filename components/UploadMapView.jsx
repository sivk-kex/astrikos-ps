import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";

const UploadMapView = ({ uploadPreview }) => {
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [zoom, setZoom] = useState(5);

  useEffect(() => {
    if (
      uploadPreview &&
      uploadPreview.features &&
      uploadPreview.features.length > 0
    ) {
      try {
        const polygonFeature = uploadPreview.features[0].geometry;

        if (polygonFeature.type && polygonFeature.coordinates) {
          const coordinates = polygonFeature.coordinates;

          if (polygonFeature.type === "Polygon") {
            const coords = coordinates[0];
            const lats = coords.map((c) => c[1]);
            const lngs = coords.map((c) => c[0]);

            const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
            const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

            setMapCenter([centerLat, centerLng]);
          } else if (polygonFeature.geometry.type === "MultiPolygon") {
            const coords = coordinates[0][0];
            const lats = coords.map((c) => c[1]);
            const lngs = coords.map((c) => c[0]);

            const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
            const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

            setMapCenter([centerLat, centerLng]);
          }
        }
      } catch (error) {
        console.error("Error calculating center from GeoJSON:", error);
      }
    }
  }, [uploadPreview]);

  const geoJSONStyle = {
    fillColor: "#3388ff",
    weight: 2,
    opacity: 1,
    color: "#3388ff",
    fillOpacity: 0.2,
  };

  return (
    <div className="h-50">
      <MapContainer
        style={{ width: "100%", height: "100%" }}
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />
        {uploadPreview && (
          <GeoJSON
            data={uploadPreview}
            style={geoJSONStyle}
            onEachFeature={(feature, layer) => {
              layer.on({
                click: (e) => {
                  console.log("Feature clicked:", feature);
                },
              });
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default UploadMapView;
