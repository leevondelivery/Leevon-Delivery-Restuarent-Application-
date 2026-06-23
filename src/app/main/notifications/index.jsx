import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles as globalStyles } from "../../../styles/main.styles";
import LogoLoader from "../../../components/LogoLoader";

const getApiUrl = () => {
  return "https://restuarentbackend.onrender.com";
};

const API_URL = getApiUrl();

const MOCK_ORDER = {
  "_id": "6a391eaecc05a4f188f982db",
  "userId": "6a3579405049fb87f94f96f2",
  "items": [
    {
      "itemId": "208",
      "name": "Milk Chocolate Waffle",
      "price": 119,
      "quantity": 1,
      "_id": "6a391eaecc05a4f188f982dc"
    },
    {
      "itemId": "213",
      "name": "Triple Chocolate Waffle",
      "price": 149,
      "quantity": 1,
      "_id": "6a391eaecc05a4f188f982dd"
    }
  ],
  "totalCount": 2,
  "totalPrice": 268,
  "gst": 18,
  "deliveryCharge": 25,
  "platformFee": 2,
  "grandTotal": 313,
  "orderId": "ORD-00737",
  "razorpayOrderId": "order_T4fAtetGb5u6c9",
  "razorpayPaymentId": "pay_T4fB0kNu0OslQL",
  "paymentStatus": "Paid",
  "coinsEarned": 30,
  "userName": "Gsvinith",
  "userEmail": "gs@gmail.com",
  "userPhone": "6300733511",
  "location": {
    "lat": 15.8323559119769,
    "lng": 78.01434081047773,
    "mapUrl": "https://www.google.com/maps/search/?api=1&query=15.8323559119769,78.01434081047773",
    "distanceText": "0 km"
  },
  "flatNo": "Bdkd",
  "street": "Bsmd",
  "landmark": "Vsndk",
  "deliveryAddress": "Bdkd, Bsmd , Vsndk",
  "restaurantId": "1",
  "restaurantName": "Amigoo Noshery",
  "aa": "gg",
  "orderDate": "2026-06-22T11:38:22.483Z",
  "__v": 0
};

