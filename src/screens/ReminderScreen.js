import React, { useState, useEffect } from "react";
import { StyleSheet, View, Platform, Alert } from "react-native";
import { Text, Switch, Button, Card, Snackbar } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

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
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [hasPermission, setHasPermission] = useState(false);

  // Load saved settings and check permissions on component mount
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

    // update state and save settings
    setEnabled(value);
    await saveSettings(value, time);
  };

  const onTimeChange = (event, selectTime) => {
    setShowTimePicker(false);

    if (selectTime) {
      setTime(selectTime);
      saveSettings(enabled, selectTime);
    }
  };

  const saveSettings = async (isEnabled, selectTime) => {
    const hour = selectTime.getHours();
    const minute = selectTime.getMinutes();

    // Save to database
    await saveReminderSetting({
      enabled: isEnabled,
      hour,
      minute,
    });

    // Scheduke or cancel notifications
    if (isEnabled && hasPermission) {
      await scheduleDailyReminder(
        hour,
        minute,
        "Time to practice with WordJotter!",
        "A few minutes of review will help you remember these words forever."
      );

      setSnackbarMessage(
        `Daily remindr set for ${hour}:${minute < 10 ? "0" + minute : minute}`
      );
    } else if (!isEnabled) {
      await cancelAllReminders();
      setSnackbarMessage("Reminder disabled");
    }

    setSnackbarVisible(true);
  };

  // debugging function
  const debugPermissions = async () => {
    const currentPermission = await checkNotificationPermissions();
    console.log("Current permission status: ", currentPermission);
    Alert.alert(
      "Permission Status",
      `Current permission: ${currentPermission}`
    );
  };

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
      <Card style={styles.card}>
        <Card.Title title="Study Reminders" />
        <Card.Content>
          <View style={styles.switchContainer}>
            <Text>Enable daily reminders</Text>
            <Switch value={enabled} onValueChange={toggleSwitch} />
          </View>

          {enabled && (
            <View style={styles.timeContainer}>
              <Text>Reminder time:</Text>
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

          <Text style={styles.infoText}>
            Daily reminders help build a consistent Study habit and improve your
            vocabulary retention,
          </Text>
        </Card.Content>
      </Card>

      {/* debugging in development */}
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
