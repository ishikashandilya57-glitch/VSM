import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  output: 'standalone',
  typescript: {
    tsconfigPath: './tsconfig.json',
  }
};

export default nextConfig;
