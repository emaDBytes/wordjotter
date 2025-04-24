import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request notification permissions
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

// Check if permissions are granted
export const checkNotificationPermissions = async () => {
  if (!Device.isDevice) return false;

  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
};

// Schedule a daily reminder at a specific time
export const scheduleDailyReminder = async (hour, minute, title, body) => {
  // Cancel any existing notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Create a date object for the next accurrence of this time
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

// Cancel all scheduled notifications
export const cancelAllReminders = async () => {
  try {
    return await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error canceling notifications:", error);
    return false;
  }
};

// Get all scheduled notifications
export const getScheduledReminders = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return [];
  }
};
