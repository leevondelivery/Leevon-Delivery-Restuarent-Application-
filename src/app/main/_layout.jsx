import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Animated, AppState, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import LogoLoader from "../../components/LogoLoader";
import { isBatteryOptimizationEnabled, requestIgnoreBatteryOptimization } from "../../utils/batteryOptimization";
import { OrdersProvider, useOrders } from "../../context/OrdersContext";

export default function MainLayout() {
  const [batteryOptimized, setBatteryOptimized] = useState(false);

  useEffect(() => {
    let active = true;
    
    const checkBatteryStatus = async () => {
      const isOptimized = await isBatteryOptimizationEnabled();
      if (active) {
        setBatteryOptimized(isOptimized);
      }
    };

    checkBatteryStatus();

    // Recheck status when the app comes back to the foreground
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        checkBatteryStatus();
      }
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const handleAllowBatteryExemption = () => {
    Alert.alert(
      "Disable Battery Restrictions",
      "To receive instant order notifications and connect to our servers, you must set battery usage to 'No restrictions'.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Allow",
          onPress: () => {
            requestIgnoreBatteryOptimization();
          },
        },
      ]
    );
  };

  if (batteryOptimized) {
    return (
      <View style={layoutStyles.blockContainer}>
        <LogoLoader 
          title="Setup Required" 
          subtitle="Battery Optimization is Active" 
        />
        <View style={layoutStyles.blockCard}>
          <FontAwesome name="exclamation-triangle" size={48} color="#C53030" style={{ marginBottom: 16 }} />
          <Text style={layoutStyles.blockTitle}>Action Required</Text>
          <Text style={layoutStyles.blockDescription}>
            In order to receive delivery requests and restaurant notifications in the background, you must change your battery settings.
          </Text>
          <Text style={layoutStyles.blockInstructions}>
            {"Tap the button below, then select \"Allow\" on the system prompt (to set battery usage to \"No restrictions\")."}
          </Text>
          <Pressable 
            onPress={handleAllowBatteryExemption}
            style={({ pressed }) => [
              layoutStyles.blockButton,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
            ]}
          >
            <Text style={layoutStyles.blockButtonText}>{"ALLOW \"NO RESTRICTIONS\""}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <OrdersProvider>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
      {/* Hide the index redirect file from the tabbar list */}
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      {/* Hide the restaurant profile screen from the tabbar list */}
      <Tabs.Screen
        name="settings/profile/index"
        options={{
          href: null,
        }}
      />
      {/* Hide the reviews screen from the tabbar list */}
      <Tabs.Screen
        name="settings/reviews/index"
        options={{
          href: null,
        }}
      />
      {/* Hide the rejected orders screen from the tabbar list */}
      <Tabs.Screen
        name="settings/rejected-orders/index"
        options={{
          href: null,
        }}
      />
      {/* Hide the contact us screen from the tabbar list */}
      <Tabs.Screen
        name="contact/index"
        options={{
          href: null,
        }}
      />
      {/* Hide the orders history screen from the tabbar list */}
      <Tabs.Screen
        name="orders-history/index"
        options={{
          href: null,
        }}
      />
      {/* Hide the menu screen from the tabbar list */}
      <Tabs.Screen
        name="menu/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{
          title: "Notifications",
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: "Orders",
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: "Settings",
        }}
      />
      </Tabs>
    </OrdersProvider>
  );
}

function TabItem({ isFocused, iconName, onPress, showBadge }) {
  const [animatedValue] = useState(() => new Animated.Value(isFocused ? 1 : 0));

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isFocused ? 1 : 0,
      tension: 60,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const animatedStyle = {
    width: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [44, 64],
    }),
    height: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [44, 64],
    }),
    borderRadius: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [22, 32],
    }),
    marginTop: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -24],
    }),
    borderWidth: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 4],
    }),
  };

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.tabItem, animatedStyle]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <FontAwesome
            name={iconName}
            size={18}
            color="#000000"
          />
        </Animated.View>
        {showBadge && <View style={styles.badge} />}
      </Animated.View>
    </Pressable>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  const { incomingCount } = useOrders();

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          // Skip the index, settings/profile/index, settings/reviews/index, contact/index, orders-history/index, and menu/index routes from rendering as tabs
          if (
            route.name === "index" ||
            route.name === "settings/profile/index" ||
            route.name === "settings/reviews/index" ||
            route.name === "settings/rejected-orders/index" ||
            route.name === "contact/index" ||
            route.name === "orders-history/index" ||
            route.name === "menu/index"
          )
            return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName = "home";
          if (route.name.includes("notifications")) {
            iconName = "bell";
          } else if (route.name.includes("orders")) {
            iconName = "clipboard";
          } else if (route.name.includes("settings")) {
            iconName = "cog";
          }

          const showBadge = route.name.includes("notifications") && incomingCount > 0;

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              iconName={iconName}
              onPress={onPress}
              showBadge={showBadge}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#E5DEC9", // soft beige/tan color matching the mockup
    borderRadius: 36,
    height: 72,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.06)",
      },
    }),
  },
  tabItem: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F7F6F1", // matches screen background to create clean cutout effect
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 3px 6px rgba(0, 0, 0, 0.04)",
        cursor: "pointer",
      },
    }),
  },
  badge: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "#E05638", // brand red color
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    zIndex: 10,
  },
});

const layoutStyles = StyleSheet.create({
  blockContainer: {
    flex: 1,
    backgroundColor: "#F7F6F1", // creamy white matching mainContainer
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  blockCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 32,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    marginTop: -20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  blockTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E1E1D",
    marginBottom: 12,
    textAlign: "center",
  },
  blockDescription: {
    fontSize: 14,
    color: "#4A4A48",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 12,
  },
  blockInstructions: {
    fontSize: 13,
    color: "#747472",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
  },
  blockButton: {
    backgroundColor: "#E05638", // brand red
    borderRadius: 26,
    height: 52,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  blockButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
