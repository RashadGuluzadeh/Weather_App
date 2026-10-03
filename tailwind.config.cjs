/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drop: {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "30%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(6px)" },
        },
        flake: {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "30%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(8px)" },
        },
        drift: {
          "0%, 100%": { transform: "translateX(-2px)" },
          "50%": { transform: "translateX(2px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        flash: {
          "0%, 70%, 100%": { opacity: "1" },
          "75%, 85%": { opacity: "0.2" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out both",
        "spin-slow": "spin 24s linear infinite",
        drop: "drop 1.2s linear infinite",
        flake: "flake 2.4s linear infinite",
        drift: "drift 4s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        twinkle: "twinkle 2.5s ease-in-out infinite",
        flash: "flash 3s linear infinite",
      },
    },
  },
  plugins: [],
};
