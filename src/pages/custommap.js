// pages/custommap.js
import { useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ThreeJSOverlayView } from "@googlemaps/three";

export default function CustomMap() {
  useEffect(() => {
    const mapOptions = {
      tilt: 0,
      heading: 0,
      zoom: 18,
      center: { lat: 29.8645402, lng: 77.8960763 }, //user specified
      mapId: "15431d2b469f209e",
      disableDefaultUI: true,
      gestureHandling: "none",
      keyboardShortcuts: false,
    };

    const loaderScript = document.createElement("script");
    loaderScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBxdp-deX-QvyzeuT40dPo7Ll0ovmAFExI&callback=initMap`;
    loaderScript.async = true;
    document.head.appendChild(loaderScript);

    window.initMap = () => {
      const mapDiv = document.getElementById("map");
      const map = new google.maps.Map(mapDiv, mapOptions);

      const scene = new THREE.Scene();
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
      directionalLight.position.set(0, 10, 50);
      scene.add(directionalLight);

      const loader = new GLTFLoader();
      const url =
        "https://raw.githubusercontent.com/googlemaps/js-samples/main/assets/pin.gltf"; //users own model (can use from db)
      loader.load(url, (gltf) => {
        gltf.scene.scale.set(10, 10, 10);
        gltf.scene.rotation.x = Math.PI / 2;
        scene.add(gltf.scene);

        let { tilt, heading, zoom } = mapOptions;

        const animate = () => {
          if (tilt < 67.5) {
            tilt += 0.5;
          } else if (heading <= 360) {
            heading += 0.2;
            zoom -= 0.0005;
          } else {
            return;
          }

          map.moveCamera({ tilt, heading, zoom });
          requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
      });

      new ThreeJSOverlayView({
        map,
        scene,
        anchor: { ...mapOptions.center, altitude: 100 },
        THREE,
      });
    };
  }, []);

  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
}
