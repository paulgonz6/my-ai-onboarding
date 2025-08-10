/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configure webpack to avoid cache corruption
  webpack: (config, { isServer, dev }) => {
    if (dev) {
      // Use filesystem cache with safeguards in development
      config.cache = {
        type: 'filesystem',
        allowCollectingMemory: true,
        buildDependencies: {
          config: [__filename],
        },
      }
    }
    
    return config
  },
  
  // Experimental features for better performance
  experimental: {
    // Improve build performance
    optimizeCss: true,
  },
}

module.exports = nextConfig