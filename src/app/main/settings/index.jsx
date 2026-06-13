import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LogoLoader from "../../../components/LogoLoader";

const isMobile = Platform.OS === "ios" || Platform.OS === "android";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("amigo");
  const [phone, setPhone] = useState("9636");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("email");
        const storedPhone = await AsyncStorage.getItem("phone");
        if (storedEmail) setEmail(storedEmail);
        if (storedPhone) setPhone(storedPhone);
      } catch (error) {
        console.error("Error reading profile details from storage:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

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

  const handleDeleteAccount = () => {
    if (Platform.OS === "web") {
      alert("Delete Account Request\n\nTo delete your account and associated data, please email support@leevondelivery.in. Your data will be deleted within 30 days.");
    } else {
      Alert.alert(
        "Delete Account Request",
        "To delete your account and associated data, please email support@leevondelivery.in.\n\nYour account and data will be permanently deleted within 30 days.",
        [{ text: "OK" }]
      );
    }
  };

  const handleOpenPrivacyPolicy = () => {
    const url = "https://privacypolicyrestuarent.vercel.app/";
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open privacy policy link:", err)
    );
  };

  if (loading) {
    return (
      <View style={[styles.mainContainer, { justifyContent: "center", alignItems: "center" }]}>
        <LogoLoader />
      </View>
    );
  }

  // Get first letter of email or "A" as avatar initial
  const displayEmailName = email.includes("@") ? email.split("@")[0] : email;
  const avatarLetter = displayEmailName ? displayEmailName.charAt(0).toUpperCase() : "A";

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Centered Page Header Pill (No ribbon) */}
        <View style={styles.headerContainer}>
          <View style={styles.headerPill}>
            <FontAwesome name="cog" size={18} color="#777265" style={styles.headerPillIcon} />
            <Text style={styles.headerPillText}>Settings</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Upper Profile Details Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>{displayEmailName}</Text>
              <View style={styles.phoneRow}>
                <FontAwesome name="phone" size={17} color="#D4AF37" style={styles.phoneIcon} />
                <Text style={styles.profilePhone}>{phone}</Text>
              </View>
            </View>
          </View>

          {/* Beige Container with Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Restaurant Profile */}
            <Pressable
              onPress={() => router.push("/main/settings/profile")}
              style={({ pressed }) => [
                styles.actionItem,
                pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={styles.actionLeftRow}>
                <FontAwesome name="user" size={22} color="#1E1E1D" style={styles.actionIcon} />
                <Text style={styles.actionText}>Restaurant Profile</Text>
              </View>
              <FontAwesome name="chevron-right" size={17} color="#1E1E1D" />
            </Pressable>

            {/* My Orders */}
            <Pressable
              onPress={() => router.push("/main/orders-history")}
              style={({ pressed }) => [
                styles.actionItem,
                pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={styles.actionLeftRow}>
                <FontAwesome name="archive" size={20} color="#1E1E1D" style={styles.actionIcon} />
                <Text style={styles.actionText}>My Orders</Text>
              </View>
              <FontAwesome name="chevron-right" size={17} color="#1E1E1D" />
            </Pressable>

            {/* My Reviews */}
            {/* <Pressable
              style={({ pressed }) => [
                styles.actionItem,
                pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={styles.actionLeftRow}>
                <FontAwesome name="star" size={22} color="#1E1E1D" style={styles.actionIcon} />
                <Text style={styles.actionText}>My Reviews</Text>
              </View>
              <FontAwesome name="chevron-right" size={17} color="#1E1E1D" />
            </Pressable> */}

            {/* Contact Us */}
            <Pressable
              onPress={() => router.push("/main/contact")}
              style={({ pressed }) => [
                styles.actionItem,
                pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={styles.actionLeftRow}>
                <FontAwesome name="envelope" size={20} color="#1E1E1D" style={styles.actionIcon} />
                <Text style={styles.actionText}>Contact Us</Text>
              </View>
              <FontAwesome name="chevron-right" size={17} color="#1E1E1D" />
            </Pressable>

            {/* Privacy Policy */}
            <Pressable
              onPress={handleOpenPrivacyPolicy}
              style={({ pressed }) => [
                styles.actionItem,
                pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={styles.actionLeftRow}>
                <FontAwesome name="shield" size={20} color="#1E1E1D" style={styles.actionIcon} />
                <Text style={styles.actionText}>Privacy Policy</Text>
              </View>
              <FontAwesome name="chevron-right" size={17} color="#1E1E1D" />
            </Pressable>

            {/* Delete Account */}
            <Pressable
              onPress={handleDeleteAccount}
              style={({ pressed }) => [
                styles.actionItem,
                pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={styles.actionLeftRow}>
                <FontAwesome name="trash" size={20} color="#E05638" style={styles.actionIcon} />
                <Text style={[styles.actionText, { color: "#E05638" }]}>Delete Account</Text>
              </View>
              <FontAwesome name="chevron-right" size={17} color="#E05638" />
            </Pressable>

            {/* Logout */}
            <Pressable
              onPress={() => setShowLogoutConfirm(true)}
              style={({ pressed }) => [
                styles.actionItem,
                styles.logoutItem,
                pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={styles.actionLeftRow}>
                <FontAwesome name="sign-out" size={22} color="#FFFFFF" style={styles.actionIcon} />
                <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
              </View>
              <FontAwesome name="chevron-right" size={17} color="#FFFFFF" />
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            {/* Red Circle with Logout Arrow */}
            <View style={styles.iconContainer}>
              <FontAwesome name="sign-out" size={36} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </View>

            {/* Modal Title */}
            <Text style={styles.confirmTitle}>Are you sure you want to logout?</Text>

            {/* Confirm Logout Button */}
            <Pressable
              onPress={() => {
                setShowLogoutConfirm(false);
                handleLogout();
              }}
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
              ]}
            >
              <Text style={styles.confirmButtonText}>Logout</Text>
            </Pressable>

            {/* Cancel Link */}
            <Pressable onPress={() => setShowLogoutConfirm(false)}>
              <Text style={styles.cancelTextLink}>Not now</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F7F6F1", // creamy white/beige
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 8,
    width: "100%",
  },
  headerPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 29,
    height: 53,
    paddingHorizontal: 28,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
      },
    }),
  },
  headerPillIcon: {
    marginRight: 8,
  },
  headerPillText: {
    color: "#1E1E1D",
    fontSize: 20,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // extra padding to clear absolute tabbar
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 29,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 20,
    width: "100%",
    maxWidth: 530,
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 6px 15px rgba(0, 0, 0, 0.02)",
      },
    }),
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#1E1E1D", // dark charcoal avatar backing
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  profileName: {
    fontSize: isMobile ? 22 : 26,
    fontWeight: "800",
    color: "#1E1E1D",
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneIcon: {
    marginRight: 6,
  },
  profilePhone: {
    fontSize: isMobile ? 15 : 18,
    color: "#777265",
    fontWeight: "600",
  },
  actionsContainer: {
    backgroundColor: "#E5DEC9", // beige rounded box matching mockup
    borderRadius: 37,
    padding: 20,
    gap: 12,
    width: "100%",
    maxWidth: 530,
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
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
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 30, // increased roundedness for the buttons as requested
    height: 65,
    paddingHorizontal: 24,
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  actionLeftRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    width: 26,
    marginRight: 12,
  },
  actionText: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: "700",
    color: "#1E1E1D",
  },
  logoutItem: {
    backgroundColor: "#E05638",
  },
  logoutText: {
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // dimmed background overlay
    justifyContent: "center",
    alignItems: "center",
  },
  confirmCard: {
    width: "85%",
    maxWidth: 320,
    backgroundColor: "#FAF6EC", // warm beige/cream dialog container
    borderRadius: 36,
    padding: 24,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E05638", // brand red color
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E1E1D",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 24,
  },
  confirmButton: {
    width: "100%",
    backgroundColor: "#E05638", // matches logout button red
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 4px 10px rgba(224, 86, 56, 0.2)",
        cursor: "pointer",
        userSelect: "none",
      },
    }),
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cancelTextLink: {
    color: "#1E1E1D",
    fontSize: 15,
    fontWeight: "800",
    textDecorationLine: "underline",
    paddingVertical: 8,
    ...Platform.select({
      web: {
        cursor: "pointer",
        userSelect: "none",
      },
    }),
  },
});
