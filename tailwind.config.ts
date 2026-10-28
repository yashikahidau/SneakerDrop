import type { Config } from "tailwindcss";

const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#09090b",
        surface: "#121214",
        border: "#27272a",
        gold: {
          DEFAULT: "#F0D98C",
          deep: "#D3AE37",
        },
      },
      backgroundColor: {
        obsidian: "#09090b",
        surface: "#121214",
      },
      borderColor: {
        obsidian: "#09090b",
        surface: "#121214",
        editorial: "#27272a",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
