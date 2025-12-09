/**
 * App Navigation Component
 *
 * Handles the primary navigation structure of the application using React Navigation.
 * Implements authentication flow and bottom tab navigator for authenticated users.
 */

import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet } from "react-native";
import { Snackbar, ActivityIndicator } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

// Screen imports
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import MyWordsScreen from "../screens/MyWordsScreen";
import FlashcardScreen from "../screens/FlashcardScreen";
import ReminderScreen from "../screens/ReminderScreen";
import QuickNotesScreen from "../screens/QuickNotesScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";

// Component imports
import QuickJotButton from "../components/QuickJotButton";
import QuickJotModal from "../components/QuickJotModal";

// Service imports - SUPABASE
import { saveQuickNote } from "../services/supabaseService";

// Auth imports
import { useAuth } from "../contexts/AuthContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * AuthStack for unauthenticated users
 */
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

/**
 * MainTabs for authenticated users
 */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Search") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "My Words") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "Flashcards") {
            iconName = focused ? "albums" : "albums-outline";
          } else if (route.name === "Reminders") {
            iconName = focused ? "notifications" : "notifications-outline";
          } else if (route.name === "Quick Notes") {
            iconName = focused ? "document-text" : "document-text-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "gray",
        headerShown: true,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="My Words" component={MyWordsScreen} />
      <Tab.Screen name="Flashcards" component={FlashcardScreen} />
      <Tab.Screen name="Reminders" component={ReminderScreen} />
      <Tab.Screen name="Quick Notes" component={QuickNotesScreen} />
    </Tab.Navigator>
  );
}

/**
 * Root Navigator Component
 */
const AppNavigator = () => {
  const { user, loading } = useAuth();

  // Modal visibility state
  const [quickJotVisible, setQuickJotVisible] = useState(false);

  // Feedback notification states
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Handle saving quick note - USES user.id FOR SUPABASE
  const handleSaveQuickNote = async (noteData) => {
    try {
      await saveQuickNote(user.id, noteData);
      setSnackbarMessage(`"${noteData.word}" jotted for later!`);
      setSnackbarVisible(true);
    } catch (error) {
      console.error("Error saving quick note:", error);
      setSnackbarMessage("Failed to save note. Please try again.");
      setSnackbarVisible(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <View style={{ flex: 1 }}>
          <MainTabs />

          {/* Floating Quick Jot Button - appears on all screens */}
          <QuickJotButton onPress={() => setQuickJotVisible(true)} />

          {/* Global Quick Jot Modal */}
          <QuickJotModal
            visible={quickJotVisible}
            onDismiss={() => setQuickJotVisible(false)}
            onSave={(noteData) => {
              handleSaveQuickNote(noteData);
              setQuickJotVisible(false);
            }}
          />

          {/* Global Snackbar for feedback */}
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
        </View>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default AppNavigator;