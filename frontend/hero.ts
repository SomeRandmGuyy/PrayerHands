import { heroui } from "@heroui/react";

export default heroui({
  defaultTheme: "dark",
  layout: {
    radius: {
      small: "5px",
      large: "20px",
    },
  },
  themes: {
    dark: {
      colors: {
        primary: {
          DEFAULT: "#DAFF01",
          foreground: "#2A2A2A",
        },
        secondary: {
          DEFAULT: "#756CF5",
          foreground: "#FEFEFE",
        },
        success: {
          DEFAULT: "#C5FFD6",
          foreground: "#2A2A2A",
        },
        danger: {
          DEFAULT: "#FF6D6D",
          foreground: "#FEFEFE",
        },
        focus: "#756CF5",
      },
    },
  },
});