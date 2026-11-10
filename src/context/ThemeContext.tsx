
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../constants/theme";

const THEME_STORAGE_KEY = "devmate-theme";

const lightColors = {
  ...Colors.light,
  primary: "#2563EB",
  border: "#E5E7EB",
};

const darkColors = {
  ...Colors.dark,
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

// Theme provider for the entire application
export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedTheme) => {
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }
    });
  }, []);

  const isDark = theme === "dark";
  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      return nextTheme;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        colors,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Hook used by screens to access theme information
export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useAppTheme must be used inside ThemeProvider"
    );
  }

  return context;
}

