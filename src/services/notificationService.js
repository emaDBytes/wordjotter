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

// REquest notification permissions
export const requestNotificationPermissions = async () => {
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.getPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for notifications!");
      return false;
    }
    return true;
  } else {
    console.log("Must use physical device for notifications");
    return false;
  }
};

// Check if permissions are granted
export const checkNotificationPermissions = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
};

// Schedule a daily reminder at a specific time
export const scheduleDailyReminder = async (
  hour,
  maxSpeechInputLength,
  Title,
  body
) => {
  // Cancel any existing notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  const trigger = {
    hour: hour,
    minute: minute,
    repeats: true,
  };

  return await Notifications.scheduleNotificationAsync({
    content: {
      title: title || "Time to learn some words!",
      body: body || "Review you r vocabulary to improve retention.",
      data: { type: "daily_reminder" },
    },
    trigger,
  });
};

// Cancel all scheduled notifications
export const cancelAllReminders = async () => {
  return await Notifications.cancelAllScheduledNotificationsAsync();
};

// get all scheduled notifications
export const getScheduledReminders = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};
