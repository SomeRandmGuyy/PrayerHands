import { heroui } from "@heroui/react";

export default heroui({
  defaultTheme: "light",
  layout: {
    radius: {
      small: "5px",
      large: "20px",
    },
  },
  themes: {
    light: {
      colors: {
        background: "#ffffff",
        foreground: "#1c1917",
        primary: {
          DEFAULT: "#1f4b99",
          foreground: "#ffffff",
        },
        content1: "#ffffff",
        content2: "#f7f8fa",
        content3: "#eef1f4",
        content4: "#e7ebf0",
        default: {
          DEFAULT: "#f7f8fa",
          foreground: "#1c1917",
        },
        divider: "#d5dbe3",
      },
    },
  },
});
