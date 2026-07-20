import { NativeModules, Platform } from 'react-native';

const { BatteryOptimizationModule } = NativeModules;

/**
 * Checks if battery optimization is enabled (meaning the app is optimized and background tasks are restricted).
 * On Android, if battery optimization is enabled, it returns true.
 * Returns false on all other platforms or if the check fails.
 */
export async function isBatteryOptimizationEnabled() {
  if (Platform.OS !== 'android') return false;
  
  try {
    if (!BatteryOptimizationModule) {
      console.warn("BatteryOptimizationModule is not registered natively.");
      return false;
    }
    return await BatteryOptimizationModule.isBatteryOptimizationEnabled();
  } catch (error) {
    console.error("Error checking battery optimization status:", error);
    return false;
  }
}

/**
 * Requests the OS to ignore battery optimizations for the app (whitelists the app as "No restrictions").
 * On Android, this opens the native system request dialog.
 * Does nothing on other platforms.
 */
export function requestIgnoreBatteryOptimization() {
  if (Platform.OS !== 'android') return;

  try {
    if (!BatteryOptimizationModule) {
      console.warn("BatteryOptimizationModule is not registered natively.");
      return;
    }
    BatteryOptimizationModule.requestIgnoreBatteryOptimization();
  } catch (error) {
    console.error("Error requesting battery optimization ignore:", error);
  }
}
