/** @type {import('next').NextConfig} */
const nextConfig = {
  // Updated for Next.js 15 - moved from experimental to top level
  serverExternalPackages: ['puppeteer'],
  
  images: {
    domains: ['localhost']
  },
  
  // Webpack configuration for better compatibility
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('puppeteer');
    }
    return config;
  },
  
  // Enable experimental features for better performance
  experimental: {
    // Remove the old serverComponentsExternalPackages
    turbo: {
      loaders: {
        '.svg': ['@svgr/webpack'],
      },
    },
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig