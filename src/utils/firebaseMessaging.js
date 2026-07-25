// In Expo Go, native Firebase modules are unavailable.
// We fall back to the mock so the app can still run locally.
let messaging;
try {
  messaging = require('@react-native-firebase/messaging').default;
  // Test that the native module is actually loaded (throws in Expo Go)
  messaging();
} catch (e) {
  messaging = require('./firebaseMessaging.web').default;
}

export default messaging;
