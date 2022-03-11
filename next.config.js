/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["rb.gy", "pbs.twimg.com", "lh3.googleusercontent.com"],
  },
};

module.exports = nextConfig;
