import React, { useState, useEffect } from "react";
import { StyleSheet, View, Platform } from "react-native";
import {
  Text,
  Switch,
  Button,
  TextInput,
  Card,
  Snackbar,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelAllReminders,
} from "../services/notificationService";

import {
  saveReminderSetting,
  getReminderSettings,
} from "../services/databaseService";
import { isEnabled } from "react-native/Libraries/Performance/Systrace";

export default function ReminderScreen() {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Load saved settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getReminderSettings();

    setEnabled(settings.enabled);

    // set time from hours and minutes
    const newTime = new Date();
    newTime.setHours(settings.hour);
    newTime.setMinutes(settings.minute);
    setTime(newTime);
  };

  const toggleSwitch = async (value) => {
    setEnabled(value);

    if (value) {
      // Request permissions if enabling reminders
      const hasPermission = await requestNotificationPermissions();

      if (!hasPermission) {
        setSnackbarMessage(
          "Notification permission denied. Cannot enable reminders."
        );
        setSnackbarVisible(true);
        setEnabled(false);
        return;
      }
    }

    // save teh new settings
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
    await saveReminderSettings({
      enabled: isEnabled,
      hour,
      minute,
    });

    // Scheduke or cancel notifications
    if (isEnabled) {
      await scheduleDailyReminder(
        hour,
        minute,
        "Time to practice with WordJotter!",
        "A few minutes of review will help you remember these words forever."
      );

      setSnackbarMessage(
        `Daily remindr set for ${hour}:${minute < 10 ? "0" + minute : minute}`
      );
    } else {
      await cancelAllReminders();
      setSnackbarMessage("Reminder disabled");
    }

    setSnackbarVisible(true);
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
});
