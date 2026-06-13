import React, { useEffect, useState } from "react";
import { Animated, Easing, Image, Platform, StyleSheet, Text, View } from "react-native";

export default function LogoLoader({
  title = "Wait for a Second...",
  subtitle = "Everything is getting ready for you",
}) {
  const [spinValue] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* Animated Loading Circle Container */}
      <View style={styles.loaderWrapper}>
        
        {/* Background Track Ring */}
        <View style={styles.trackRing} />

        {/* Rotating Active Golden Ring */}
        <Animated.View style={[styles.activeRing, { transform: [{ rotate: spin }] }]} />

        {/* Inner Black Circle with Golden Logo */}
        <View style={styles.innerCircle}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

      </View>

      {/* Loading Text */}
      <Text style={styles.titleText}>{title}</Text>
      <Text style={styles.subtitleText}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loaderWrapper: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 24,
  },
  trackRing: {
    position: "absolute",
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 4,
    borderColor: "#EADFC9", // soft cream track
    opacity: 0.5,
  },
  activeRing: {
    position: "absolute",
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 4,
    borderColor: "transparent",
    borderTopColor: "#B89355", // premium golden color
    borderLeftColor: "#B89355", // half-ring active golden arc
  },
  innerCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#000000", // pure black background
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      },
    }),
  },
  logoImage: {
    width: 54,
    height: 54,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1E1D",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 13,
    color: "#777265",
    fontWeight: "600",
    textAlign: "center",
  },
});
