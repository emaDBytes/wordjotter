/**
 * App Navigation Component
 *
 * Handles the primary navigation structure of the application using React Navigation.
 * Implements authentication flow and bottom tab navigator for authenticated users.
 *
 * This component serves as the central hub for:
 * - Authentication state-based navigation (Login/SignUp vs Main App)
 * - Screen navigation and user flow management
 * - Global UI elements accessible throughout the app
 * - Cross-screen state coordination for features like quick note capture
 * - User feedback through the Snackbar notification system
 */

// Navigation imports
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// UI and icon imports
import { Ionicons } from "@expo/vector-icons";
import { Snackbar, ActivityIndicator } from "react-native-paper";
import { View, StyleSheet } from "react-native";

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

// Service imports
import { saveQuickNote } from "../services/firestoreService";

// Auth imports
import { useAuth } from "../contexts/AuthContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * AuthStack component for unauthenticated users.
 * Provides Login and SignUp screens.
*
* @returns {React.Component} Stack navigator with auth screens
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
 * MainTabs component for authenticated users.
 * Provides the bottom tab navigation with all app features.
*
* @param {Object} props - Component props
* @param {Function} props.onQuickJotPress - Handler for QuickJot button press
* @returns {React.Component} Tab navigator with main app screens
*/
function MainTabs({ onQuickJotPress }) {
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
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen
        name="QuickJot"
        component={View}
        options={{
          tabBarButton: () => <QuickJotButton onPress={onQuickJotPress} />,
        }}
      />
      <Tab.Screen name="My Words" component={MyWordsScreen} />
      <Tab.Screen name="Flashcards" component={FlashcardScreen} />
      <Tab.Screen name="Reminders" component={ReminderScreen} />
      <Tab.Screen name="Quick Notes" component={QuickNotesScreen} />
    </Tab.Navigator>
  );
}

/**
 * AppNavigator component provides the main navigation structure and global UI elements
*
 * @returns {React.Component} The main navigation container with auth flow and global UI
*/
export default function AppNavigator() {
  const { user } = useAuth();
  // Auth state
  const { isAuthenticated, loading } = useAuth();

  // Modal visibility state
  const [quickJotVisible, setQuickJotVisible] = useState(false);

  // Feedback notification states
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSaveQuickNote = async (noteData) => {
    try {
      await saveQuickNote(user.uid, noteData);
      setSnackbarMessage(`"${noteData.word}" jotted for later!`);
      setSnackbarVisible(true);
    } catch (error) {
      console.error("Error saving quick note:", error);
      setSnackbarMessage("Failed to save note. Please try again.");
      setSnackbarVisible(true);
    }
  };

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <>
          {/* Main app for authenticated users */}
          <MainTabs onQuickJotPress={() => setQuickJotVisible(true)} />

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
        </>
      ) : (
        // Auth screens for unauthenticated users
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});