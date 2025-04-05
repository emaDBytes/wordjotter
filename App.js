import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";
import { appTheme } from "./src/styles/theme";

export default function App() {
  return (
    <PaperProvider theme={appTheme}>
      <StatusBar style="auto" />
      <AppNavigator />
    </PaperProvider>
  );
}
