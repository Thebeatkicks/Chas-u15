import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-badgen ("N" i hörnet) överlappar det svävande sidofältet/inputen
  // från UI-omgörningen i #28 — döljs istf att designas runt.
  devIndicators: false,
};

export default nextConfig;
