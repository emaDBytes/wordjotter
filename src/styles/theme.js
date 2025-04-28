/**
 * App Theme Configuration
 *
 * Defines the global theming for the WordJotter application using React Native Paper's
 * theming system. This file centralizes color palette, typography, and other visual
 * styling parameters to ensure consistent design across the application.
 *
 * The theme extends React Native Paper's DefaultTheme with customized colors
 * optimized for a vocabulary learning application, providing a cohesive visual
 * identity throughout the user experience.
 *
 * Developers can modify this theme to:
 * - Adjust the color scheme to match brand guidelines
 * - Update typography settings for better readability
 * - Modify component styling like roundness and elevation
 * - Create light/dark mode variations
 *
 * @module styles/theme
 */

import { DefaultTheme, Surface } from "react-native-paper";

/**
 * Main application theme that extends React Native Paper's DefaultTheme.
 *
 * The theme defines:
 * - Color palette for UI elements (primary, accent, background, etc.)
 * - Typography settings through the fonts object
 * - Global component styling like roundness for corners
 *
 * This theme is applied to the PaperProvider in App.js to affect the entire application.
 */
export const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#6200ee", // Purple - main brand color
    accent: "#03dac4", // Teal - complementary accent
    background: "#f8f8f8", // Light gray - default screen background
    surface: "#ffffff", // White - card and surface elements
    text: "#333333", // Dark gray - primary text color
    placeholder: "#8a8a8a", // Medium gray - placeholder text
    backdrop: "rgba(0, 0, 0, 0.5)", // Semi-transparent black - modal backgrounds
    notification: "#f50057", // Pink - notification indicators
  },
  fonts: {
    ...DefaultTheme.fonts,
    // Font configuration is inherited from DefaultTheme
  },
  roundness: 8, // Border radius for components (buttons, cards, etc.)
};
