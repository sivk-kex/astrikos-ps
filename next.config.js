const { DefinePlugin } = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Configure Cesium base URL
      config.plugins.push(
        new DefinePlugin({
          CESIUM_BASE_URL: JSON.stringify('/cesium'),
          // Add this to make Cesium's webpack imports work correctly
          'process.env': {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV)
          }
        })
      );

      // Copy Cesium assets
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.join(
                path.dirname(require.resolve('cesium')),
                'Build/Cesium/Workers'
              ),
              to: '../public/cesium/Workers' // Changed path
            },
            {
              from: path.join(
                path.dirname(require.resolve('cesium')),
                'Build/Cesium/ThirdParty'
              ),
              to: '../public/cesium/ThirdParty' // Changed path
            },
            {
              from: path.join(
                path.dirname(require.resolve('cesium')),
                'Build/Cesium/Assets'
              ),
              to: '../public/cesium/Assets' // Changed path
            },
            {
              from: path.join(
                path.dirname(require.resolve('cesium')),
                'Build/Cesium/Widgets'
              ),
              to: '../public/cesium/Widgets' // Changed path
            }
          ]
        })
      );

      // Important: Add this to resolve Cesium modules correctly
      config.resolve.mainFields = ['module', 'main'];
    }

    // Important: Add this to prevent webpack from resolving the 'fs' module on client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        http: false,
        https: false,
        zlib: false
      };
    }

    return config;
  },
  // Add this to handle static file serving in Next.js
  async headers() {
    return [
      {
        source: '/cesium/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ]
      }
    ];
  }
};