import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles as globalStyles } from "../../../../styles/main.styles";
import LogoLoader from "../../../../components/LogoLoader";

const getApiUrl = () => {
  return "https://restuarentbackend.onrender.com";
};

const API_URL = getApiUrl();

const MOCK_REJECTED = [
  {
    _id: "rej1",
    orderId: "ORD-00711",
    userName: "Sai",
    userPhone: "6300733511",
    deliveryAddress: "Kurnool, AP",
    rejectedAt: "2026-06-19T10:15:00.000Z",
    totalPrice: 157,
    items: [{ name: "Milk Chocolate Waffle", quantity: 1, price: 119 }]
  }
];

export default function RejectedOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});

  const fetchRejectedOrders = useCallback(async (showPullIndicator = false) => {
    if (showPullIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const storedRestId = await AsyncStorage.getItem("restId");
      if (!storedRestId) {
        throw new Error("No restaurant ID found. Please log in again.");
      }

      if (storedRestId === "demo_rest_101") {
        setOrders(MOCK_REJECTED);
        return;
      }

      console.log(`Fetching rejected orders for restaurantId: ${storedRestId} from ${API_URL}`);
      const res = await fetch(`${API_URL}/rejected-orders/${storedRestId}`);
      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        throw new Error(data.message || "Failed to fetch rejected orders");
      }
    } catch (err) {
      console.log("Error fetching rejected orders:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRejectedOrders();
  }, [fetchRejectedOrders]);

  const toggleExpandOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const formatRejectedDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      const datePart = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? "0" + minutes : minutes;
      const hoursStr = hours < 10 ? "0" + hours : hours;
      return `${datePart}, ${hoursStr}:${minutesStr} ${ampm}`;
    } catch (e) {
      return dateStr;
    }
  };

  const renderOrderItem = ({ item }) => {
    const originalTotal = item.totalPrice || item.grandTotal || 0;
    const totalQty = item.items?.reduce((sum, fi) => sum + (fi.quantity || 0), 0) || 0;

    return (
      <View style={localStyles.orderCard}>
        {/* Invoice Receipt Container */}
        <View style={localStyles.receiptContainer}>
          {/* Card Header: Order ID & Date Pill */}
          <View style={localStyles.cardHeaderPill}>
            <Text style={localStyles.orderIdText}>
              ORDER ID: {item.orderId || `ORD-${item._id?.substring(0, 8)}`}
            </Text>
            <Text style={localStyles.orderDateText}>{formatRejectedDate(item.rejectedAt || item.orderDate)}</Text>
          </View>

          {/* Columns Header */}
          <View style={localStyles.itemTableHeader}>
            <Text style={localStyles.headerColItem}>ITEM</Text>
            <Text style={localStyles.headerColQty}>QTY</Text>
            <Text style={localStyles.headerColPrice}>PRICE</Text>
          </View>

          {/* Ordered Items List */}
          {Array.isArray(item.items) &&
            item.items.map((foodItem, index) => {
              const originalPrice = foodItem.price || 0;
              return (
                <View key={foodItem._id || index} style={localStyles.foodItemRow}>
                  <View style={localStyles.foodItemColName}>
                    <Text style={localStyles.foodItemName}>{foodItem.name}</Text>
                  </View>
                  <View style={localStyles.foodItemColQty}>
                    <Text style={localStyles.foodItemQty}>x{foodItem.quantity}</Text>
                  </View>
                  <View style={localStyles.foodItemColPrice}>
                    <Text style={localStyles.discountedPriceText}>₹{originalPrice}</Text>
                  </View>
                </View>
              );
            })}

          {/* Solid divider line */}
          <View style={localStyles.dividerSolid} />

          {/* Total Row */}
          <View style={localStyles.totalRow}>
            <Text style={localStyles.totalLabelText}>Total Quantity</Text>
            <Text style={localStyles.totalValueText}>{totalQty}</Text>
          </View>
          <View style={[localStyles.totalRow, { marginTop: 4 }]}>
            <Text style={localStyles.totalLabelText}>Total Price</Text>
            <Text style={localStyles.totalValueText}>₹{originalTotal}</Text>
          </View>

          {/* Rejected Status Badge */}
          <View style={localStyles.rejectedBadge}>
            <FontAwesome name="ban" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={localStyles.rejectedBadgeText}>Rejected</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[globalStyles.mainContainer, { justifyContent: "center", alignItems: "center" }]}>
        <LogoLoader title="Fetching rejected orders..." subtitle="Please wait a second" />
      </View>
    );
  }

  return (
    <View style={globalStyles.mainContainer}>
      <SafeAreaView style={globalStyles.safeArea} edges={["top", "left", "right"]}>
        <FlatList
          ListHeaderComponent={
            <View style={[globalStyles.headerContainer, { alignSelf: "center", marginBottom: 8 }]}>
              <Pressable
                onPress={() => router.push("/main/settings")}
                style={({ pressed }) => [
                  globalStyles.headerPillLeftButton,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <FontAwesome name="chevron-left" size={16} color="#1E1E1D" />
              </Pressable>

              <View style={globalStyles.headerPill}>
                <FontAwesome name="ban" size={18} color="#777265" style={globalStyles.headerPillIcon} />
                <Text style={globalStyles.headerPillText}>Rejected Orders</Text>
              </View>
            </View>
          }
          data={error ? [] : orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id || item.orderId}
          contentContainerStyle={[
            localStyles.listContent,
            (orders.length === 0 || error) && { flexGrow: 1, justifyContent: "center" }
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchRejectedOrders(true)}
              colors={["#E05638"]}
              tintColor="#E05638"
            />
          }
          ListEmptyComponent={
            error ? (
              <View style={localStyles.centerContainer}>
                <FontAwesome name="exclamation-triangle" size={48} color="#E05638" />
                <Text style={localStyles.errorText}>{error}</Text>
                <Pressable onPress={() => fetchRejectedOrders()} style={localStyles.retryButton}>
                  <Text style={localStyles.retryText}>Retry</Text>
                </Pressable>
              </View>
            ) : (
              <View style={localStyles.emptyContainer}>
                <FontAwesome name="ban" size={60} color="#777265" />
                <Text style={localStyles.emptyTitle}>No Rejected Orders</Text>
                <Text style={localStyles.emptySubtitle}>
                  Orders that you reject will appear in this list.
                </Text>
                <Pressable onPress={() => fetchRejectedOrders()} style={localStyles.retryButton}>
                  <Text style={localStyles.retryText}>Refresh</Text>
                </Pressable>
              </View>
            )
          }
        />
      </SafeAreaView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 16,
  },
  orderCard: {
    backgroundColor: "#FAF6EC",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5DEC9",
    width: "100%",
    maxWidth: 550,
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
      },
    }),
  },
  customerSection: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5DEC9",
    paddingBottom: 12,
    marginBottom: 12,
  },
  customerHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerHeaderTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#777265",
  },
  customerDetailsContent: {
    marginTop: 10,
    gap: 6,
  },
  customerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerLabel: {
    width: 80,
    fontSize: 12,
    fontWeight: "700",
    color: "#777265",
  },
  customerValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E1E1D",
  },
  receiptContainer: {
    backgroundColor: "#FAF6EC",
  },
  cardHeaderPill: {
    backgroundColor: "#E5DEC9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    marginBottom: 16,
  },
  orderIdText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  orderDateText: {
    fontSize: 11,
    color: "#777265",
    fontWeight: "600",
  },
  itemTableHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5DEC9",
    marginBottom: 8,
  },
  headerColItem: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  headerColQty: {
    width: 60,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  headerColPrice: {
    width: 90,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  foodItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F4EFE0",
    borderStyle: "dashed",
  },
  foodItemColName: {
    flex: 1,
  },
  foodItemColQty: {
    width: 60,
    alignItems: "center",
  },
  foodItemColPrice: {
    width: 90,
    alignItems: "flex-end",
  },
  foodItemName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3A3937",
    lineHeight: 18,
  },
  foodItemQty: {
    fontSize: 13,
    color: "#3A3937",
    fontWeight: "600",
  },
  discountedPriceText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E1E1D",
  },
  dividerSolid: {
    height: 1,
    backgroundColor: "#E5DEC9",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabelText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#777265",
  },
  totalValueText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  rejectedBadge: {
    backgroundColor: "#E05638",
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 16,
  },
  rejectedBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    marginTop: 12,
    fontSize: 15,
    color: "#E05638",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#1E1E1D",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    minHeight: 220,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1E1D",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#777265",
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 16,
  },
});
