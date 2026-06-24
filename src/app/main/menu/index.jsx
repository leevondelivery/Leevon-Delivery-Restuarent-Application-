import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles as globalStyles } from "../../../styles/main.styles";

const isMobile = Platform.OS === "ios" || Platform.OS === "android";

const getApiUrl = () => {
  return "https://restuarentbackend.onrender.com";
};

const API_URL = getApiUrl();

export default function MyMenuPage() {
  const [restId, setRestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const getStoredRestId = async () => {
      try {
        const storedRestId = await AsyncStorage.getItem("restId");
        if (storedRestId) {
          setRestId(storedRestId);
          await fetchItems(storedRestId);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error reading restId from storage:", error);
        setLoading(false);
      }
    };
    getStoredRestId();
  }, []);

  const fetchItems = async (id) => {
    try {
      setLoading(true);
      console.log(`Fetching items for restaurantId: ${id} from ${API_URL}/itemstatus/${id}`);
      const res = await fetch(`${API_URL}/itemstatus/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setItems(data.items || []);
        }
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemStatus = async (item) => {
    const newStatus = !item.itemStatus;
    
    // Optimistic update
    setItems((prevItems) =>
      prevItems.map((i) =>
        i._id === item._id ? { ...i, itemStatus: newStatus } : i
      )
    );

    try {
      const res = await fetch(`${API_URL}/toggle-itemstatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: item._id,
          itemStatus: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error("Failed to update status on server:", data.message);
        // Revert
        setItems((prevItems) =>
          prevItems.map((i) =>
            i._id === item._id ? { ...i, itemStatus: item.itemStatus } : i
          )
        );
      }
    } catch (error) {
      console.error("Network error toggling item status:", error);
      // Revert
      setItems((prevItems) =>
        prevItems.map((i) =>
          i._id === item._id ? { ...i, itemStatus: item.itemStatus } : i
        )
      );
    }
  };

  return (
    <View style={globalStyles.mainContainer}>
      <SafeAreaView style={globalStyles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={globalStyles.headerContainer}>
            {/* Circular Back Button on Left */}
            <Pressable
              onPress={() => router.push("/main/home")}
              style={({ pressed }) => [
                globalStyles.headerPillLeftButton,
                pressed && { opacity: 0.8 },
              ]}
            >
              <FontAwesome name="chevron-left" size={16} color="#1E1E1D" />
            </Pressable>

            {/* Centered Capsule Header Pill */}
            <View style={globalStyles.headerPill}>
              <FontAwesome name="cutlery" size={18} color="#777265" style={globalStyles.headerPillIcon} />
              <Text style={globalStyles.headerPillText}>My Menu</Text>
            </View>
          </View>

          {/* Content Area */}
          <View style={localStyles.contentContainer}>
            <View style={localStyles.menuCard}>
              {loading ? (
                <View style={localStyles.loaderContainer}>
                  <ActivityIndicator size="large" color="#1E1E1D" />
                </View>
              ) : items.filter((item) => item.itemtodisplayintherestuarentapp === true).length === 0 ? (
                <View style={localStyles.emptyContainer}>
                  <FontAwesome name="info-circle" size={40} color="#777265" style={{ marginBottom: 12 }} />
                  <Text style={localStyles.emptyText}>No menu items found for this restaurant.</Text>
                </View>
              ) : (
                items
                  .filter((item) => item.itemtodisplayintherestuarentapp === true)
                  .map((item) => (
                    <View key={item._id} style={localStyles.capsuleRow}>
                      <View style={localStyles.rowLeft}>
                        <View style={localStyles.itemInfo}>
                          <Text style={localStyles.itemNameText} numberOfLines={1}>{item.itemName}</Text>
                          <Text style={localStyles.itemPriceText}>₹ {item.price}</Text>
                        </View>
                      </View>
                      
                      <Pressable
                        onPress={() => toggleItemStatus(item)}
                        style={({ pressed }) => [
                          localStyles.switchContainer,
                          pressed && { opacity: 0.8 }
                        ]}
                      >
                        <View style={[
                          localStyles.switchTrack,
                          item.itemStatus ? localStyles.switchTrackOn : localStyles.switchTrackOff
                        ]}>
                          <View style={localStyles.switchKnob} />
                        </View>
                      </Pressable>
                    </View>
                  ))
              )}
            </View>
          </View>
        </ScrollView>
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
  menuCard: {
    backgroundColor: "#EADFC9", // soft tan/brown color matching theme
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
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  itemInfo: {
    flexDirection: "column",
    justifyContent: "center",
  },
  itemNameText: {
    fontSize: isMobile ? 15 : 18,
    fontWeight: "700",
    color: "#1E1E1D",
    textTransform: "capitalize",
    marginBottom: 2,
  },
  itemPriceText: {
    fontSize: isMobile ? 12 : 14,
    fontWeight: "600",
    color: "#777265",
  },
  switchContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  switchTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: "center",
  },
  switchTrackOn: {
    backgroundColor: "#0AB28D",
    alignItems: "flex-end",
  },
  switchTrackOff: {
    backgroundColor: "#E05638",
    alignItems: "flex-start",
  },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
      },
    }),
  },
  loaderContainer: {
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  emptyContainer: {
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  emptyText: {
    fontSize: isMobile ? 14 : 16,
    color: "#777265",
    fontWeight: "600",
    textAlign: "center",
  },
});
