import React, { useEffect } from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";

import AppNavigator from "./src/navigation/AppNavigator";
import { appTheme } from "./src/styles/theme";
import { initDatabase } from "./src/services/databaseService";

export default function App() {
  // Initialize database on app's start
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <PaperProvider theme={appTheme}>
      <StatusBar style="auto" />
      <AppNavigator />
    </PaperProvider>
  );
}
