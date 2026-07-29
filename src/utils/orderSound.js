import { NativeModules, Platform } from "react-native";

const { OrderSoundModule } = NativeModules;

export function playOrderSound() {
  try {
    if (Platform.OS === "android" && OrderSoundModule) {
      OrderSoundModule.playOrderSoundLoop();
    }
  } catch (error) {
    console.error("Error starting order sound loop:", error);
  }
}

export function stopOrderSound() {
  try {
    if (Platform.OS === "android" && OrderSoundModule) {
      OrderSoundModule.stopOrderSoundLoop();
    }
  } catch (error) {
    console.error("Error stopping order sound loop:", error);
  }
}

export function createNotificationChannel() {
  try {
    if (Platform.OS === "android" && OrderSoundModule) {
      OrderSoundModule.createNotificationChannel();
    }
  } catch (error) {
    console.error("Error creating notification channel:", error);
  }
}
