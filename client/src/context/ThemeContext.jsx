import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => console.warn('No theme provider available'),
});

export const ThemeProvider = ({ children }) => {
  // ... provider implementation ...
};

// Only ONE useTheme export in the file
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};