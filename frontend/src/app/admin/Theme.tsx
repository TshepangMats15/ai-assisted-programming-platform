import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

// Define the colours for each theme
const lightColors = {
  background: "#FFFFFF",
  backgroundElement: "#F5F5F5",
  backgroundSelected: "#E5E5E5",
  text: "#111111",
  textSecondary: "#777777",
  primary: "#2563EB",
  border: "#E5E7EB",
};

const darkColors = {
  background: "#0D0D0D",
  backgroundElement: "#1A1A1A",
  backgroundSelected: "#292929",
  text: "#FFFFFF",
  textSecondary: "#B0B0B0",
  primary: "#60A5FA",
  border: "#333333",
};

// Define the information stored in the context
type ThemeContextType = {
  theme: "light" | "dark";
  isDark: boolean;
  colors: typeof lightColors;
  toggleTheme: () => void;
};

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

