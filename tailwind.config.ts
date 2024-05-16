import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "custom-radial":
          "radial-gradient(circle farthest-corner at 48.4% 47.5%, rgba(77, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 90%)",
        "custom-home":
          "radial-gradient(circle farthest-corner at 48.4% 47.5%, rgba(21, 83, 161, 1) 0%, rgba(0, 0, 0, 1) 90%)",
      },
    },
  },
  plugins: [require("daisyui")],
};
export default config;
