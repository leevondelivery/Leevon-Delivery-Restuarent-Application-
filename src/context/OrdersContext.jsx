import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from "expo-constants";

const OrdersContext = createContext(null);

const getApiUrl = () => {
  return "https://restuarentbackend.onrender.com";
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
        setIncomingCount(1); // Demo mock order
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
