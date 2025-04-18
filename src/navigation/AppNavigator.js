import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Import Scrwwns
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import MyWordsScreen from "../screens/MyWordsScreen";
import FlashcardScreen from "../screens/FlashcardScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
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
              iconName = focused ? "card" : "card-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="My Words" component={MyWordsScreen} />
        <Tab.Screen name="Flashcards" component={FlashcardScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