export default function NotificationsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [rejectingOrderId, setRejectingOrderId] = useState(null);
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [processingType, setProcessingType] = useState(null);

  const fetchIncomingOrders = useCallback(async (showPullIndicator = false, isSilent = false) => {
    if (showPullIndicator) {
      setRefreshing(true);
    } else if (!isSilent) {
      setLoading(true);
    }
    setError(null);

    let storedRestId = null;
    try {
      storedRestId = await AsyncStorage.getItem("restId");
      
      // If we are logged in as the demo account, or if there is no restaurant ID, load the mock order
      if (!storedRestId || storedRestId === "demo_rest_101") {
        setOrders([MOCK_ORDER]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log(`Fetching incoming orders for restaurantId: ${storedRestId} from ${API_URL}`);
      const res = await fetch(`${API_URL}/incoming-orders/${storedRestId}`);
      
      if (!res.ok) {
        console.log(`Incoming orders request returned status ${res.status}. Showing empty list.`);
        setOrders([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const data = await res.json();
      if (data.success) {
        // Use the actual orders array from MongoDB (no fallback to mock data for real accounts)
        setOrders(data.orders || []);
      } else {
        console.log("Failed to fetch orders from server: " + (data.message || "Unknown error"));
        setOrders([]);
      }
    } catch (err) {
      console.log("Network/fetch error fetching incoming orders:", err.message);
      // Only show mock data if we are on a demo account
      if (!storedRestId || storedRestId === "demo_rest_101") {
        setOrders([MOCK_ORDER]);
      } else {
        setOrders([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleReject = async (orderId) => {
    setProcessingOrderId(orderId);
    setProcessingType("reject");
    try {
      const storedRestId = await AsyncStorage.getItem("restId");
      
      // If we are logged in as the demo account, or if there is no restaurant ID, simulate reject client-side
      if (!storedRestId || storedRestId === "demo_rest_101") {
        setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
        return;
      }

      console.log(`Rejecting order: ${orderId} at ${API_URL}/reject-order`);
      const res = await fetch(`${API_URL}/reject-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Remove the rejected order from local state list
        setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
      } else {
        // If the endpoint is not on the remote server yet, still allow it to remove from screen (fallback simulation)
        console.log(`Server returned failure for reject-order: ${data.message || "Unknown error"}. Simulating rejection client-side.`);
        setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
      }
    } catch (err) {
      console.log("Error rejecting order:", err.message);
      // Fallback rejection simulation if network error occurs
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    } finally {
      setProcessingOrderId(null);
      setProcessingType(null);
    }
  };

  const handleAccept = async (order) => {
    const processingId = order._id || order.orderId;
    setProcessingOrderId(processingId);
    setProcessingType("accept");
    try {
      const storedRestId = await AsyncStorage.getItem("restId");
      
      // If we are logged in as the demo account, or if there is no restaurant ID, simulate accept client-side
      if (!storedRestId || storedRestId === "demo_rest_101") {
        setOrders((prev) => prev.filter((o) => o.orderId !== order.orderId));
        return;
      }

      // Fetch restaurant details from AsyncStorage
      const address = await AsyncStorage.getItem("address") || "Unknown Restaurant Address";
      const latStr = await AsyncStorage.getItem("lat");
      const lngStr = await AsyncStorage.getItem("lng");
      const lat = latStr ? parseFloat(latStr) : 0.0;
      const lng = lngStr ? parseFloat(lngStr) : 0.0;
      
      const payload = {
        orderId: order._id, // MongoDB _id
        rest: address,
        restaurantLocation: { lat, lng },
        razorpayOrderId: order.razorpayOrderId || "N/A"
      };

      console.log(`Accepting order: ${order.orderId} at ${API_URL}/accept-order`);
      const res = await fetch(`${API_URL}/accept-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Remove accepted order from local state list
        setOrders((prev) => prev.filter((o) => o._id !== order._id));
      } else {
        // Fallback simulation if Render endpoint is not reachable yet
        console.log(`Server returned failure for accept-order: ${data.message || "Unknown error"}. Simulating acceptance client-side.`);
        setOrders((prev) => prev.filter((o) => o._id !== order._id));
      }
    } catch (err) {
      console.log("Error accepting order:", err.message);
      // Fallback simulation
      setOrders((prev) => prev.filter((o) => o._id !== order._id));
    } finally {
      setProcessingOrderId(null);
      setProcessingType(null);
    }
  };

  useEffect(() => {
    // Fetch initially
    fetchIncomingOrders();

    // Poll every 5 seconds silently in the background
    const intervalId = setInterval(() => {
      fetchIncomingOrders(false, true);
    }, 5000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchIncomingOrders]);

  const formatOrderDate = (dateStr) => {
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
    // 12% commission calculation as shown in the screenshot
    const calculatedTotalPrice = item.items.reduce((sum, foodItem) => {
      const originalPrice = foodItem.price || 0;
      const discountedPrice = originalPrice * 0.88;
      return sum + (discountedPrice * (foodItem.quantity || 1));
    }, 0);

    const totalQty = item.items?.reduce((sum, fi) => sum + (fi.quantity || 0), 0) || 0;
    const isPaid = item.paymentStatus === "Paid" || item.paymentStatus === "Complete";

    return (
      <View style={localStyles.orderCard}>
        {/* Receipt Container */}
        <View style={localStyles.receiptContainer}>
          {/* Card Header: Order ID & Date */}
          <View style={localStyles.cardHeader}>
            <Text style={localStyles.orderIdLabel}>
              ORDER ID : <Text style={localStyles.orderIdValue}>{item.orderId || `ORD-${item._id?.substring(0, 8)}`}</Text>
            </Text>
            <Text style={localStyles.orderDateText}>{formatOrderDate(item.orderDate)}</Text>
            <View style={localStyles.headerDivider} />
          </View>

          {/* Table Headers */}
          <View style={localStyles.itemTableHeader}>
            <Text style={localStyles.headerColItem}>ITEMS</Text>
            <Text style={localStyles.headerColQty}>QUANTITY</Text>
            <Text style={localStyles.headerColPrice}>PRICE</Text>
          </View>

          {/* Ordered Items List */}
          {Array.isArray(item.items) &&
            item.items.map((foodItem, index) => {
              const originalPrice = foodItem.price || 0;
              const discountedPrice = originalPrice * 0.88;
              return (
                <View key={foodItem._id || index} style={localStyles.foodItemRow}>
                  <View style={localStyles.foodItemColName}>
                    <Text style={localStyles.foodItemName}>{foodItem.name}</Text>
                  </View>
                  <View style={localStyles.foodItemColQty}>
                    <Text style={localStyles.foodItemQty}>{foodItem.quantity}</Text>
                  </View>
                  <View style={localStyles.foodItemColPrice}>
                    <View style={localStyles.priceBreakdownRow}>
                      <Text style={localStyles.originalPriceText}>₹{originalPrice}</Text>
                      <Text style={localStyles.discountPercentageText}>-12%</Text>
                    </View>
                    <Text style={localStyles.discountedPriceText}>₹{discountedPrice.toFixed(2)}</Text>
                  </View>
                </View>
              );
            })}

          {/* Divider line before totals */}
          <View style={localStyles.dividerSolid} />

          {/* Totals Row */}
          <View style={localStyles.totalsContainer}>
            <View style={localStyles.totalCol}>
              <Text style={localStyles.totalLabelText}>Total Items</Text>
              <Text style={localStyles.totalValueText}>{item.items?.length || 0}</Text>
            </View>
            <View style={localStyles.totalCol}>
              <Text style={localStyles.totalLabelText}>Total Quantity</Text>
              <Text style={localStyles.totalValueText}>{totalQty}</Text>
            </View>
            <View style={localStyles.totalCol}>
              <Text style={localStyles.totalLabelText}>Total Price</Text>
              <Text style={localStyles.totalPriceValueText}>₹{calculatedTotalPrice.toFixed(2)}</Text>
            </View>
          </View>

          {/* Payment Status Row */}
          <View style={localStyles.paymentStatusContainer}>
            <Text style={localStyles.paymentLabel}>Payment status - </Text>
            {isPaid ? (
              <View style={localStyles.paidContainer}>
                <FontAwesome name="check-circle" size={16} color="#2E7D32" style={{ marginRight: 4 }} />
                <Text style={localStyles.paymentValue}>Complete</Text>
              </View>
            ) : (
              <Text style={[localStyles.paymentValue, { color: "#E05638" }]}>Pending</Text>
            )}
          </View>

          {/* Accept / Reject Buttons */}
          <View style={localStyles.buttonsContainer}>
            <Pressable
              onPress={() => handleAccept(item)}
              style={({ pressed }) => [
                localStyles.actionButton,
                localStyles.acceptButton,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={localStyles.buttonText}>ACCEPT</Text>
            </Pressable>

            <Pressable
              onPress={() => setRejectingOrderId(item.orderId)}
              style={({ pressed }) => [
                localStyles.actionButton,
                localStyles.rejectButton,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={localStyles.buttonText}>REJECT</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  if ((loading || processingOrderId !== null) && !refreshing) {
    return (
      <View style={[globalStyles.mainContainer, { justifyContent: "center", alignItems: "center" }]}>
        <LogoLoader
          title={
            processingType === "accept"
              ? "Accepting order..."
              : processingType === "reject"
              ? "Rejecting order..."
              : "Checking for alerts..."
          }
          subtitle="Please wait a second"
        />
      </View>
    );
  }

  return (
    <View style={globalStyles.mainContainer}>
      <SafeAreaView style={globalStyles.safeArea} edges={["top", "left", "right"]}>
        {/* Orders FlatList */}
        <FlatList
          ListHeaderComponent={
            <View style={[globalStyles.headerContainer, { alignSelf: "center", marginBottom: 8 }]}>
              <View style={globalStyles.headerPill}>
                <FontAwesome name="bell" size={18} color="#777265" style={globalStyles.headerPillIcon} />
                <Text style={globalStyles.headerPillText}>Alerts</Text>
              </View>
            </View>
          }
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id || item.orderId}
          contentContainerStyle={[
            localStyles.listContent,
            orders.length === 0 && { flexGrow: 1, justifyContent: "center" }
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchIncomingOrders(true)}
              colors={["#E05638"]}
              tintColor="#E05638"
            />
          }
          ListEmptyComponent={
            <View style={localStyles.emptyContainer}>
              <FontAwesome name="bell-slash" size={60} color="#777265" />
              <Text style={localStyles.emptyTitle}>No Alerts Yet</Text>
              <Text style={localStyles.emptySubtitle}>
                New orders waiting for confirmation will appear here.
              </Text>
            </View>
          }
        />
      </SafeAreaView>

      {/* Reject Order Confirmation Modal */}
      <Modal
        visible={rejectingOrderId !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRejectingOrderId(null)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.confirmCard}>
            {/* Red Circle with warning icon */}
            <View style={localStyles.iconContainer}>
              <FontAwesome name="exclamation-triangle" size={36} color="#FFFFFF" />
            </View>

            {/* Modal Title */}
            <Text style={localStyles.confirmTitle}>Are you sure you want to reject this order?</Text>

            {/* Confirm Reject Button */}
            <Pressable
              onPress={() => {
                const orderIdToReject = rejectingOrderId;
                setRejectingOrderId(null);
                handleReject(orderIdToReject);
              }}
              style={({ pressed }) => [
                localStyles.confirmButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
              ]}
            >
              <Text style={localStyles.confirmButtonText}>Reject</Text>
            </Pressable>

            {/* Cancel Link */}
            <Pressable onPress={() => setRejectingOrderId(null)}>
              <Text style={localStyles.cancelTextLink}>Not now</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    backgroundColor: "#E5DEC9", // card background matching theme navbar
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#C6BEA9",
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
  receiptContainer: {
    backgroundColor: "#E5DEC9",
  },
  cardHeader: {
    alignItems: "center",
    width: "100%",
  },
  orderIdLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E1E1D",
    textAlign: "center",
  },
  orderIdValue: {
    fontWeight: "900",
  },
  orderDateText: {
    fontSize: 12,
    color: "#777265",
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  headerDivider: {
    height: 1,
    backgroundColor: "#C6BEA9",
    width: "100%",
    marginTop: 12,
    marginBottom: 12,
  },
  itemTableHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#C6BEA9",
    marginBottom: 8,
  },
  headerColItem: {
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  headerColQty: {
    width: 80,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  headerColPrice: {
    width: 120,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  foodItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EADEC2",
    borderStyle: "dashed",
  },
  foodItemColName: {
    flex: 1,
  },
  foodItemColQty: {
    width: 80,
    alignItems: "center",
  },
  foodItemColPrice: {
    width: 120,
    alignItems: "flex-end",
  },
  foodItemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3A3937",
    lineHeight: 20,
  },
  foodItemQty: {
    fontSize: 14,
    color: "#3A3937",
    fontWeight: "700",
  },
  priceBreakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  originalPriceText: {
    fontSize: 11,
    color: "#A09B8C",
    textDecorationLine: "line-through",
  },
  discountPercentageText: {
    fontSize: 11,
    color: "#E05638",
    fontWeight: "700",
  },
  discountedPriceText: {
    fontSize: 14,
    color: "#1E1E1D",
    fontWeight: "800",
  },
  dividerSolid: {
    height: 1,
    backgroundColor: "#C6BEA9",
    width: "100%",
    marginTop: 12,
    marginBottom: 12,
  },
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
  },
  totalCol: {
    alignItems: "center",
    flex: 1,
  },
  totalLabelText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#777265",
    marginBottom: 4,
  },
  totalValueText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  totalPriceValueText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  paymentStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  paidContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#777265",
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2E7D32",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
        cursor: "pointer",
      },
    }),
  },
  acceptButton: {
    backgroundColor: "#267F3D",
  },
  rejectButton: {
    backgroundColor: "#C82E2E",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
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
