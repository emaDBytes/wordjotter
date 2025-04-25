/**
 * Notification Service
 *
 * Provides functionality for handling app notifications, including requesting permissions,
 * scheduling daily reminders, and managing notification settings. Uses Expo's notification
 * system to create a consistent reminder experience across platforms.
 *
 * @module services/notificationService
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

/**
 * Configure how notifications appear when the app is in the foreground.
 * Shows alerts, plays sounds, but doesn't set badge numbers.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Requests permission to send notifications to the user.
 * Only works on physical devices, not on simulators.
 *
 * @returns {Promise<boolean>} True if permission is granted, false otherwise
 */
export const requestNotificationPermissions = async () => {
  if (!Device.isDevice) {
    console.log("Must use physical device for notifications");
    return false;
  }

  // First check existing status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  // If we already have permission, we're good to go
  if (existingStatus === "granted") {
    return true;
  }

  // Otherwise, ask the user for permission
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

/**
 * Checks if notification permissions are currently granted.
 * Used to determine if reminders can be scheduled.
 *
 * @returns {Promise<boolean>} True if permission is granted, false otherwise
 */
export const checkNotificationPermissions = async () => {
  if (!Device.isDevice) return false;

  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
};

/**
 * Schedules a daily reminder notification at a specific time.
 * Cancels any existing notifications before scheduling a new one.
 *
 * @param {number} hour - Hour of the day to send notification (0-23)
 * @param {number} minute - Minute of the hour to send notification (0-59)
 * @param {string} title - Title to display in the notification
 * @param {string} body - Main content text of the notification
 * @returns {Promise<string|null>} Notification identifier if scheduled successfully, null otherwise
 */
export const scheduleDailyReminder = async (hour, minute, title, body) => {
  // Cancel any existing notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Create a date object for the next occurrence of this time
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(hour, minute, 0, 0); // including seconds and milliseconds

  // If the scheduled time is earlier today, set it for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  console.log("Scheduling notification for: ", scheduledTime.toDateString());

  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: title || "Time to learn some words!",
        body: body || "Review your vocabulary to improve retention.",
        data: { type: "daily_reminder" },
        sound: "reminder.wav",
      },
      trigger: scheduledTime,
    });
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return null;
  }
};

/**
 * Cancels all scheduled notifications.
 * Used when disabling reminders or before scheduling new ones.
 *
 * @returns {Promise<boolean>} True if cancellation succeeds, false otherwise
 */
export const cancelAllReminders = async () => {
  try {
    return await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error canceling notifications:", error);
    return false;
  }
};

/**
 * Retrieves all currently scheduled notifications.
 * Useful for debugging or checking if reminders are active.
 *
 * @returns {Promise<Array>} Array of scheduled notification objects
 */
export const getScheduledReminders = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return [];
  }
};
