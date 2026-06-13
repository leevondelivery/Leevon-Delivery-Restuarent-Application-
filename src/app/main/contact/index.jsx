import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles as globalStyles } from "../../../styles/main.styles";

const isMobile = Platform.OS === "ios" || Platform.OS === "android";

export default function ContactUsPage() {
  const handlePressPhone = () => {
    Linking.openURL("tel:+917207610235").catch((err) =>
      console.error("Failed to dial phone number:", err)
    );
  };

  const handlePressEmail = () => {
    Linking.openURL("mailto:support@leevondelivery.in").catch((err) =>
      console.error("Failed to open email client:", err)
    );
  };

  const handlePressSocial = (platform) => {
    let url = "";
    if (platform === "instagram") {
      url = "https://www.instagram.com";
    } else if (platform === "facebook") {
      url = "https://www.facebook.com";
    } else if (platform === "twitter") {
      url = "https://twitter.com";
    }

    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error(`Failed to open ${platform}:`, err)
      );
    }
  };

  return (
    <View style={globalStyles.mainContainer}>
      <SafeAreaView style={globalStyles.safeArea} edges={["top", "left", "right"]}>
        {/* Header Section */}
        <View style={globalStyles.headerContainer}>
          {/* Circular Back Button on Left */}
          <Pressable
            onPress={() => router.push("/main/settings")}
            style={({ pressed }) => [
              globalStyles.headerPillLeftButton,
              pressed && { opacity: 0.8 },
            ]}
          >
            <FontAwesome name="chevron-left" size={16} color="#1E1E1D" />
          </Pressable>

          {/* Centered Capsule Header Pill */}
          <View style={globalStyles.headerPill}>
            <FontAwesome name="envelope" size={18} color="#777265" style={globalStyles.headerPillIcon} />
            <Text style={globalStyles.headerPillText}>Contact Us</Text>
          </View>
        </View>

        {/* Content Area */}
        <View style={localStyles.contentContainer}>
          {/* Card Container matching settings and stats styling */}
          <View style={localStyles.contactCard}>
            
            {/* Phone Capsule */}
            <Pressable
              onPress={handlePressPhone}
              style={({ pressed }) => [
                localStyles.capsuleRow,
                pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={localStyles.rowLeft}>
                <FontAwesome name="phone" size={24} color="#1E1E1D" style={localStyles.icon} />
                <Text style={localStyles.valueText}>+91 7207610235</Text>
              </View>
            </Pressable>

            {/* Email Capsule */}
            <Pressable
              onPress={handlePressEmail}
              style={({ pressed }) => [
                localStyles.capsuleRow,
                pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={localStyles.rowLeft}>
                <FontAwesome name="envelope" size={20} color="#1E1E1D" style={localStyles.icon} />
                <Text style={localStyles.valueText}>support@leevondelivery.in</Text>
              </View>
            </Pressable>

            {/* Instagram Capsule */}
            {/* <Pressable
              onPress={() => handlePressSocial("instagram")}
              style={({ pressed }) => [
                localStyles.capsuleRow,
                pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={localStyles.rowLeft}>
                <FontAwesome name="instagram" size={22} color="#1E1E1D" style={localStyles.icon} />
                <Text style={localStyles.valueText}>Instagram</Text>
              </View>
            </Pressable> */}

            {/* Facebook Capsule */}
            {/* <Pressable
              onPress={() => handlePressSocial("facebook")}
              style={({ pressed }) => [
                localStyles.capsuleRow,
                pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={localStyles.rowLeft}>
                <FontAwesome name="facebook" size={22} color="#1E1E1D" style={localStyles.icon} />
                <Text style={localStyles.valueText}>Facebook</Text>
              </View>
            </Pressable> */}

            {/* Twitter Capsule */}
            {/* <Pressable
              onPress={() => handlePressSocial("twitter")}
              style={({ pressed }) => [
                localStyles.capsuleRow,
                pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={localStyles.rowLeft}>
                <FontAwesome name="twitter" size={22} color="#1E1E1D" style={localStyles.icon} />
                <Text style={localStyles.valueText}>Twitter</Text>
              </View>
            </Pressable> */}

          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  contactCard: {
    backgroundColor: "#EADFC9", // soft tan/brown color matching the screenshot
    borderRadius: 37,
    padding: 24,
    gap: 16,
    width: "100%",
    maxWidth: 530,
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)",
      },
    }),
  },
  capsuleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 33,
    height: 66,
    paddingHorizontal: 24,
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    width: 30,
    marginRight: 16,
    textAlign: "center",
  },
  valueText: {
    fontSize: isMobile ? 15 : 18,
    fontWeight: "700",
    color: "#1E1E1D",
  },
});
