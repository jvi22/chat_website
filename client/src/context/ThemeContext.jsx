import { createContext, useContext, useState, useEffect } from 'react';

// 1. Create context with default value
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => console.warn('No theme provider available'),
});

// 2. Enhanced provider with error boundaries
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
      setIsReady(true);
    } catch (error) {
      console.error('Failed to load theme:', error);
      setIsReady(true); // Continue anyway with default theme
    }
  }, []);

  const toggleTheme = () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  // 3. Wait until theme is loaded from localStorage
  if (!isReady) {
    return null; // Or loading spinner
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggleTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// 4. Safer hook with better error messaging
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error(
      'useTheme must be used within a ThemeProvider\n' +
      'Make sure you have wrapped your app with <ThemeProvider> in main.jsx\n' +
      'Example:\n\n' +
      'import { ThemeProvider } from "./context/ThemeContext";\n\n' +
      'createRoot(document.getElementById("root")).render(\n' +
      '  <ThemeProvider>\n' +
      '    <App />\n' +
      '  </ThemeProvider>\n' +
      ');'
    );
  }

  return context;
};