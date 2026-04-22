/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Désactiver le linting pendant le build en production
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Désactiver la vérification TypeScript pendant le build en production
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['192.168.88.17'],
}

module.exports = nextConfig;
