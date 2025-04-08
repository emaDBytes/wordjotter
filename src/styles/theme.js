import { DefaultTheme, Surface } from "react-native-paper";

export const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#6200ee",
    accent: "#03dac4",
    background: "#f8f8f8",
    surface: "#ffffff",
    text: "#333333",
    placeholder: "#8a8a8a",
    backdrop: "rgba(0, 0, 0, 0.5)",
    notification: "#f50057",
  },
  fonts: {
    ...DefaultTheme.fonts,
  },
  roundness: 8,
};
