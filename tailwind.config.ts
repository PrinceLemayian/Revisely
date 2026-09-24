import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        cloud: "#f5f7f7",
        spruce: "#0f766e",
        navy: "#092f3b",
        mint: "#e7f6f2",
        coral: "#d95f4c",
        amberline: "#f5b84b"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(23, 32, 38, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
