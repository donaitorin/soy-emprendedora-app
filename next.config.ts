import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera .next/standalone con solo lo necesario para correr en Docker.
  output: "standalone",
};

export default nextConfig;
