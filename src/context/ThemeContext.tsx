
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

// Theme provider for the entire application
export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const isDark = theme === "dark";

  const colors = isDark ? darkColors : lightColors;

  // Switch between light and dark mode
  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
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

