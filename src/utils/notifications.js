import messaging from './firebaseMessaging';
import { PermissionsAndroid, Platform } from 'react-native';

export async function requestNotificationPermission() {
  if (Platform.OS === 'web') return false;

  try {
    // 1. Request Android 13+ Notification Permission if applicable
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (!hasPermission) {
        const status = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return status === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }

    // 2. Request FCM Permission (iOS/macOS and general FCM status registration)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return enabled;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export async function registerForFCMAsync() {
  if (Platform.OS === 'web') return null;

  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission was denied');
      return null;
    }

    // Fetch FCM Token
    const token = await messaging().getToken();
    console.log('Retrieved FCM Token for Restaurant:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

export async function saveFCMTokenToBackend(restId, token) {
  if (!restId) return;

  try {
    const payload = { restId, fcmToken: token || "" };
    console.log(`Sending FCM token to backend for restId: ${restId}, token: ${token ? 'exists' : 'empty (deleting)'}`);

    const response = await fetch('https://restuarentbackend-production.up.railway.app/update-fcm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Failed to save FCM token on backend:', response.status);
    } else {
      console.log('FCM token status successfully synchronized with backend');
    }
  } catch (error) {
    console.error('Error saving FCM token to backend:', error);
  }
}

export async function deleteFCMTokenOnBackend(restId) {
  try {
    if (Platform.OS !== 'web') {
      await messaging().deleteToken();
      console.log('FCM token deleted locally on device.');
    }
  } catch (error) {
    console.error('Error deleting FCM token locally on device:', error);
  }

  if (restId) {
    // Passing null/empty token will clear it on the backend
    await saveFCMTokenToBackend(restId, "");
  }
}

/**
 * Checks if notification permission is currently granted without prompting the user.
 * Returns true if granted, false otherwise.
 */
export async function checkNotificationPermission() {
  if (Platform.OS === 'web') return true;

  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        return await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      }
      // Below Android 13 (API 33), notification permissions are enabled by default at install
      return true;
    }

    // iOS/macOS FCM permission check
    const authStatus = await messaging().hasPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
}
