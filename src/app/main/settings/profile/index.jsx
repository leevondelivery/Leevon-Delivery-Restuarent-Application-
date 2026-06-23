import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View, Modal, TextInput, ActivityIndicator, Alert, PanResponder } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LogoLoader from "../../../../components/LogoLoader";
import { styles as globalStyles } from "../../../../styles/main.styles";

const isMobile = Platform.OS === "ios" || Platform.OS === "android";

const getApiUrl = () => {
  return "https://restuarentbackend.onrender.com";
};

const API_URL = getApiUrl();

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export default function RestaurantProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditTimingsModal, setShowEditTimingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("open"); // "open" or "close"
  const [openHour, setOpenHour] = useState("09");
  const [openMinute, setOpenMinute] = useState("00");
  const [closeHour, setCloseHour] = useState("22");
  const [closeMinute, setCloseMinute] = useState("00");
  const [isSelectingHours, setIsSelectingHours] = useState(true);
  const ITEM_HEIGHT = 44;
  const [details, setDetails] = useState({
    restId: "N/A",
    restLocation: "N/A",
    address: "N/A",
    fssai: "N/A",
    email: "N/A",
    phone: "N/A",
    lat: "N/A",
    lng: "N/A",
    openTime: "N/A",
    closeTime: "N/A",
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
          "lng",
          "openTime",
          "closeTime"
        ];
        const stores = await AsyncStorage.multiGet(keys);
        const fetchedDetails = {};
        stores.forEach(([key, value]) => {
          fetchedDetails[key] = value || "N/A";
        });
        setDetails((prev) => ({ ...prev, ...fetchedDetails }));

        const restId = fetchedDetails.restId;
        if (restId && restId !== "N/A" && restId !== "demo_rest_101") {
          console.log(`Fetching fresh profile for restId: ${restId} from ${API_URL}`);
          const res = await fetch(`${API_URL}/restaurant-profile/${restId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.profile) {
              const profile = data.profile;
              const updatedDetails = {
                restId: profile.restId || restId,
                restLocation: profile.restLocation || fetchedDetails.restLocation,
                address: profile.address || fetchedDetails.address,
                fssai: profile.fssai || fetchedDetails.fssai,
                email: profile.email || fetchedDetails.email,
                phone: profile.phone || fetchedDetails.phone,
                lat: profile.restaurantLocation?.lat !== undefined ? String(profile.restaurantLocation.lat) : fetchedDetails.lat,
                lng: profile.restaurantLocation?.lng !== undefined ? String(profile.restaurantLocation.lng) : fetchedDetails.lng,
                openTime: profile.openTime || "N/A",
                closeTime: profile.closeTime || "N/A",
              };
              setDetails(updatedDetails);

              // Cache to AsyncStorage
              const storagePairs = [
                ["restId", updatedDetails.restId],
                ["restLocation", updatedDetails.restLocation],
                ["address", updatedDetails.address],
                ["fssai", updatedDetails.fssai],
                ["email", updatedDetails.email],
                ["phone", updatedDetails.phone],
                ["lat", updatedDetails.lat],
                ["lng", updatedDetails.lng],
                ["openTime", updatedDetails.openTime],
                ["closeTime", updatedDetails.closeTime],
              ];
              await AsyncStorage.multiSet(storagePairs);
            }
          }
        }
      } catch (error) {
        console.error("Error reading/fetching profile details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);


  const handleOpenEditModal = () => {
    let oHr = "09", oMin = "00";
    if (details.openTime && details.openTime !== "N/A") {
      const parts = details.openTime.split(":");
      if (parts.length === 2) {
        oHr = parts[0];
        oMin = parts[1];
      }
    }
    let cHr = "22", cMin = "00";
    if (details.closeTime && details.closeTime !== "N/A") {
      const parts = details.closeTime.split(":");
      if (parts.length === 2) {
        cHr = parts[0];
        cMin = parts[1];
      }
    }
    setOpenHour(oHr);
    setOpenMinute(oMin);
    setCloseHour(cHr);
    setCloseMinute(cMin);
    setActiveTab("open");
    setIsSelectingHours(true);
    setShowEditTimingsModal(true);
  };

  const handleSaveTimings = async () => {
    const formattedOpenTime = `${openHour}:${openMinute}`;
    const formattedCloseTime = `${closeHour}:${closeMinute}`;

    setSaving(true);
    try {
      if (details.restId === "demo_rest_101") {
        setDetails((prev) => ({
          ...prev,
          openTime: formattedOpenTime,
          closeTime: formattedCloseTime
        }));
        await AsyncStorage.setItem("openTime", formattedOpenTime);
        await AsyncStorage.setItem("closeTime", formattedCloseTime);
        setShowEditTimingsModal(false);
        return;
      }

      console.log(`Sending timings update for restId: ${details.restId} (Open: ${formattedOpenTime}, Close: ${formattedCloseTime})`);
      const res = await fetch(`${API_URL}/update-restaurant-timings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restId: details.restId,
          openTime: formattedOpenTime,
          closeTime: formattedCloseTime
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setDetails((prev) => ({
          ...prev,
          openTime: data.openTime || "N/A",
          closeTime: data.closeTime || "N/A"
        }));
        await AsyncStorage.setItem("openTime", data.openTime || "N/A");
        await AsyncStorage.setItem("closeTime", data.closeTime || "N/A");
        setShowEditTimingsModal(false);
      } else {
        throw new Error(data.message || "Failed to update timings");
      }
    } catch (err) {
      console.error("Error updating timings:", err);
      if (Platform.OS === "web") {
        alert(`Error updating timings: ${err.message}`);
      } else {
        Alert.alert("Error", `Could not update timings: ${err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const openMapLink = () => {
    if (details.restLocation && details.restLocation !== "N/A") {
      Linking.openURL(details.restLocation).catch((err) =>
        console.error("Failed to open map link:", err)
      );
    }
  };

  const currentHour = activeTab === "open" ? openHour : closeHour;
  const currentMinute = activeTab === "open" ? openMinute : closeMinute;

  const setCurrentHour = (hr) => {
    if (activeTab === "open") {
      setOpenHour(hr);
    } else {
      setCloseHour(hr);
    }
  };

  const setCurrentMinute = (min) => {
    if (activeTab === "open") {
      setOpenMinute(min);
    } else {
      setCloseMinute(min);
    }
  };

  const CLOCK_HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const CLOCK_MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  const handleIncrementMinute = () => {
    const currentVal = parseInt(currentMinute, 10);
    const rounded = Math.round(currentVal / 5) * 5;
    const newVal = (rounded + 5) % 60;
    const minStr = String(newVal).padStart(2, "0");
    setCurrentMinute(minStr);
  };

  const handleDecrementMinute = () => {
    const currentVal = parseInt(currentMinute, 10);
    const rounded = Math.round(currentVal / 5) * 5;
    const newVal = (rounded - 5 + 60) % 60;
    const minStr = String(newVal).padStart(2, "0");
    setCurrentMinute(minStr);
  };

  const hr24 = parseInt(currentHour, 10);
  const isPM = hr24 >= 12;
  const currentHour12 = hr24 % 12 === 0 ? 12 : hr24 % 12;

  const handleSelectHour12 = (hr12) => {
    let newHr24;
    if (isPM) {
      newHr24 = hr12 === 12 ? 12 : hr12 + 12;
    } else {
      newHr24 = hr12 === 12 ? 0 : hr12;
    }
    const hrStr = String(newHr24).padStart(2, "0");
    setCurrentHour(hrStr);
    
    // Auto switch to minutes mode after selecting hour
    setTimeout(() => {
      setIsSelectingHours(false);
    }, 120);
  };

  const handleSelectMinute = (minStr) => {
    setCurrentMinute(minStr);
  };

  const handleToggleAMPM = (newAmPm) => {
    const hr24 = parseInt(currentHour, 10);
    let newHr24 = hr24;
    if (newAmPm === "PM" && hr24 < 12) {
      newHr24 = hr24 + 12;
    } else if (newAmPm === "AM" && hr24 >= 12) {
      newHr24 = hr24 - 12;
    }
    const hrStr = String(newHr24).padStart(2, "0");
    setCurrentHour(hrStr);
  };

  // Indexes of selected hour/minute for rotating clock hands
  const hourIndex = currentHour12 === 12 ? 0 : currentHour12;
  const hourAngle = (hourIndex * 30) + "deg";

  const currentMinuteVal = parseInt(currentMinute, 10);
  const minuteIndex = Math.round(currentMinuteVal / 5) % 12;
  const minuteAngle = (minuteIndex * 30) + "deg";

  // Use a mutable ref to store states to prevent stale closures in PanResponder callbacks
  const stateRef = useRef({});
  stateRef.current = { isSelectingHours, isPM, currentHour, currentMinute, activeTab };

  const handleTouch = (x, y) => {
    const { isSelectingHours: selHrs, isPM: pmVal, activeTab: tabVal } = stateRef.current;
    const CLOCK_CENTER = 100;
    const dx = x - CLOCK_CENTER;
    const dy = y - CLOCK_CENTER;
    
    // Ignore touches very close to the center to prevent erratic jumps
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 20) return;
    
    let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    
    const idx = Math.round(angle / 30) % 12;
    if (selHrs) {
      const hr12 = CLOCK_HOURS[idx];
      let newHr24;
      if (pmVal) {
        newHr24 = hr12 === 12 ? 12 : hr12 + 12;
      } else {
        newHr24 = hr12 === 12 ? 0 : hr12;
      }
      const hrStr = String(newHr24).padStart(2, "0");
      
      if (tabVal === "open") {
        setOpenHour(hrStr);
      } else {
        setCloseHour(hrStr);
      }
    } else {
      const minStr = CLOCK_MINUTES[idx];
      
      if (tabVal === "open") {
        setOpenMinute(minStr);
      } else {
        setCloseMinute(minStr);
      }
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        handleTouch(locationX, locationY);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        handleTouch(locationX, locationY);
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Only auto-advance to minutes if it was a quick tap, not a drag/rotation movement
        const isTap = Math.abs(gestureState.dx) < 6 && Math.abs(gestureState.dy) < 6;
        if (isTap && stateRef.current.isSelectingHours) {
          setTimeout(() => {
            setIsSelectingHours(false);
          }, 180);
        }
      },
    })
  ).current;

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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!showEditTimingsModal}
        >
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

            {/* Opening Time */}
            <View style={styles.detailRow}>
              <View style={styles.iconWrapper}>
                <FontAwesome name="clock-o" size={18} color="#1E1E1D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>OPENING TIME</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{details.openTime}</Text>
              </View>
            </View>

            {/* Closing Time */}
            <View style={styles.detailRow}>
              <View style={styles.iconWrapper}>
                <FontAwesome name="clock-o" size={18} color="#1E1E1D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>CLOSING TIME</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{details.closeTime}</Text>
              </View>
            </View>

            {/* Edit Timings Button */}
            <Pressable
              onPress={handleOpenEditModal}
              style={({ pressed }) => [
                styles.editButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
              ]}
            >
              <FontAwesome name="pencil" size={14} color="#FFFFFF" style={styles.editButtonIcon} />
              <Text style={styles.editButtonText}>Edit Timings</Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Edit Timings Modal */}
        <Modal
          visible={showEditTimingsModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowEditTimingsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.confirmCard, { position: "relative", padding: 24, paddingTop: 44, maxWidth: 420 }]}>
              {/* Close Button 'X' */}
              <Pressable
                onPress={() => setShowEditTimingsModal(false)}
                style={styles.modalCloseButton}
              >
                <FontAwesome name="times" size={16} color="#777265" />
              </Pressable>

              {/* Icon header */}
              <View style={[styles.avatarCircle, { width: 56, height: 56, borderRadius: 28, marginBottom: 16 }]}>
                <FontAwesome name="clock-o" size={26} color="#FFFFFF" />
              </View>

              {/* Modal Title */}
              <Text style={styles.modalTitle}>Edit Timings</Text>
              <Text style={styles.modalSubtitle}>Select opening and closing times using the scroll selectors</Text>

              {/* Tab Selector */}
              <View style={styles.modalTabsContainer}>
                <Pressable
                  onPress={() => { setActiveTab("open"); setIsSelectingHours(true); }}
                  style={[
                    styles.modalTabButton,
                    activeTab === "open" && styles.modalTabButtonActive
                  ]}
                >
                  <Text style={[
                    styles.modalTabText,
                    activeTab === "open" && styles.modalTabTextActive
                  ]}>
                    Opening ({openHour}:{openMinute})
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => { setActiveTab("close"); setIsSelectingHours(true); }}
                  style={[
                    styles.modalTabButton,
                    activeTab === "close" && styles.modalTabButtonActive
                  ]}
                >
                  <Text style={[
                    styles.modalTabText,
                    activeTab === "close" && styles.modalTabTextActive
                  ]}>
                    Closing ({closeHour}:{closeMinute})
                  </Text>
                </Pressable>
              </View>

              {/* Digital Clock Display */}
              <View style={styles.digitalClockContainer}>
                <Pressable
                  onPress={() => setIsSelectingHours(true)}
                  style={[
                    styles.digitalClockTimeBox,
                    isSelectingHours && { borderColor: "#2E7D32" }
                  ]}
                >
                  <Text style={[
                    styles.digitalClockTimeText,
                    isSelectingHours && { color: "#2E7D32" }
                  ]}>{currentHour}</Text>
                </Pressable>
                <Text style={styles.digitalClockColon}>:</Text>
                <Pressable
                  onPress={() => setIsSelectingHours(false)}
                  style={[
                    styles.digitalClockTimeBox,
                    !isSelectingHours && { borderColor: "#2E7D32" }
                  ]}
                >
                  <Text style={[
                    styles.digitalClockTimeText,
                    !isSelectingHours && { color: "#2E7D32" }
                  ]}>{currentMinute}</Text>
                </Pressable>
              </View>

              {/* Control Panel: Mode (Hr/Min) & AM/PM */}
              <View style={styles.controlPanelRow}>
                {/* Hour/Min Mode Selector */}
                <View style={styles.modeToggleContainer}>
                  <Pressable
                    onPress={() => setIsSelectingHours(true)}
                    style={[
                      styles.modeButton,
                      isSelectingHours && styles.modeButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.modeText,
                      isSelectingHours && styles.modeTextActive
                    ]}>
                      Hours
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setIsSelectingHours(false)}
                    style={[
                      styles.modeButton,
                      !isSelectingHours && styles.modeButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.modeText,
                      !isSelectingHours && styles.modeTextActive
                    ]}>
                      Minutes
                    </Text>
                  </Pressable>
                </View>

                {/* AM/PM Toggle */}
                <View style={styles.ampmToggleContainer}>
                  <Pressable
                    onPress={() => handleToggleAMPM("AM")}
                    style={[
                      styles.ampmButton,
                      !isPM && styles.ampmButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.ampmText,
                      !isPM && styles.ampmTextActive
                    ]}>
                      AM
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleToggleAMPM("PM")}
                    style={[
                      styles.ampmButton,
                      isPM && styles.ampmButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.ampmText,
                      isPM && styles.ampmTextActive
                    ]}>
                      PM
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Circular Clock Face */}
              <View style={styles.clockCircleOuter}>
                <View style={styles.clockCircle}>
                  {/* Rotating Clock Hand */}
                  <View style={styles.clockHandWrapper} pointerEvents="none">
                    <View style={[
                      styles.clockHandContainer,
                      { transform: [{ rotate: isSelectingHours ? hourAngle : minuteAngle }] }
                    ]}>
                      {/* Line pointing to number */}
                      <View style={styles.clockHandLine} />
                      {/* Center pivot point pin */}
                      <View style={styles.clockHandCenterDot} />
                    </View>
                  </View>

                  {/* Render Clock Numbers dynamically */}
                  {(isSelectingHours ? CLOCK_HOURS : CLOCK_MINUTES).map((val, idx) => {
                    // Position in radians
                    const angleRad = (idx * 30) * (Math.PI / 180);
                    // Center offset for positioning (centered in 200x200 clock face container)
                    const CLOCK_RADIUS = 76; // outer circle padding
                    const CLOCK_CENTER = 100;
                    const NUMBER_SIZE = 34;

                    const left = CLOCK_CENTER + CLOCK_RADIUS * Math.sin(angleRad) - NUMBER_SIZE / 2;
                    const top = CLOCK_CENTER - CLOCK_RADIUS * Math.cos(angleRad) - NUMBER_SIZE / 2;

                    // Check if selected
                    let isSelected = false;
                    if (isSelectingHours) {
                      isSelected = val === currentHour12;
                    } else {
                      const targetMin = parseInt(val, 10);
                      const currentMin = parseInt(currentMinute, 10);
                      if (targetMin === 0) {
                        isSelected = currentMin >= 58 || currentMin <= 2;
                      } else {
                        isSelected = Math.abs(currentMin - targetMin) <= 2;
                      }
                    }

                    return (
                      <Pressable
                        key={val}
                        onPress={() => {
                          if (isSelectingHours) {
                            handleSelectHour12(val);
                          } else {
                            handleSelectMinute(val);
                          }
                        }}
                        style={[
                          styles.clockNumberContainer,
                          { left, top },
                          isSelected && styles.clockNumberSelected
                        ]}
                      >
                        <Text style={[
                          styles.clockNumberText,
                          isSelected && styles.clockNumberTextSelected
                        ]}>
                          {val}
                        </Text>
                      </Pressable>
                    );
                  })}

                  {/* Transparent Touch Overlay for PanResponder dragging */}
                  <View
                    {...panResponder.panHandlers}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                      backgroundColor: "transparent",
                    }}
                  />
                </View>
              </View>

              {/* Fine-Tuning controls for Minutes */}
              {!isSelectingHours && (
                <View style={styles.fineTuneContainer}>
                  <Pressable onPress={handleDecrementMinute} style={styles.fineTuneButton}>
                    <FontAwesome name="minus" size={12} color="#FFFFFF" />
                  </Pressable>
                  <View style={styles.fineTuneLabelContainer}>
                    <Text style={styles.fineTuneLabelText}>Adjust Minute</Text>
                    <Text style={styles.fineTuneValueText}>{currentMinute} m</Text>
                  </View>
                  <Pressable onPress={handleIncrementMinute} style={styles.fineTuneButton}>
                    <FontAwesome name="plus" size={12} color="#FFFFFF" />
                  </Pressable>
                </View>
              )}

              {/* Save Button */}
              <Pressable
                onPress={handleSaveTimings}
                disabled={saving}
                style={({ pressed }) => [
                  styles.modalSaveButton,
                  pressed && { opacity: 0.9 }
                ]}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSaveButtonText}>Save Changes</Text>
                )}
              </Pressable>
            </View>
          </View>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  confirmCard: {
    backgroundColor: "#FAF6EC",
    borderRadius: 32,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5DEC9",
  },
  modalCloseButton: {
    position: "absolute",
    right: 16,
    top: 16,
    padding: 8,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1E1D",
    marginBottom: 4,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 11,
    color: "#777265",
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInputWrapper: {
    width: "100%",
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#777265",
    marginBottom: 6,
  },
  modalInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "#E5DEC9",
  },
  modalInputIcon: {
    marginRight: 12,
  },
  modalTextInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E1E1D",
    fontWeight: "700",
  },
  modalSaveButton: {
    backgroundColor: "#1E1E1D",
    borderRadius: 24,
    height: 48,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  modalSaveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  editButton: {
    backgroundColor: "#1E1E1D",
    borderRadius: 24,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
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
        elevation: 2,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        cursor: "pointer",
        userSelect: "none",
      },
    }),
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: isMobile ? 13 : 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  editButtonIcon: {
    marginRight: 8,
  },
  modalTabsContainer: {
    flexDirection: "row",
    backgroundColor: "#F7F6F1",
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    width: "100%",
  },
  modalTabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  modalTabButtonActive: {
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)",
      },
    }),
  },
  modalTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#777265",
  },
  modalTabTextActive: {
    color: "#1E1E1D",
  },
  clockCircleOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#FAF6EC",
    borderWidth: 1.5,
    borderColor: "#E5DEC9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.02)",
      },
    }),
  },
  clockCircle: {
    width: 200,
    height: 200,
    position: "relative",
  },
  clockHandWrapper: {
    position: "absolute",
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  clockHandContainer: {
    position: "absolute",
    width: 4,
    height: 152,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  clockHandLine: {
    width: 2,
    height: 76,
    backgroundColor: "#2E7D32",
  },
  clockHandCenterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2E7D32",
    marginTop: -5,
  },
  clockNumberContainer: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  clockNumberSelected: {
    backgroundColor: "#2E7D32",
  },
  clockNumberText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#777265",
    textAlign: "center",
  },
  clockNumberTextSelected: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  controlPanelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  modeToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F7F6F1",
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: "#E5DEC9",
  },
  modeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9,
  },
  modeButtonActive: {
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      web: { boxShadow: "0 2px 4px rgba(0,0,0,0.03)" },
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2 },
      android: { elevation: 1 },
    }),
  },
  modeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#777265",
  },
  modeTextActive: {
    color: "#2E7D32",
  },
  ampmToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F7F6F1",
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: "#E5DEC9",
  },
  ampmButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9,
  },
  ampmButtonActive: {
    backgroundColor: "#2E7D32",
  },
  ampmText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#777265",
  },
  ampmTextActive: {
    color: "#FFFFFF",
  },
  fineTuneContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FAF6EC",
    borderWidth: 1,
    borderColor: "#E5DEC9",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    width: "100%",
    marginBottom: 12,
  },
  fineTuneButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1E1E1D",
    justifyContent: "center",
    alignItems: "center",
  },
  fineTuneLabelContainer: {
    alignItems: "center",
  },
  fineTuneLabelText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#A6A6A6",
    textTransform: "uppercase",
  },
  fineTuneValueText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  digitalClockContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#FAF6EC",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5DEC9",
  },
  digitalClockTimeBox: {
    backgroundColor: "#1E1E1D",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 60,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  digitalClockTimeText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  digitalClockColon: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E1E1D",
    marginHorizontal: 10,
  },
});
