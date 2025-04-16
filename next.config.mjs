// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// };

// export default nextConfig;
import path from 'path';

export default {
  webpack: (config) => {
    config.plugins = config.plugins || [];
    
    config.resolve.alias = {
      ...config.resolve.alias,
      cesium: path.resolve(__dirname, 'node_modules/cesium'),
    };
    
    return config;
  }
};