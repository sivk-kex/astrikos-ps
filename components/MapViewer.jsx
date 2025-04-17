import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import "leaflet-draw";

const MapViewer = ({ mapId }) => {
  const [mapData, setMapData] = useState(null);
  const [viewMode, setViewMode] = useState("2d");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const featureGroupRef = useRef(null);
  const cesiumContainerRef = useRef(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/maps/${mapId}`);
        if (!res.ok) throw new Error("Failed to fetch map data");
        const data = await res.json();

        console.log("Fetched map data:", data);

        setMapData(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (mapId) fetchMapData();
  }, [mapId]);

  const saveChanges = async () => {
    if (!featureGroupRef.current) return;
    try {
      setIsSaving(true);
      const updatedGeo = featureGroupRef.current.toGeoJSON();
      const res = await fetch(`/api/maps/${mapId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geojsonData: updatedGeo }),
      });
      if (!res.ok) throw new Error("Failed to save map");
      const updated = await res.json();
      setMapData(updated);
      alert("Map saved!");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const MapDrawControl = () => {
    const map = useMap();

    useEffect(() => {
      if (!map || !mapData) return;

      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      if (mapData.geojsonData) {
        try {
          const geoLayer = L.geoJSON(mapData.geojsonData);
          geoLayer.eachLayer((layer) => drawnItems.addLayer(layer));
          map.fitBounds(geoLayer.getBounds());
        } catch (err) {
          console.error("Invalid GeoJSON in Leaflet:", err);
        }
      }

      const drawControl = new L.Control.Draw({
        draw: {
          polygon: true,
          polyline: true,
          rectangle: true,
          marker: true,
          circle: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItems,
        },
      });

      map.addControl(drawControl);
      map.on("draw:created", (e) => drawnItems.addLayer(e.layer));
      featureGroupRef.current = drawnItems;

      return () => {
        map.removeControl(drawControl);
        map.removeLayer(drawnItems);
      };
    }, [map, mapData]);

    return null;
  };

  useEffect(() => {
    if (viewMode === "2d") {
      const darkModeStyles = document.createElement("style");
      darkModeStyles.innerHTML = `
        .leaflet-control-container .leaflet-bar a {
          background-color: #1a1a2e;
          color: #fff;
          border-color: #4a4a6a;
        }
        .leaflet-control-container .leaflet-bar a:hover {
          background-color: #4a4a6a;
        }
        .leaflet-control-zoom-in, .leaflet-control-zoom-out {
          background-color: #1a1a2e !important;
          color: #fff !important;
        }
        .leaflet-draw-toolbar a {
          background-color: #1a1a2e !important;
          border-color: #4a4a6a !important;
        }
        .leaflet-draw-toolbar a:hover {
          background-color: #4a4a6a !important;
        }
        .leaflet-draw-actions a {
          background-color: #1a1a2e !important;
          color: #fff !important;
        }
        .leaflet-draw-actions a:hover {
          background-color: #4a4a6a !important;
        }
      `;
      document.head.appendChild(darkModeStyles);

      return () => {
        document.head.removeChild(darkModeStyles);
      };
    }
  }, [viewMode]);

  if (isLoading) {
    return (
      <div
        className="loading-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "600px",
          background: "#121212",
          color: "#fff",
        }}
      >
        <div
          className="loading-spinner"
          style={{
            width: "50px",
            height: "50px",
            border: "4px solid rgba(255, 255, 255, 0.1)",
            borderLeftColor: "#8b5cf6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          color: "#f87171",
          background: "#1e1e30",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #f87171",
        }}
      >
        Error: {error}
      </div>
    );
  }

  if (!mapData) {
    return (
      <div
        style={{
          color: "#d1d5db",
          background: "#1e1e30",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        No map data available
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#121212",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
        color: "#fff",
      }}
    >
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={() => setViewMode("2d")}
          disabled={viewMode === "2d"}
          style={{
            background:
              viewMode === "2d"
                ? "linear-gradient(135deg, #4f46e5, #8b5cf6)"
                : "#2d2d3a",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: viewMode === "2d" ? "default" : "pointer",
            fontWeight: "bold",
            transition: "all 0.3s ease",
            opacity: viewMode === "2d" ? 1 : 0.85,
            boxShadow:
              viewMode === "2d" ? "0 4px 6px rgba(0, 0, 0, 0.2)" : "none",
          }}
        >
          2D View
        </button>
        <button
          onClick={() => setViewMode("3d")}
          disabled={viewMode === "3d"}
          style={{
            background:
              viewMode === "3d"
                ? "linear-gradient(135deg, #4f46e5, #8b5cf6)"
                : "#2d2d3a",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: viewMode === "3d" ? "default" : "pointer",
            fontWeight: "bold",
            transition: "all 0.3s ease",
            opacity: viewMode === "3d" ? 1 : 0.85,
            boxShadow:
              viewMode === "3d" ? "0 4px 6px rgba(0, 0, 0, 0.2)" : "none",
          }}
        >
          3D View
        </button>
        {viewMode === "2d" && (
          <button
            onClick={saveChanges}
            disabled={isSaving}
            style={{
              background: "linear-gradient(135deg, #6d28d9, #8b5cf6)",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: isSaving ? "wait" : "pointer",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              opacity: isSaving ? 0.7 : 1,
              marginLeft: "auto",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
            }}
          >
            {isSaving ? (
              <span
                className="save-spinner"
                style={{ display: "inline-block" }}
              >
                Saving...
              </span>
            ) : (
              "Save Map"
            )}
          </button>
        )}
      </div>

      <div
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
          border: "2px solid #2d2d3a",
        }}
      >
        {viewMode === "2d" ? (
          <MapContainer
            style={{ height: "600px", width: "100%" }}
            center={[0, 0]}
            zoom={2}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              subdomains="abcd"
              maxZoom={19}
            />
            <MapDrawControl />
          </MapContainer>
        ) : (
          <div
            ref={cesiumContainerRef}
            style={{
              height: "600px",
              width: "100%",
              background: "#1a1a2e",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#a5a5b5",
            }}
          >
            <div>
              <p>3D View Currently Unavailable</p>
              <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                Please switch to 2D view for map editing
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "10px",
          color: "#9ca3af",
          fontSize: "0.85rem",
          textAlign: "right",
        }}
      >
        Map ID: {mapId}
      </div>
    </div>
  );
};

export default MapViewer;
