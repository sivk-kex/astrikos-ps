import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

const MapGallery = ({ maps, currentColors }) => {
  const [selectedMap, setSelectedMap] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  console.log(maps);

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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleMapClick = (map) => {
    setSelectedMap(map);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleExploreClick = (mapId) => {
    router.push(`/maps/${mapId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${currentColors.secondary}`}>
            Your Maps
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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

        {maps.length === 0 ? (
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
              className={`${currentColors.primary} text-white cursor-pointer font-bold py-3 px-8 rounded-full shadow-lg transition duration-300`}
            >
              Upload Your First Map
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {maps.maps((map) => (
              <motion.div
                key={map._id}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-gray-700 rounded-lg overflow-hidden shadow-lg cursor-pointer group"
                onClick={() => handleMapClick(map)}
              >
                <div className="relative pb-2/3 h-48">
                  {/* Map thumbnail - using a placeholder image */}
                  <div className="absolute h-full w-full bg-gray-600 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
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
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {isModalOpen && selectedMap && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg max-w-3xl w-full p-6 relative"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
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

            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2 bg-gray-700 rounded-lg h-64 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>

              <div className="w-full md:w-1/2">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedMap.name}
                </h2>
                <p className="text-gray-400 mb-4">
                  Created: {formatDate(selectedMap.createdAt)}
                </p>

                <div className="mb-4">
                  <p className="text-gray-300 text-sm mb-1">Owner:</p>
                  <p className="text-white font-medium">
                    {selectedMap.ownerUsername}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-gray-300 text-sm mb-1">File Path:</p>
                  <p className="text-white text-sm font-mono bg-gray-700 p-2 rounded truncate">
                    {selectedMap.filePath}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-gray-300 text-sm mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMap.tags &&
                      selectedMap.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleExploreClick(selectedMap._id)}
                    className={`${currentColors.primary} text-white font-bold py-2 px-6 rounded-lg shadow-lg transition duration-300 flex-1`}
                  >
                    Explore Map
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeModal}
                    className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition duration-300"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default MapGallery;
