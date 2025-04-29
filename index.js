/**
 * Application Entry Point
 *
 * Registers the main App component with Expo's root component registry.
 * This file is the first code executed when the application starts and
 * serves as the bridge between React Native and the native platforms.
 */

// Expo registration utility
import { registerRootComponent } from "expo";

// Main application component
import App from "./App";

// Register the App component as the root component
// This ensures proper setup in both Expo Go and native builds
registerRootComponent(App);
