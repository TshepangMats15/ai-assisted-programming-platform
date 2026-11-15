
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../constants/theme";

const THEME_STORAGE_KEY = "devmate-theme";

type ThemeMode = "light" | "dark";

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

// Use the same keys as the light theme,
// but allow different string values.
type ThemeColors = {
  [K in keyof typeof lightColors]: string;
};

type ThemeContextType = {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<
  ThemeContextType | undefined
>(undefined);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    let mounted = true;

    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(
          THEME_STORAGE_KEY
        );

        if (
          mounted &&
          (savedTheme === "light" || savedTheme === "dark")
        ) {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error(
          "Failed to load saved theme:",
          error
        );
      }
    };

    void loadSavedTheme();

    return () => {
      mounted = false;
    };
  }, []);

  const isDark = theme === "dark";

  const colors: ThemeColors = isDark
    ? darkColors
    : lightColors;

  const toggleTheme = () => {
    const nextTheme: ThemeMode =
      theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);

    AsyncStorage.setItem(
      THEME_STORAGE_KEY,
      nextTheme
    ).catch((error) => {
      console.error(
        "Failed to save theme preference:",
        error
      );
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

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useAppTheme must be used inside ThemeProvider"
    );
  }

  return context;
}
