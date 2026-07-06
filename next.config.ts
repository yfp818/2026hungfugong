import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['172.20.10.2'], // 加入這行，允許您的手機 IP 連線
};

export default nextConfig;