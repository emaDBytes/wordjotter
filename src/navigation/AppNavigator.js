/**
 * App Navigation Component
 *
 * Handles the primary navigation structure of the application using React Navigation.
 * Implements a bottom tab navigator that connects all major screens of the app and
 * manages the global application state for features like Quick Jot.
 *
 * This component serves as the central hub for:
 * - Screen navigation and user flow management
 * - Global UI elements accessible throughout the app
 * - Cross-screen state coordination for features like quick note capture
 * - User feedback through the Snackbar notification system
 *
 * The navigation structure defines the app's information architecture and
 * establishes relationships between different functional areas.
 */

// Navigation imports
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// UI and icon imports
import { Ionicons } from "@expo/vector-icons";
import { Snackbar } from "react-native-paper";

// Screen imports
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import MyWordsScreen from "../screens/MyWordsScreen";
import FlashcardScreen from "../screens/FlashcardScreen";
import ReminderScreen from "../screens/ReminderScreen";
import QuickNotesScreen from "../screens/QuickNotesScreen";

// Component imports
import QuickJotButton from "../components/QuickJotButton";
import QuickJotModal from "../components/QuickJotModal";

// Service imports
import { saveQuickNote } from "../services/databaseService";

const Tab = createBottomTabNavigator();

/**
 * AppNavigator component provides the main navigation structure and global UI elements
 *
 * @returns {React.Component} The main navigation container with all screen and global UI
 */
export default function AppNavigator() {
  // Modal visibility state
  const [quickJotVisible, setQuickJotVisible] = useState(false);

  // Feedback notification states
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  /**
   * Handles saving a quick note to the database and displays feedback
   *
   * @param {} noteData - Data for the notes to be saved
   * @param {string} noteData.word - The word to save
   * @param {string} noteData.language - Language code ("en" or "fi")
   * @param {string} noteData.notes - Optional context notes
   */
  const HandleSaveQuickNote = async (noteData) => {
    const success = await saveQuickNote(noteData);

    if (success) {
      setSnackbarMessage(`"${noteData.word}" jotted for later!`);
      setSnackbarVisible(true);
    } else {
      setSnackbarMessage("Failed to save note. Please try again.");
      setSnackbarVisible(true);
    }
  };

  return (
    <NavigationContainer>
      {/* Main tab navigation */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            // Determine appropriate icon based on route name and focus state
            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Search") {
              iconName = focused ? "search" : "search-outline";
            } else if (route.name === "My Words") {
              iconName = focused ? "book" : "book-outline";
            } else if (route.name === "Flashcards") {
              iconName = focused ? "card" : "card-outline";
            } else if (route.name === "Settings") {
              iconName = focused ? "notifications" : "notifications-outline";
            } else if (route.name === "Quick Notes") {
              iconName = focused ? "pencil" : "pencil-outline";
            }

            // Return the appropriate icon component
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        {/* Home and dashboard screen */}
        <Tab.Screen name="Home" component={HomeScreen} />

        {/* Dictionary search screen */}
        <Tab.Screen name="Search" component={SearchScreen} />

        {/* Saved vocabulary management screen */}
        <Tab.Screen name="My Words" component={MyWordsScreen} />

        {/* Quick notes management screen */}
        <Tab.Screen name="Quick Notes" component={QuickNotesScreen} />

        {/* Vocabulary learning screen */}
        <Tab.Screen name="Flashcards" component={FlashcardScreen} />

        {/* App settings and notifications screen */}
        <Tab.Screen name="Settings" component={ReminderScreen} />
      </Tab.Navigator>

      {/* Global Quick Jot functionality - available across the app */}
      <QuickJotButton onPress={() => setQuickJotVisible(true)} />

      {/* Modal dialog for entering quick notes */}
      <QuickJotModal
        visible={quickJotVisible}
        onDismiss={() => setQuickJotVisible(false)}
        onSave={HandleSaveQuickNote}
      />

      {/* Feedback snackbar for user actions */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </NavigationContainer>
  );
}
