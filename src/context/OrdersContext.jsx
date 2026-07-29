import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { router } from "expo-router";
import messaging from "../utils/firebaseMessaging";
import { registerForFCMAsync, saveFCMTokenToBackend } from "../utils/notifications";
import { playOrderSound, stopOrderSound, createNotificationChannel } from "../utils/orderSound";

const OrdersContext = createContext(null);

const getApiUrl = () => {
  return "https://restuarentbackend-production.up.railway.app";
};

const API_URL = getApiUrl();

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [incomingCount, setIncomingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async (isPolling = false) => {
    try {
      const storedRestId = await AsyncStorage.getItem("restId");
      if (!storedRestId) {
        if (isPolling) return;
        throw new Error("No restaurant ID found. Please log in again.");
      }

      if (storedRestId === "demo_rest_101") {
        setOrders([]);
        setIncomingCount(1); // Demo mock
        setError(null);
        setLoading(false);
        return;
      }

      console.log(`Global polling: fetching accepted orders for restaurantId: ${storedRestId} from ${API_URL}`);
      const res = await fetch(`${API_URL}/accepted-orders/${storedRestId}`);
      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setError(null);
      } else {
        throw new Error(data.message || "Failed to fetch orders from server");
      }

      // Fetch incoming orders count
      try {
        const incomingRes = await fetch(`${API_URL}/incoming-orders/${storedRestId}`);
        if (incomingRes.ok) {
          const incomingData = await incomingRes.json();
          if (incomingData.success) {
            setIncomingCount(incomingData.orders?.length || 0);
          }
        }
      } catch (incomingErr) {
        console.log("Global polling error fetching incoming orders count:", incomingErr.message);
      }
    } catch (err) {
      if (isPolling) {
        console.log("Polling error (silent):", err.message);
      } else {
        console.log("Error fetching accepted orders globally:", err.message);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchOrders(false);

    // Continuous 24/7 background polling every 5 seconds
    const intervalId = setInterval(() => {
      fetchOrders(true);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  useEffect(() => {
    let isMounted = true;
    let unsubscribeMessage = null;
    let unsubscribeTokenRefresh = null;
    let unsubscribeNotificationOpened = null;

    const setupNotifications = async () => {
      try {
        const storedRestId = await AsyncStorage.getItem("restId");
        if (!storedRestId || storedRestId === "N/A") return;

        // Register for push notifications and get FCM token
        const token = await registerForFCMAsync();
        if (token && isMounted) {
          await saveFCMTokenToBackend(storedRestId, token);
        }

        // Handle token refresh dynamically
        unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
          if (isMounted) {
            console.log('FCM Token Refreshed for Restaurant:', newToken);
            await saveFCMTokenToBackend(storedRestId, newToken);
          }
        });

        // Listen to messages received in the foreground
        unsubscribeMessage = messaging().onMessage(async (remoteMessage) => {
          if (isMounted) {
            console.log('Foreground Message received:', remoteMessage);
            // Refetch orders immediately
            fetchOrders(true);
          }
        });

        // Handle when a notification is clicked while the app is in the background
        unsubscribeNotificationOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
          if (isMounted) {
            console.log('Notification caused app to open from background:', remoteMessage);
            router.push('/main/notifications');
          }
        });

        // Check if the app was opened from a completely closed (quit state) via a notification
        messaging()
          .getInitialNotification()
          .then((remoteMessage) => {
            if (remoteMessage && isMounted) {
              console.log('Notification caused app to open from quit state:', remoteMessage);
              router.push('/main/notifications');
            }
          });

      } catch (error) {
        console.error('Failed to setup FCM notifications in OrdersContext:', error);
      }
    };

    setupNotifications();

    return () => {
      isMounted = false;
      if (unsubscribeMessage) unsubscribeMessage();
      if (unsubscribeTokenRefresh) unsubscribeTokenRefresh();
      if (unsubscribeNotificationOpened) unsubscribeNotificationOpened();
    };
  }, [fetchOrders]);

  useEffect(() => {
    createNotificationChannel();
  }, []);

  useEffect(() => {
    if (incomingCount > 0) {
      console.log("Incoming orders pending globally:", incomingCount, "Starting order sound loop.");
      playOrderSound();
    } else {
      console.log("No pending incoming orders globally. Stopping order sound loop.");
      stopOrderSound();
    }
  }, [incomingCount]);

  return (
    <OrdersContext.Provider value={{ orders, incomingCount, setIncomingCount, loading, error, refetch: () => fetchOrders(false) }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}
