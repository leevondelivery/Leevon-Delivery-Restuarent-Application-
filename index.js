import '@expo/metro-runtime';
import { Platform } from 'react-native';
import messaging from './src/utils/firebaseMessaging';
import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';

import { playOrderSound } from './src/utils/orderSound';

// Register background handler for FCM
// This handler receives a message when the app is in the background or quit state.
if (Platform.OS !== 'web') {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Background Order Notification:', remoteMessage);
    playOrderSound();
  });
}

// Render the root component
renderRootComponent(App);
