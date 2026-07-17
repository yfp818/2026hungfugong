import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      // ✨ 加入這段：強制將 Tailwind 的 font-serif 指向我們載入的 Noto Serif TC
      fontFamily: {
        serif: ['var(--font-noto-serif)', 'serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;