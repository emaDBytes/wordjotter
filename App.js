/**
 * Main Application Component
 *
 * Serves as the entry point for the WordJotter application.
 * Configures global providers, initializes the database, and renders
 * the main navigation structure.
 */

// React and core imports
import React, { useEffect } from "react";

// UI and theming imports
import { Provider as PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";

// Application components and services
import AppNavigator from "./src/navigation/AppNavigator";
import { appTheme } from "./src/styles/theme";
import { initDatabase } from "./src/services/databaseService";

/**
 * App component is the root component of the application.
 * It initializes the database on first render and wraps the application
 * in the necessary providers for theming and navigation.
 *
 * @returns {React.Component} The root application component
 */
export default function App() {
  // Initialize database on app's start
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <PaperProvider theme={appTheme}>
      {/* Status bar configuration */}
      <StatusBar style="auto" />

      {/* Main navigation structure */}
      <AppNavigator />
    </PaperProvider>
  );
}
