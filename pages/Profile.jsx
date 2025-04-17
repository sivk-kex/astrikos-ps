"use client";
import { useSession } from "next-auth/react";
import React, { useState, useEffect, useRef, act, useMemo } from "react";
import { motion } from "framer-motion"; // You'll need to install framer-motion
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import MapViewer from "../components/MapViewer";

const Profile = () => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("images");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadPreview, setUploadPreview] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadTags, setUploadTags] = useState("");
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    images: [],
    models: [],
    maps: [],
  });
  const router = useRouter(); // Make sure to import useRouter from 'next/router'

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleExploreClick = (mapId) => {
    router.push(`/maps/${mapId}`);
  };

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const fileInputRef = useRef(null);

  const UploadMapView = useMemo(() =>
    dynamic(() => import("../components/UploadMapView"), {
      ssr: false,
    })
  );

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(
          `/api/user/userMap?name=${encodeURIComponent(session.user.name)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch map data");

        const data = await res.json();

        // Only update state if map data exists
        if (!data || (Array.isArray(data) && data.length === 0)) return;

        setMapData(data);
        setUserData((prevUserData) => ({
          ...prevUserData,
          maps: data,
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchImageData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `/api/user/userVector?name=${encodeURIComponent(session.user.name)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch map data");

        const data = await res.json();

        // Only update state if map data exists
        if (!data || (Array.isArray(data) && data.length === 0)) return;

        setUserData((prevUserData) => ({
          ...prevUserData,
          images: data,
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.name) {
      fetchMapData();
      fetchImageData();
    }
  }, [session]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = (id) => {
    setUserData({
      ...userData,
      [activeTab]: userData[activeTab].filter((item) => item.id !== id),
    });
    handleCloseModal();
  };

  const handleUpdateItem = (id, newTitle) => {
    setUserData({
      ...userData,
      [activeTab]: userData[activeTab].map((item) =>
        item.id === id ? { ...item, title: newTitle } : item
      ),
    });
  };

  const openUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadTitle("");
    setUploadTags("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validFileTypes =
      activeTab === "images"
        ? ["image/svg+xml", "image/png"]
        : activeTab === "models"
        ? ["model/gltf-binary", "model/gltf+json"]
        : ["application/geo+json", "application/json", ".geojson"];

    const fileType =
      file.type ||
      (file.name.endsWith(".glb")
        ? "model/gltf-binary"
        : file.name.endsWith(".gltf")
        ? "model/gltf+json"
        : file.name.endsWith(".geojson")
        ? "application/geo+json"
        : "");

    const isValid =
      validFileTypes.includes(fileType) ||
      (activeTab === "models" &&
        (file.name.endsWith(".glb") || file.name.endsWith(".gltf"))) ||
      (activeTab === "maps" && file.name.endsWith(".geojson"));

    if (!isValid) {
      alert(
        `Please select a valid file: ${
          activeTab === "images"
            ? "SVG or PNG"
            : activeTab === "models"
            ? "GLTF or GLB"
            : "GeoJSON (.geojson)"
        }`
      );
      return;
    }

    setUploadFile(file);
    setUploadTitle(file.name.split(".")[0]); // Default title from filename

    // Create preview
    if (activeTab === "images") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else if (activeTab === "maps") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const geojson = JSON.parse(e.target.result);
          setUploadPreview(geojson); // Store the parsed GeoJSON for preview or further use
        } catch (err) {
          alert("Invalid GeoJSON file.");
        }
      };
      reader.readAsText(file); // GeoJSON is plain text (JSON format)
    } else {
      // For models, just show a placeholder
      setUploadPreview("/api/placeholder/600/400");
    }
  };
  const handleUpload = async () => {
    // Process tags into an array
    const tagsArray = uploadTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag); // Remove empty tags

    const newItem = {
      id: Math.max(...userData[activeTab].map((item) => item.id), 0) + 1,
      title: uploadTitle,
      url: uploadPreview || "/api/placeholder/600/400",
      date: new Date().toISOString().split("T")[0],
      type: uploadFile.name.split(".").pop().toLowerCase(),
      tags: tagsArray,
    };

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("file", uploadFile); // file input
    formData.append("title", uploadTitle);
    formData.append("date", newItem.date);
    formData.append("originalFormat", newItem.type);
    formData.append("ownerUsername", session.user.name);
    formData.append("tags", tagsArray); // Send tags as JSON string
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      let response;
      if (activeTab === "maps") {
        response = await fetch("/api/maps/upload", {
          method: "POST",
          body: formData,
        });
      } else if (activeTab === "models") {
        response = await fetch("/api/model3d/upload", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/vector2d/upload", {
          method: "POST",
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json(); // Assuming the backend returns the uploaded file's URL or ID

      // Optionally use backend response to update UI
      const uploadedItem = {
        ...newItem,
        url: result.url || newItem.url, // in case backend returns a new URL
        tags: result.tags || tagsArray, // in case backend processes tags
      };

      // Update local state
      setUserData({
        ...userData,
        [activeTab]: [...userData[activeTab], uploadedItem],
      });

      closeUploadModal();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("There was a problem uploading the file.");
    }
  };

  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const gradientColors = {
    images: "from-indigo-800 to-purple-900",
    models: "from-purple-800 to-pink-900",
    maps: "from-blue-800 to-cyan-900",
  };

  const accentColors = {
    images: {
      primary: "bg-indigo-600 hover:bg-indigo-700",
      secondary: "text-indigo-400",
      border: "border-indigo-500",
      highlight: "bg-indigo-900",
    },
    models: {
      primary: "bg-purple-600 hover:bg-purple-700",
      secondary: "text-purple-400",
      border: "border-purple-500",
      highlight: "bg-purple-900",
    },
    maps: {
      primary: "bg-blue-600 hover:bg-blue-700",
      secondary: "text-blue-400",
      border: "border-blue-500",
      highlight: "bg-blue-900",
    },
  };

  const currentColors = accentColors[activeTab];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      {status === "loading" ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : session ? (
        <div className="max-w-6xl mx-auto">
          {/* User Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`flex flex-col md:flex-row items-center mb-10 bg-gradient-to-r ${gradientColors[activeTab]} p-6 rounded-lg shadow-lg border border-gray-700`}
          >
            <div className="relative">
              <img
                src={session.user.image || "/api/placeholder/100/100"}
                className={`w-24 h-24 rounded-full border-4 ${currentColors.border} shadow-lg mb-4 md:mb-0 md:mr-6`}
                alt="Profile"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent to-black opacity-20"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome,{" "}
                <span className={currentColors.secondary}>
                  {session.user.name}
                </span>
              </h1>
              <p className="text-gray-300">{session.user.email}</p>
            </div>
          </motion.div>

          {/* Gallery Navigation */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {["images", "models", "maps"].map((tab) => (
              <motion.div
                key={tab}
                whileHover={{ scale: activeTab !== tab ? 1.03 : 1 }}
                whileTap={{ scale: 0.97 }}
                className={`p-6 rounded-lg cursor-pointer transition-all duration-300 flex flex-col items-center justify-center 
                ${
                  activeTab === tab
                    ? `bg-gradient-to-br ${gradientColors[tab]} shadow-lg transform scale-105 border border-gray-700`
                    : "bg-gray-800 hover:bg-gray-750"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "images" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-10 w-10 mb-2 ${accentColors[tab].secondary}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                ) : tab === "models" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-10 w-10 mb-2 ${accentColors[tab].secondary}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-10 w-10 mb-2 ${accentColors[tab].secondary}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                )}
                <h2 className="text-xl font-semibold">
                  {tab === "images"
                    ? "2D Images"
                    : tab === "models"
                    ? "3D Models"
                    : "Maps"}
                </h2>
                <span className="text-sm text-gray-400">
                  {userData[tab].length} items
                </span>
              </motion.div>
            ))}
          </div>

          {/* Content Grid with Upload Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${currentColors.secondary}`}>
                Your{" "}
                {activeTab === "images"
                  ? "2D Images"
                  : activeTab === "models"
                  ? "3D Models"
                  : "Maps"}
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openUploadModal}
                className={`${currentColors.primary} text-white cursor-pointer font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 flex items-center`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Upload New
              </motion.button>
            </div>

            {activeTab === "maps" ? (
              <>
                {userData.maps && userData.maps.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <div className="mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-16 w-16 mx-auto ${currentColors.secondary} opacity-60`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <p className="text-xl text-gray-500 mb-6">No maps found</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={openUploadModal}
                      className={`${currentColors.primary} text-white cursor-pointer font-bold py-3 px-8 rounded-full shadow-lg transition duration-300`}
                    >
                      Upload Your First Map
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {userData.maps &&
                      userData.maps.map((map) => (
                        <motion.div
                          key={map._id}
                          variants={itemVariants}
                          whileHover={{ scale: 1.03, y: -5 }}
                          className="bg-gray-700 rounded-lg overflow-hidden shadow-lg group"
                        >
                          <div className="relative h-12">
                            <div className="absolute top-2 right-2">
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded-full bg-opacity-70 ${currentColors.primary} uppercase`}
                              >
                                MAP
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-lg mb-1 text-white group-hover:text-indigo-300 transition-colors duration-200">
                              {map.name}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {formatDate(map.createdAt)}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-1">
                              {map.tags &&
                                map.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                            </div>

                            {/* Explore Button */}
                            <div className="mt-4">
                              <button
                                onClick={() => router.push(`/maps/${map._id}`)}
                                className="text-sm cursor-pointer font-medium text-indigo-300 hover:text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded transition duration-200"
                              >
                                Explore Map
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </motion.div>
                )}
              </>
            ) : (
              <>
                {userData[activeTab].length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <div className="mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-16 w-16 mx-auto ${currentColors.secondary} opacity-60`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <p className="text-xl text-gray-500 mb-6">No items found</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={openUploadModal}
                      className={`${currentColors.primary} text-white cursor-pointer font-bold py-3 px-8 rounded-full shadow-lg transition duration-300`}
                    >
                      Upload Your First{" "}
                      {activeTab === "images"
                        ? "Image"
                        : activeTab === "models"
                        ? "Model"
                        : "Map"}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {userData[activeTab]?.map((item) => (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.03, y: -5 }}
                        className="bg-gray-700 rounded-lg overflow-hidden shadow-lg cursor-pointer group"
                      >
                        <div className="relative aspect-[3/2]">
                          {item.filePath && (
                            <img
                              src={item.filePath}
                              alt={item.name}
                              className="absolute h-full w-full object-cover transition-all duration-500 transform group-hover:scale-110"
                            />
                          )}
                          <div className="absolute top-2 right-2">
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-full bg-opacity-70 ${
                                currentColors?.primary || "bg-indigo-500"
                              } uppercase`}
                            >
                              {item.originalFormat}
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-1 text-white group-hover:text-indigo-300 transition-colors duration-200">
                            {item.name}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>

                          {item.tags && item.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:scale-105 transform transition-transform duration-200"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 mx-auto text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <p className="text-2xl mb-6 text-gray-400">
              Sign in to view your profile
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300"
            >
              Sign In
            </motion.button>
          </motion.div>
        </div>
      )}

      {isModalOpen && selectedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-full overflow-auto border border-gray-700"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <input
                type="text"
                value={selectedItem.title}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, title: e.target.value })
                }
                className={`bg-gray-700 text-white text-xl font-bold border-none focus:ring-2 focus:ring-${currentColors.secondary} rounded px-2 py-1`}
              />
              <button
                onClick={handleCloseModal}
                className="text-gray-400 cursor-pointer hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  className="w-full object-contain max-h-96"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-gray-400 mb-2 sm:mb-0">
                    Added on: {selectedItem.date}
                  </p>
                  <p className="text-gray-400 mb-4 sm:mb-0">
                    Format:{" "}
                    <span
                      className={`font-semibold ${currentColors.secondary}`}
                    >
                      {selectedItem.type.toUpperCase()}
                    </span>
                  </p>
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      handleUpdateItem(selectedItem.id, selectedItem.title);
                      handleCloseModal();
                    }}
                    className={`${currentColors.primary} cursor-pointer text-white px-4 py-2 rounded-lg flex items-center`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteItem(selectedItem.id)}
                    className="bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {isUploadModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-gray-800 rounded-lg shadow-2xl max-w-xl w-full border border-gray-700"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className={`text-xl font-bold ${currentColors.secondary}`}>
                Upload New{" "}
                {activeTab === "images"
                  ? "Image"
                  : activeTab === "models"
                  ? "3D Model"
                  : "Map"}
              </h3>
              <button
                onClick={closeUploadModal}
                className="text-gray-400 cursor-pointer hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-gray-700 text-white border-none rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
                  placeholder={`Enter ${
                    activeTab === "images"
                      ? "image"
                      : activeTab === "models"
                      ? "model"
                      : "map"
                  } title`}
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  className="w-full bg-gray-700 text-white border-none rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter tags (e.g. landscape, nature, outdoor)"
                />
                {uploadTags && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {uploadTags.split(",").map(
                      (tag, index) =>
                        tag.trim() && (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded-md text-sm ${currentColors.tagBg} text-gray-100`}
                          >
                            {tag.trim()}
                          </span>
                        )
                    )}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 mb-2">
                  File{" "}
                  {activeTab === "images"
                    ? "(SVG, PNG)"
                    : activeTab === "models"
                    ? "(GLTF, GLB)"
                    : "(GeoJSON)"}
                </label>
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="w-full h-51 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors duration-300"
                >
                  {uploadPreview ? (
                    <div className="relative w-full h-full">
                      {activeTab === "maps" && uploadPreview ? (
                        <UploadMapView uploadPreview={uploadPreview} />
                      ) : (
                        <img
                          src={uploadPreview}
                          alt="Preview"
                          className="w-full h-full object-contain p-2"
                        />
                      )}
                    </div>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-gray-400 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-gray-400 text-sm">
                        Click to select a file or drag it here
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept={
                    activeTab === "images"
                      ? ".svg,.png,image/svg+xml,image/png"
                      : activeTab === "models"
                      ? ".gltf,.glb,model/gltf-binary,model/gltf+json"
                      : ".geojson,application/geo+json,application/json"
                  }
                />
              </div>

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeUploadModal}
                  className="bg-gray-600 cursor-pointer hover:bg-gray-700 text-white px-4 py-2 rounded-lg mr-3"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpload}
                  disabled={!uploadFile || !uploadTitle}
                  className={`${
                    !uploadFile || !uploadTitle
                      ? "bg-gray-500 cursor-not-allowed"
                      : currentColors.primary
                  } text-white cursor-pointer px-4 py-2 rounded-lg`}
                >
                  Upload
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
