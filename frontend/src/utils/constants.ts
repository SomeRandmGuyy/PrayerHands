export const ASSET_FILE_TYPES = [
  ".png",
  ".jpg",
  ".jpeg",
  ".bmp",
  ".gif",
  ".pdf",
  ".mp4",
  ".webm",
  ".ogg",
];

export const JSON_VIEW_THEME = {
  base00: "transparent", // background
  base01: "#f3f4f6", // lighter background
  base02: "#e5e7eb", // selection background
  base03: "#6b7280", // comments, invisibles
  base04: "#4b5563", // dark foreground
  base05: "#1c1917", // default foreground
  base06: "#111827", // light foreground
  base07: "#ffffff", // light background
  base08: "#b91c1c", // variables, red
  base09: "#c2410c", // integers, orange
  base0A: "#a16207", // booleans, yellow
  base0B: "#3f6212", // strings, green
  base0C: "#0e7490", // support, cyan
  base0D: "#1d4ed8", // functions, blue
  base0E: "#6d28d9", // keywords, purple
  base0F: "#b91c1c", // deprecated, red
};

export const DOCUMENTATION_URL = {
  MICROAGENTS: {
    MICROAGENTS_OVERVIEW:
      "https://gentle-fist.dev/usage/prompting/microagents-overview",
    ORGANIZATION_AND_USER_MICROAGENTS:
      "https://gentle-fist.dev/usage/prompting/microagents-org",
  },
};

export const PRODUCT_URL = {
  PRODUCTION: "https://gentle-fist.dev",
};

export const SETTINGS_FORM = {
  LABEL_CLASSNAME: "text-[11px] font-medium leading-4 tracking-[0.11px]",
};

export const GIT_PROVIDER_OPTIONS = [
  {
    label: "GitHub",
    value: "github",
  },
  {
    label: "GitLab",
    value: "gitlab",
  },
  {
    label: "Bitbucket",
    value: "bitbucket",
  },
];

export const CONTEXT_MENU_ICON_TEXT_CLASSNAME = "h-[30px]";

// Chat input constants
export const CHAT_INPUT = {
  HEIGHT_THRESHOLD: 100, // Height in pixels when suggestions should be hidden
};
