import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";
import { OrdersProvider } from "../../context/OrdersContext";

export default function MainLayout() {
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

function TabItem({ isFocused, iconName, onPress }) {
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
      </Animated.View>
    </Pressable>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          // Skip the index, settings/profile/index, settings/reviews/index, contact/index, and orders-history/index routes from rendering as tabs
          if (
            route.name === "index" ||
            route.name === "settings/profile/index" ||
            route.name === "settings/reviews/index" ||
            route.name === "contact/index" ||
            route.name === "orders-history/index"
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

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              iconName={iconName}
              onPress={onPress}
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
});
