/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    VOLTAGE_API_URL: process.env.VOLTAGE_API_URL,
    VOLTAGE_API_KEY: process.env.VOLTAGE_API_KEY,
    VOLTAGE_ORGANIZATION_ID: process.env.VOLTAGE_ORGANIZATION_ID,
    VOLTAGE_ENVIRONMENT_ID: process.env.VOLTAGE_ENVIRONMENT_ID,
    VOLTAGE_LINE_OF_CREDIT_ID: process.env.VOLTAGE_LINE_OF_CREDIT_ID,
    VOLTAGE_NETWORK: process.env.VOLTAGE_NETWORK,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

};

export default nextConfig; 