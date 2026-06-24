import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { Animated, Image, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LogoLoader from "../../../components/LogoLoader";
import { styles } from "../../../styles/main.styles";

const getApiUrl = () => {
  return "https://restuarentbackend.onrender.com";
};

const API_URL = getApiUrl();

export default function MainPage() {
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [animationValue] = useState(new Animated.Value(1)); // 1 = OPEN, 0 = CLOSED
  const [details, setDetails] = useState({
    restId: "N/A",
    restLocation: "N/A",
    address: "N/A",
    fssai: "N/A",
  });
  const [stats, setStats] = useState({
    todayEarnings: 0,
    todayOrders: 0,
    totalEarnings: 0,
    totalOrders: 0,
  });

  const fetchBackendData = useCallback(async (restId) => {
    if (!restId || restId === "demo_rest_101") return;
    try {
      // Fetch active status from backend
      const res = await fetch(`${API_URL}/get-status/${restId}`);
      if (res.ok) {
        const statusData = await res.json();
        if (statusData.success) {
          setIsOpen(statusData.isActive);
          Animated.timing(animationValue, {
            toValue: statusData.isActive ? 1 : 0,
            duration: 250,
            useNativeDriver: false,
          }).start();
        }
      }

      // Fetch restaurant completed orders statistics
      const statsRes = await fetch(`${API_URL}/restaurant-stats/${restId}`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }
    } catch (error) {
      console.log("Error polling home screen stats:", error.message);
    }
  }, [animationValue]);

  useEffect(() => {
    let intervalId = null;

    const fetchStoredDetails = async () => {
      try {
        const restId = await AsyncStorage.getItem("restId");
        const restLocation = await AsyncStorage.getItem("restLocation");
        const address = await AsyncStorage.getItem("address");
        const fssai = await AsyncStorage.getItem("fssai");

        setDetails({
          restId: restId || "N/A",
          restLocation: restLocation || "N/A",
          address: address || "N/A",
          fssai: fssai || "N/A",
        });

        // Fetch active status and stats from backend
        if (restId) {
          if (restId === "demo_rest_101") {
            setIsOpen(true);
            animationValue.setValue(1);
            setStats({
              todayEarnings: 0,
              todayOrders: 0,
              totalEarnings: 0,
              totalOrders: 0,
            });
          } else {
            // Initial fetch
            await fetchBackendData(restId);

            // Set up polling interval every 5 seconds
            intervalId = setInterval(() => {
              fetchBackendData(restId);
            }, 5000);
          }
        }
      } catch (error) {
        console.error("Error reading storage details/status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoredDetails();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchBackendData]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "restId",
        "restid",
        "restLocation",
        "restlocation",
        "address",
        "addredd",
        "fssai",
        "email",
        "phone",
        "restaurantLocation",
        "restaurantlocation",
        "lat",
        "lng",
      ]);
      router.replace("/");
    } catch (error) {
      console.error("Error clearing session:", error);
      router.replace("/");
    }
  };

  const toggleStatus = async () => {
    const nextState = !isOpen;

    // Toggle internal state and start slide animation
    setIsOpen(nextState);
    Animated.timing(animationValue, {
      toValue: nextState ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();

    // Send update request to database
    if (details.restId === "demo_rest_101") {
      return;
    }

    try {
      console.log(`Toggling status to ${nextState} for restaurantId: ${details.restId}`);
      const res = await fetch(`${API_URL}/toggle-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: details.restId,
          isActive: nextState,
        }),
      });

      const responseData = await res.json();
      if (!res.ok || !responseData.success) {
        console.error("Failed to update status on server:", responseData.message);
      }
    } catch (error) {
      console.error("Network error updating status:", error);
    }
  };

  const backgroundColor = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E05638", "#0AB28D"], // red to green
  });

  const knobLeft = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 134], // left offset when closed (6) to open (134)
  });

  if (loading) {
    return (
      <View style={[styles.mainContainer, { justifyContent: "center", alignItems: "center" }]}>
        <LogoLoader />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <View style={styles.headerBar}>
            <View style={styles.headerLeftCircle}>
              <Image
                source={require("../../../../assets/images/logo.png")}
                style={{ width: 38, height: 38 }}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.headerTitle}>LEEVON DELIVERY </Text>
            <View style={styles.headerRightSpacer} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Toggle Button */}
          <View style={styles.toggleContainer}>
            <Pressable onPress={toggleStatus}>
              <Animated.View style={[styles.toggleBar, { backgroundColor }]}>
                <Text style={styles.toggleText}>{isOpen ? "OPEN" : "CLOSED"}</Text>
                <Animated.View style={[styles.toggleKnob, { left: knobLeft }]}>
                  <FontAwesome
                    name="power-off"
                    size={20}
                    color={isOpen ? "#0AB28D" : "#E05638"}
                  />
                </Animated.View>
              </Animated.View>
            </Pressable>
          </View>

          {/* My Menu Button */}
          <View style={styles.menuButtonContainer}>
            <Pressable
              onPress={() => router.push("/main/menu")}
              style={({ pressed }) => [
                styles.menuButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }
              ]}
            >
              <FontAwesome name="cutlery" size={16} color="#FFFFFF" style={styles.menuButtonIcon} />
              <Text style={styles.menuButtonText}>MY MENU</Text>
            </Pressable>
          </View>

          {/* Stats Grid Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              {/* Today Earnings */}
              <View style={styles.statsCard}>
                <Text style={styles.statsCardLabel}>TODAY EARNINGS</Text>
                <Text style={styles.statsCardValue}>₹ {stats.todayEarnings}</Text>
              </View>
              {/* Today Orders */}
              <View style={styles.statsCard}>
                <Text style={styles.statsCardLabel}>TODAY ORDERS</Text>
                <Text style={styles.statsCardValue}>{stats.todayOrders}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              {/* Total Earnings */}
              <View style={styles.statsCard}>
                <Text style={styles.statsCardLabel}>TOTAL EARNINGS</Text>
                <Text style={styles.statsCardValue}>₹ {stats.totalEarnings}</Text>
              </View>
              {/* Total Orders */}
              <View style={styles.statsCard}>
                <Text style={styles.statsCardLabel}>TOTAL ORDERS</Text>
                <Text style={styles.statsCardValue}>{stats.totalOrders}</Text>
              </View>
            </View>
          </View>


        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
