/**
 * ReminderScreen Component
 *
 * Manages study reminder settings for the vocabulary learning application.
 * This screen allows users to:
 * - Enable/disable daily study reminders
 * - Set the specific time for daily notifications
 * - View permission status and manage notification permissions
 *
 * The screen integrates with the expo-notifications system and persists
 * user preferences in the local database for consistent experience across
 * app sessions.
 */

// React and React Native imports
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Platform, Alert } from "react-native";

// UI component imports
import { Text, Switch, Button, Card, Snackbar } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

// Service imports - notification and database functionality
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelAllReminders,
  checkNotificationPermissions,
  getScheduledReminders,
} from "../services/notificationService";
import {
  saveReminderSetting,
  getReminderSettings,
} from "../services/databaseService";

export default function ReminderScreen() {
  // Feature state - controls main reminder functionality
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState(new Date());

  // UI state - controls interface elements
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Permission state - tracks notification authorization
  const [hasPermission, setHasPermission] = useState(false);

  /**
   * Initialize component by checking notification permissions
   * and loading saved reminder settings from the database
   */
  useEffect(() => {
    const checkPermissionsAndLoad = async () => {
      // check if we have notification permissions
      const permissionGranted = await checkNotificationPermissions();
      setHasPermission(permissionGranted);
      console.log("initial permission check: ", permissionGranted);

      // Load settings regardless of permission status
      loadSettings();
    };

    checkPermissionsAndLoad();
  }, []);

  /**
   * Loads reminder settings from the database and updates state
   * Sets the time state based on saved hour and minute values
   * Only enables reminders if both permission is granted and setting is enabled
   */
  const loadSettings = async () => {
    try {
      const settings = await getReminderSettings();
      console.log("Retrieved settings: ", settings);

      // Set the toggle state based on both permission and saved setting
      // Only enable if we have both permission and teh setting is enabled
      setEnabled(settings.enabled && hasPermission);

      // set time from hours and minutes
      const newTime = new Date();
      newTime.setHours(settings.hour);
      newTime.setMinutes(settings.minute);
      setTime(newTime);
    } catch (error) {
      console.error("Error in loading settings: ", error);
    }
  };

  /**
   * Handles the reminder toggle switch state change
   * Requests permission if enabling reminders
   * Updates saved settings and schedules/cancels reminders accordingly
   *
   * @param {boolean} value - New toggle state (true = enabled, false = disabled)
   */
  const toggleSwitch = async (value) => {
    if (value) {
      // only proceed if trying to enable
      const permissionGranted = await requestNotificationPermissions();
      setHasPermission(permissionGranted);

      if (!permissionGranted) {
        setSnackbarMessage(
          "Notification permission denied. Cannot enable reminders."
        );
        setSnackbarVisible(true);
        return;
      }
    }

    // Update state and save settings
    setEnabled(value);
    await saveSettings(value, time);
  };

  /**
   * Handles time picker value changes
   * Updates selected time and saves new settings
   *
   * @param {Object} event - The change event
   * @param {Date/undefined} selectedTime - The new selected time (undefined if canceled)
   */
  const onTimeChange = (event, selectTime) => {
    setShowTimePicker(false);

    if (selectTime) {
      setTime(selectTime);
      saveSettings(enabled, selectTime);
    }
  };

  /**
   * Saves reminder settings to database and schedules/cancels notifications
   * Shows feedback to user via snackbar
   *
   * @param {boolean} isEnabled - Whether reminders are enabled
   * @param {Date} selectedTime - The selected time for reminders
   */
  const saveSettings = async (isEnabled, selectTime) => {
    const hour = selectTime.getHours();
    const minute = selectTime.getMinutes();

    // Save to database
    await saveReminderSetting({
      enabled: isEnabled,
      hour,
      minute,
    });

    // Schedule or cancel notifications
    if (isEnabled && hasPermission) {
      await scheduleDailyReminder(
        hour,
        minute,
        "Time to practice with WordJotter!",
        "A few minutes of review will help you remember these words forever."
      );

      setSnackbarMessage(
        `Daily reminder set for ${hour}:${minute < 10 ? "0" + minute : minute}`
      );
    } else if (!isEnabled) {
      await cancelAllReminders();
      setSnackbarMessage("Reminder disabled");
    }

    setSnackbarVisible(true);
  };

  /**
   * Development-only function for debugging notification permissions
   * Displays the current permission status in an alert
   */
  const debugPermissions = async () => {
    const currentPermission = await checkNotificationPermissions();
    console.log("Current permission status: ", currentPermission);
    Alert.alert(
      "Permission Status",
      `Current permission: ${currentPermission}`
    );
  };

  /**
   * Development-only function for checking scheduled notifications
   * Shows count of scheduled notifications in an alert
   */
  const checkScheduledNotifications = async () => {
    const scheduledNotifications = await getScheduledReminders();
    console.log("Scheduled notifications: ", scheduledNotifications);
    Alert.alert(
      "Scheduled Notifications",
      `Found ${scheduledNotifications.length} notifications`
    );
  };

  return (
    <View style={styles.container}>
      {/* Main settings card */}
      <Card style={styles.card}>
        <Card.Title title="Study Reminders" />
        <Card.Content>
          {/* Main settings card */}
          <View style={styles.switchContainer}>
            <Text>Wake Up My Word Game</Text>
            <Switch value={enabled} onValueChange={toggleSwitch} />
          </View>

          {/* Time picker section - only shown when reminders are enabled */}
          {enabled && (
            <View style={styles.timeContainer}>
              <Text>Hit Me Up At:</Text>
              <Button mode="outlined" onPress={() => setShowTimePicker(true)}>
                {time.getHours()}:
                {time.getMinutes() < 10
                  ? "0" + time.getMinutes()
                  : time.getMinutes()}
              </Button>

              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={onTimeChange}
                />
              )}
            </View>
          )}

          {/* Educational information about reminders */}
          <Text style={styles.infoText}>
            Daily word zaps keep your brain juiced and vocab growing!
          </Text>
        </Card.Content>
      </Card>

      {/* Development-only debugging tools - only visible in development mode */}
      {__DEV__ && (
        <View style={styles.debugButtons}>
          <Button
            mode="contained"
            onPress={debugPermissions}
            style={styles.debugButton}
          >
            Debug Permissions
          </Button>
          <Button
            mode="contained"
            onPress={checkScheduledNotifications}
            style={styles.debugButton}
          >
            Check Scheduled
          </Button>
        </View>
      )}

      {/* Feedback snackbar for user actions */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{ label: "ok", onPress: () => setSnackbarVisible(false) }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  card: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  infoText: {
    marginTop: 16,
    fontStyle: "italic",
    color: "#666",
  },
  debugButton: {
    marginTop: 10,
  },
  debugButtons: {
    marginTop: 20,
  },
});
