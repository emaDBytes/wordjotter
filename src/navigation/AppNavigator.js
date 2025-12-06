/**
 * App Navigator for WordJotter
 * 
 * Handles navigation structure with authentication flow.
 * Shows auth screens when logged out, main tabs when logged in.
 * 
 * @module navigation/AppNavigator
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../contexts/AuthContext';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

// Main App Screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import MyWordsScreen from '../screens/MyWordsScreen';
import QuickNotesScreen from '../screens/QuickNotesScreen';
import FlashcardScreen from '../screens/FlashcardScreen';
import ReminderScreen from '../screens/ReminderScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Authentication Stack Navigator
 */
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

/**
 * Main Tab Navigator for authenticated users
 */
const MainTabs = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'magnify' : 'magnify';
              break;
            case 'MyWords':
              iconName = focused ? 'book-open-page-variant' : 'book-open-page-variant-outline';
              break;
            case 'QuickNotes':
              iconName = focused ? 'lightning-bolt' : 'lightning-bolt-outline';
              break;
            case 'Flashcards':
              iconName = focused ? 'cards' : 'cards-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="MyWords" component={MyWordsScreen} options={{ title: 'My Words' }} />
      <Tab.Screen name="QuickNotes" component={QuickNotesScreen} options={{ title: 'Quick Notes' }} />
      <Tab.Screen name="Flashcards" component={FlashcardScreen} />
    </Tab.Navigator>
  );
};

/**
 * Main App Stack (includes tabs + modal screens)
 */
const AppStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MainTabs"
      component={MainTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Reminders"
      component={ReminderScreen}
      options={{ title: 'Study Reminders' }}
    />
  </Stack.Navigator>
);

/**
 * Root Navigator Component
 */
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;