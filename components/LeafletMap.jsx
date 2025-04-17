import React, { useEffect, useRef } from "react";

function LeafletMap() {
  const mapRef = useRef(null);
  const scriptRef = useRef(null);
  const cssRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!window.L) {
        const existingCss = document.querySelector('link[href*="leaflet.css"]');
        if (!existingCss) {
          const leafletCss = document.createElement("link");
          leafletCss.rel = "stylesheet";
          leafletCss.href =
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/leaflet.css";
          document.head.appendChild(leafletCss);
          cssRef.current = leafletCss;
        }

        const existingScript = document.querySelector(
          'script[src*="leaflet.js"]'
        );
        if (!existingScript) {
          const leafletScript = document.createElement("script");
          leafletScript.src =
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/leaflet.js";

          leafletScript.onload = initializeMap;
          document.body.appendChild(leafletScript);
          scriptRef.current = leafletScript;
        } else {
          if (window.L && !mapRef.current) {
            initializeMap();
          }
        }
      } else {
        if (!mapRef.current) {
          initializeMap();
        }
      }
    }

    function initializeMap() {
      const container = document.getElementById("mapContainer");
      if (container && !mapRef.current) {
        mapRef.current = L.map("mapContainer").setView([51.505, -0.09], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(mapRef.current);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
      }

      if (cssRef.current && document.head.contains(cssRef.current)) {
        document.head.removeChild(cssRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div
        id="mapContainer"
        className="w-full h-80 bg-gray-700 rounded-lg"
      ></div>
    </div>
  );
}

export default LeafletMap;
