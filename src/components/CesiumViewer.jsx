"use client"

import { useEffect, useRef } from "react"
import * as Cesium from "cesium"
import { Ion, Viewer, Cartesian3, Math as CesiumMath } from "cesium"
import "cesium/Build/Cesium/Widgets/widgets.css"

export default function CesiumViewer({ viewMode }) {
  const cesiumContainerRef = useRef(null)
  const viewerRef = useRef(null)

  useEffect(() => {
    Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN

    const initCesium = async () => {
      if (!viewerRef.current && cesiumContainerRef.current) {
        try {
          // Create the terrain provider asynchronously
          const terrainProvider = await Cesium.createWorldTerrainAsync()

          // Initialize the viewer with the terrain provider
          viewerRef.current = new Viewer(cesiumContainerRef.current, {
            terrainProvider: terrainProvider,
            sceneMode: viewMode === "2D" ? Cesium.SceneMode.SCENE2D : Cesium.SceneMode.SCENE3D,
            baseLayerPicker: true,
            geocoder: true,
            homeButton: true,
            navigationHelpButton: true,
            animation: false,
            timeline: false,
            fullscreenButton: true,
          })

          // Hide the credit container
          viewerRef.current.cesiumWidget.creditContainer.style.display = "none"

          // Add 3D buildings if in 3D mode
          if (viewMode === "3D") {
            const buildings = await Cesium.createOsmBuildingsAsync()
            viewerRef.current.scene.primitives.add(buildings)
          }

          // Set camera to IIT Roorkee coordinates
          viewerRef.current.camera.flyTo({
            destination: Cartesian3.fromDegrees(77.8974, 29.8649, viewMode === "2D" ? 5000 : 1000),
            orientation: {
              heading: 0.0,
              pitch: viewMode === "2D" ? -CesiumMath.PI_OVER_TWO : -CesiumMath.PI_OVER_FOUR,
              roll: 0.0,
            },
          })
        } catch (error) {
          console.error("Error initializing Cesium:", error)
        }
      }
    }

    initCesium()

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [viewMode])

  return (
    <div
      ref={cesiumContainerRef}
      style={{
        width: "100%",
        height: "80vh",
        position: "relative",
        overflow: "hidden",
      }}
    />
  )
}
