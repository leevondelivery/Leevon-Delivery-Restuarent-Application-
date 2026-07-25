import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LogoLoader from "../components/LogoLoader";
import { styles } from "../styles/index.styles";
import { registerForFCMAsync, saveFCMTokenToBackend } from "../utils/notifications";

const getApiUrl = () => {
  return "https://restuarentbackend-production.up.railway.app";
};

const API_URL = getApiUrl();

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const fontId = "google-calligraphy-font";
      if (!document.getElementById(fontId)) {
        const link = document.createElement("link");
        link.id = fontId;
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Lora:ital,wght@0,700;1,700&display=swap";
        document.head.appendChild(link);
      }
    }

    const checkLoginStatus = async () => {
      try {
        const restId = await AsyncStorage.getItem("restId");
        if (restId && restId !== "N/A") {
          router.replace("/main");
        } else {
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        setCheckingAuth(false);
      }
    };
    checkLoginStatus();
  }, []);

  // Cross-platform alert helper
  const showAlert = (title, message) => {
    if (Platform.OS === "web") {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Please fill in all fields");
      setShowErrorModal(true);
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const isDemoEmail =
      trimmedEmail === "partner@leevon.com" ||
      trimmedEmail === "business@leevon.com" ||
      trimmedEmail === "restaurant@leevon.com" ||
      trimmedEmail === "demo@leevon.com" ||
      trimmedEmail === "test@leevon.com" ||
      trimmedEmail === "playstore@leevon.com" ||
      trimmedEmail.includes("demo") ||
      trimmedEmail.includes("test") ||
      trimmedEmail.includes("reviewer") ||
      trimmedEmail.includes("partner") ||
      trimmedEmail.includes("business");

    if (isDemoEmail && password.length >= 6) {
      setLoading(true);
      try {
        const restId = "demo_rest_101";
        const restLocation = "https://maps.google.com/?q=Leevon+Demo+Restaurant";
        const address = "Ucon Plaza, Kurnool";
        const fssai = "12345678901234";
        const userEmail = trimmedEmail;
        const userPhone = "+91 7207610235";
        // const restaurantLocation = JSON.stringify({ lat: 32.7767, lng: -96.7970 });
        // const lat = "32.7767";
        // const lng = "-96.7970";

        await AsyncStorage.setItem("restId", restId);
        await AsyncStorage.setItem("restid", restId);
        await AsyncStorage.setItem("restLocation", restLocation);
        await AsyncStorage.setItem("restlocation", restLocation);
        await AsyncStorage.setItem("address", address);
        await AsyncStorage.setItem("addredd", address);
        await AsyncStorage.setItem("fssai", fssai);
        await AsyncStorage.setItem("email", userEmail);
        await AsyncStorage.setItem("phone", userPhone);
        await AsyncStorage.setItem("commission", "12");
        // await AsyncStorage.setItem("restaurantLocation", restaurantLocation);
        // await AsyncStorage.setItem("restaurantlocation", restaurantLocation);
        // await AsyncStorage.setItem("lat", lat);
        // await AsyncStorage.setItem("lng", lng);

        try {
          const token = await registerForFCMAsync();
          if (token) {
            await saveFCMTokenToBackend(restId, token);
          }
        } catch (fcmErr) {
          console.log("FCM registration on demo login failed:", fcmErr.message);
        }

        router.replace("/main");
      } catch (error) {
        setErrorMessage("Error saving demo session data.");
        setShowErrorModal(true);
        console.error("Demo login storage error:", error);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      console.log(`Attempting login at: ${API_URL}/login`);
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login response data:", JSON.stringify(data));
      if (response.ok && data.success) {
        const restId = data.user?.restId || "N/A";
        const restLocation = data.user?.restLocation || "N/A";
        const address = data.user?.address || "N/A";
        const fssai = data.user?.fssai || "N/A";
        const userEmail = data.user?.email || "N/A";
        const userPhone = data.user?.phone || "N/A";

        const restaurantLocation = data.user?.restaurantLocation ? JSON.stringify(data.user.restaurantLocation) : "{}";
        const lat = data.user?.restaurantLocation?.lat !== undefined && data.user?.restaurantLocation?.lat !== null ? String(data.user.restaurantLocation.lat) : "N/A";
        const lng = data.user?.restaurantLocation?.lng !== undefined && data.user?.restaurantLocation?.lng !== null ? String(data.user.restaurantLocation.lng) : "N/A";
        const commission = data.user?.commission !== undefined && data.user?.commission !== null ? String(data.user.commission) : "12";

        // Store them in AsyncStorage (supporting both database schema keys and lowercase user variants)
        await AsyncStorage.setItem("restId", restId);
        await AsyncStorage.setItem("restid", restId);
        await AsyncStorage.setItem("restLocation", restLocation);
        await AsyncStorage.setItem("restlocation", restLocation);
        await AsyncStorage.setItem("address", address);
        await AsyncStorage.setItem("addredd", address);
        await AsyncStorage.setItem("fssai", fssai);
        await AsyncStorage.setItem("email", userEmail);
        await AsyncStorage.setItem("phone", userPhone);
        await AsyncStorage.setItem("commission", commission);
        await AsyncStorage.setItem("restaurantLocation", restaurantLocation);
        await AsyncStorage.setItem("restaurantlocation", restaurantLocation);
        await AsyncStorage.setItem("lat", lat);
        await AsyncStorage.setItem("lng", lng);

        try {
          const token = await registerForFCMAsync();
          if (token) {
            await saveFCMTokenToBackend(restId, token);
          }
        } catch (fcmErr) {
          console.log("FCM registration on login failed:", fcmErr.message);
        }

        router.replace("/main");
      } else {
        setErrorMessage("Email and password is incorrect");
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorMessage(
        "Could not connect to backend server. Make sure the server is running."
      );
      setShowErrorModal(true);
      console.error("Login request error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth || loading) {
    return (
      <View style={[styles.mainContainer, { justifyContent: "center", alignItems: "center" }]}>
        <LogoLoader
          title={loading ? "Logging in..." : "Loading..."}
          subtitle={loading ? "Verifying your credentials" : "Checking session..."}
        />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Custom Error Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showErrorModal}
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconContainer}>
              <FontAwesome name="times" size={36} color="white" />
            </View>
            <Text style={styles.modalText}>{errorMessage}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>Try Again</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Background Split - Right side overlay */}
      <View style={styles.rightBackground} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.overlayContainer}>
            {/* Logo Pill Card with Company Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/company-logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>Leevon Delivery</Text>
            </View>

            {/* Email Input Pill */}
            <View style={styles.inputContainer}>
              <FontAwesome
                name="envelope"
                size={20}
                color="#A6A6A6"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Email"
                placeholderTextColor="#A6A6A6"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Input Pill */}
            <View style={styles.inputContainer}>
              <FontAwesome
                name="lock"
                size={20}
                color="#E05638"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, styles.passwordTextInput]}
                placeholder="Password"
                placeholderTextColor="#E05638"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Login Button Pill */}
            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
