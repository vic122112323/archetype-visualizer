/** @type {import('next').NextConfig} */
const repoName = 'archetype-visualizer';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: `/${repoName}`,
  images: { unoptimized: true },
};

module.exports = nextConfig;
