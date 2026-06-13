import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LogoLoader from "../../../../components/LogoLoader";
import { styles as globalStyles } from "../../../../styles/main.styles";

const isMobile = Platform.OS === "ios" || Platform.OS === "android";

export default function RestaurantProfilePage() {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({
    restId: "N/A",
    restLocation: "N/A",
    address: "N/A",
    fssai: "N/A",
    email: "N/A",
    phone: "N/A",
    lat: "N/A",
    lng: "N/A",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const keys = [
          "restId",
          "restLocation",
          "address",
          "fssai",
          "email",
          "phone",
          "lat",
          "lng"
        ];
        const stores = await AsyncStorage.multiGet(keys);
        const fetchedDetails = {};
        stores.forEach(([key, value]) => {
          fetchedDetails[key] = value || "N/A";
        });
        setDetails(fetchedDetails);
      } catch (error) {
        console.error("Error reading profile details from storage:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const openMapLink = () => {
    if (details.restLocation && details.restLocation !== "N/A") {
      Linking.openURL(details.restLocation).catch((err) =>
        console.error("Failed to open map link:", err)
      );
    }
  };

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
        {/* Header Pill with Back Button */}
        <View style={globalStyles.headerContainer}>
          <Pressable onPress={() => router.push("/main/settings")} style={globalStyles.headerPillLeftButton}>
            <FontAwesome name="chevron-left" size={16} color="#777265" />
          </Pressable>
          <View style={globalStyles.headerPill}>
            <FontAwesome name="user" size={18} color="#777265" style={globalStyles.headerPillIcon} />
            <Text style={globalStyles.headerPillText}>Restaurant Profile</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Info Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <FontAwesome name="cutlery" size={26} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {details.email.includes("@") ? details.email.split("@")[0].toUpperCase() : details.email.toUpperCase()}
              </Text>
              <Text style={styles.profileSubtext}>Outlet Details</Text>
            </View>
          </View>

          {/* Details Container */}
          <View style={styles.detailsBox}>
            {/* Restaurant ID */}
            <View style={styles.detailRow}>
              <View style={styles.iconWrapper}>
                <FontAwesome name="hashtag" size={18} color="#1E1E1D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>RESTAURANT ID</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{details.restId}</Text>
              </View>
            </View>

            {/* Contact Email */}
            <View style={styles.detailRow}>
              <View style={styles.iconWrapper}>
                <FontAwesome name="envelope" size={18} color="#1E1E1D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>CONTACT EMAIL</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{details.email}</Text>
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.detailRow}>
              <View style={styles.iconWrapper}>
                <FontAwesome name="phone" size={18} color="#1E1E1D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>PHONE NUMBER</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{details.phone}</Text>
              </View>
            </View>

            {/* Coordinates */}
            {/* <View style={styles.detailRow}>
              <View style={styles.iconWrapper}>
                <FontAwesome name="globe" size={18} color="#1E1E1D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>COORDINATES (LAT / LNG)</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {details.lat} , {details.lng}
                </Text>
              </View>
            </View> */}

            {/* Address */}
            <View style={styles.detailRow}>
              <View style={styles.iconWrapper}>
                <FontAwesome name="home" size={18} color="#1E1E1D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>ADDRESS</Text>
                <Text style={styles.detailValue} numberOfLines={4}>{details.address}</Text>
              </View>
            </View>

            {/* FSSAI Number */}
            <View style={styles.detailRow}>
              <View style={styles.iconWrapper}>
                <FontAwesome name="certificate" size={18} color="#1E1E1D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>FSSAI NUMBER</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{details.fssai}</Text>
              </View>
            </View>

            {/* Location Button 
            {details.restLocation !== "N/A" && (
              <Pressable onPress={openMapLink} style={styles.locationButton}>
                <FontAwesome name="map-marker" size={18} color="#FFFFFF" style={styles.locationButtonIcon} />
                <Text style={styles.locationButtonText}>View Location on Map</Text>
              </Pressable>
            )}*/}
          </View>
        </ScrollView>
      </SafeAreaView>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1E1E1D", // black/charcoal
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  profileSubtext: {
    fontSize: isMobile ? 12 : 14,
    color: "#A6A6A6",
    fontWeight: "500",
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: "#E5DEC9", // warm beige container
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
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 24,
    minHeight: 70,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#F7F6F1",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
      },
    }),
  },
  detailLabel: {
    fontSize: isMobile ? 8 : 10,
    color: "#A6A6A6",
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: isMobile ? 13 : 15,
    color: "#1E1E1D",
    fontWeight: "700",
  },
  locationButton: {
    backgroundColor: "#1E1E1D",
    borderRadius: 26,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    width: "100%",
    maxWidth: 530,
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        cursor: "pointer",
        userSelect: "none",
      },
    }),
  },
  locationButtonIcon: {
    marginRight: 8,
  },
  locationButtonText: {
    color: "#FFFFFF",
    fontSize: isMobile ? 14 : 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
