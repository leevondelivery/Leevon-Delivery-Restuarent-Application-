import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LogoLoader from "../../../components/LogoLoader";
import { styles as globalStyles } from "../../../styles/main.styles";

const isMobile = Platform.OS === "ios" || Platform.OS === "android";

const getApiUrl = () => {
  return "https://restuarentbackend.onrender.com";
};

const API_URL = getApiUrl();

// HTML receipt print template matching the mockup exactly
const generateInvoiceHtml = (order, address = "None", fssai = "None") => {
  const formatPrintDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      const datePart = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? "0" + minutes : minutes;
      const secondsStr = seconds < 10 ? "0" + seconds : seconds;
      const hoursStr = hours < 10 ? "0" + hours : hours;
      return `${datePart}, ${hoursStr}:${minutesStr}:${secondsStr} ${ampm}`;
    } catch (e) {
      return dateStr;
    }
  };

  const totalAmount = order.totalPrice || order.grandTotal || 0;

  const itemRowsHtml = Array.isArray(order.items)
    ? order.items
      .map((foodItem) => {
        const itemPrice = foodItem.price || 0;
        return `
            <tr class="item-row">
              <td class="col-item">${foodItem.name}</td>
              <td class="col-qty">${foodItem.quantity}</td>
              <td class="col-price">₹${itemPrice.toFixed(2)}</td>
            </tr>
          `;
      })
      .join("")
    : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body {
            font-family: 'Courier New', Courier, monospace;
            margin: 0;
            padding: 10px;
            background-color: #ffffff;
            color: #1e1e1d;
          }
          .receipt {
            max-width: 320px;
            margin: 0 auto;
            padding: 10px;
            background-color: #ffffff;
          }
          .center {
            text-align: center;
          }
          .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .meta {
            font-size: 12px;
            color: #777265;
            margin: 2px 0;
          }
          .dashed-line {
            border-top: 1px dashed #777265;
            margin: 10px 0;
          }
          .row {
            font-size: 13px;
            font-weight: bold;
            margin: 4px 0;
          }
          .table-header {
            font-size: 13px;
            font-weight: bold;
          }
          .item-row {
            font-size: 13px;
          }
          .col-item {
            text-align: left;
            font-weight: 600;
          }
          .col-qty {
            text-align: center;
            width: 40px;
          }
          .col-price {
            text-align: right;
            width: 90px;
            font-weight: bold;
          }
          .total-row {
            font-size: 15px;
            font-weight: bold;
          }
          .footer {
            font-size: 13px;
            text-align: center;
            font-style: italic;
            margin-top: 20px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="center">
            <div class="title">🍽️ ${order.restaurantName || "Restaurant"}</div>
            <div class="meta">Address: ${address}</div>
            <div class="meta">FSSAI: ${fssai}</div>
          </div>

          <div class="dashed-line"></div>

          <div class="row">Order ID: ${order.orderId || `ORD-${order._id?.substring(0, 8)}`}</div>
          <div class="row">Date: ${formatPrintDate(order.orderDate)}</div>

          <div class="dashed-line"></div>

          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr class="table-header">
                <th class="col-item">ITEM</th>
                <th class="col-qty">QTY</th>
                <th class="col-price">PRICE</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="3"><div class="dashed-line" style="margin: 4px 0 8px 0;"></div></td></tr>
              ${itemRowsHtml}
            </tbody>
          </table>

          <div class="dashed-line" style="margin-top: 8px;"></div>

          <table style="width: 100%;">
            <tr class="total-row">
              <td style="text-align: left;">Grand Total</td>
              <td style="text-align: right;">₹${totalAmount}</td>
            </tr>
          </table>

          <div class="footer">
            🙏 Thank you for ordering!
          </div>
        </div>
      </body>
    </html>
  `;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [restaurantAddress, setRestaurantAddress] = useState("None");
  const [restaurantFssai, setRestaurantFssai] = useState("None");

  const fetchOrders = useCallback(async (showPullIndicator = false) => {
    if (showPullIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch restId from storage
      const storedRestId = await AsyncStorage.getItem("restId");
      if (!storedRestId) {
        throw new Error("No restaurant ID found. Please log in again.");
      }
      setRestaurantId(storedRestId);

      if (storedRestId === "demo_rest_101") {
        setOrders([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log(`Fetching orders for restaurantId: ${storedRestId} from ${API_URL}`);
      const res = await fetch(`${API_URL}/restaurant-orders/${storedRestId}`);

      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        throw new Error(data.message || "Failed to fetch orders from server");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Fetch address and fssai details
    const getRestaurantDetails = async () => {
      try {
        const storedAddress = await AsyncStorage.getItem("address");
        const storedFssai = await AsyncStorage.getItem("fssai");
        if (storedAddress) setRestaurantAddress(storedAddress);
        if (storedFssai) setRestaurantFssai(storedFssai);
      } catch (err) {
        console.error("Error reading restaurant details from storage:", err);
      }
    };
    getRestaurantDetails();
  }, [fetchOrders]);

  const toggleExpandOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleCallUser = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch((err) =>
      console.error("Failed to make call:", err)
    );
  };

  const handleGenerateInvoice = async (order) => {
    try {
      const html = generateInvoiceHtml(order, restaurantAddress, restaurantFssai);
      await Print.printAsync({
        html,
      });
    } catch (error) {
      console.error("Failed to print invoice:", error);
      Alert.alert("Print Error", "Could not print or generate the invoice PDF.");
    }
  };

  const formatOrderDateWithSeconds = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      const datePart = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minutesStr = minutes < 10 ? "0" + minutes : minutes;
      const secondsStr = seconds < 10 ? "0" + seconds : seconds;
      const hoursStr = hours < 10 ? "0" + hours : hours;
      return `${datePart}, ${hoursStr}:${minutesStr}:${secondsStr} ${ampm}`;
    } catch (e) {
      return dateStr;
    }
  };

  const formatOrderDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      const datePart = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minutesStr = minutes < 10 ? "0" + minutes : minutes;
      const hoursStr = hours < 10 ? "0" + hours : hours;
      return `${datePart}, ${hoursStr}:${minutesStr} ${ampm}`;
    } catch (e) {
      return dateStr;
    }
  };

  const renderOrderItem = ({ item }) => {
    const isExpanded = expandedOrders[item._id];
    const originalTotal = item.totalPrice || item.grandTotal || 0;

    return (
      <View style={localStyles.orderCard}>
        {/* Collapsible Customer Info Section (operational usefulness) */}
        {(item.userName || item.userPhone || item.deliveryAddress) && (
          <View style={localStyles.customerSection}>
            <Pressable
              onPress={() => toggleExpandOrder(item._id)}
              style={localStyles.customerHeaderRow}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <FontAwesome name="user" size={13} color="#777265" style={{ marginRight: 6 }} />
                <Text style={localStyles.customerHeaderTitle}>Customer & Delivery Info</Text>
              </View>
              <FontAwesome
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={11}
                color="#777265"
              />
            </Pressable>

            {isExpanded && (
              <View style={localStyles.customerDetailsContent}>
                <View style={localStyles.customerInfoRow}>
                  <Text style={localStyles.customerLabel}>Customer:</Text>
                  <Text style={localStyles.customerValue}>{item.userName || "Guest"}</Text>
                </View>

                {item.userPhone && (
                  <View style={localStyles.customerInfoRow}>
                    <Text style={localStyles.customerLabel}>Phone:</Text>
                    <Text style={localStyles.customerValue}>{item.userPhone}</Text>
                  </View>
                )}

                {item.deliveryAddress && (
                  <View style={[localStyles.customerInfoRow, { alignItems: "flex-start" }]}>
                    <Text style={localStyles.customerLabel}>Address:</Text>
                    <Text style={[localStyles.customerValue, { flex: 1 }]}>
                      {item.deliveryAddress}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Invoice Receipt Container */}
        <View style={localStyles.receiptContainer}>
          {/* Card Header: Order ID & Date Pill */}
          <View style={localStyles.cardHeaderPill}>
            <Text style={localStyles.orderIdText}>
              ORDER ID: {item.orderId || `ORD-${item._id?.substring(0, 8)}`}
            </Text>
            <Text style={localStyles.orderDateText}>{formatOrderDate(item.orderDate)}</Text>
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
            <Text style={localStyles.totalLabelText}>Total</Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={localStyles.totalValueText}>₹{originalTotal}</Text>
            </View>
          </View>
        </View>

        {/* Generate Invoice Action Button */}
        <Pressable
          onPress={() => setSelectedOrderForInvoice(item)}
          style={({ pressed }) => [
            localStyles.invoiceButton,
            pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
          ]}
        >
          <FontAwesome name="file-text-o" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={localStyles.invoiceButtonText}>Generate Invoice</Text>
        </Pressable>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[globalStyles.mainContainer, { justifyContent: "center", alignItems: "center" }]}>
        <LogoLoader title="Fetching your orders..." subtitle="Please wait a second" />
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
                <FontAwesome name="clipboard" size={18} color="#777265" style={globalStyles.headerPillIcon} />
                <Text style={globalStyles.headerPillText}>My Orders</Text>
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
              onRefresh={() => fetchOrders(true)}
              colors={["#E05638"]}
              tintColor="#E05638"
            />
          }
          ListEmptyComponent={
            error ? (
              <View style={localStyles.centerContainer}>
                <FontAwesome name="exclamation-triangle" size={48} color="#E05638" />
                <Text style={localStyles.errorText}>{error}</Text>
                <Pressable onPress={() => fetchOrders()} style={localStyles.retryButton}>
                  <Text style={localStyles.retryText}>Retry</Text>
                </Pressable>
              </View>
            ) : (
              <View style={localStyles.emptyContainer}>
                <FontAwesome name="calendar-times-o" size={60} color="#777265" />
                <Text style={localStyles.emptyTitle}>No Orders Yet</Text>
                <Text style={localStyles.emptySubtitle}>
                  When customers place orders, they will show up here.
                </Text>
                <Pressable onPress={() => fetchOrders()} style={localStyles.retryButton}>
                  <Text style={localStyles.retryText}>Refresh</Text>
                </Pressable>
              </View>
            )
          }
        />
      </SafeAreaView>

      {/* Receipt Modal Popup */}
      <Modal
        visible={selectedOrderForInvoice !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedOrderForInvoice(null)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContainer}>
            {/* Close Button */}
            <Pressable
              onPress={() => setSelectedOrderForInvoice(null)}
              style={({ pressed }) => [
                localStyles.closeButton,
                pressed && { opacity: 0.8 },
              ]}
            >
              <FontAwesome name="times" size={14} color="#1E1E1D" />
            </Pressable>

            {selectedOrderForInvoice && (
              <>
                {/* White Receipt Sheet */}
                <View style={localStyles.receiptSheet}>
                  {/* Restaurant Header */}
                  <View style={localStyles.receiptCenter}>
                    <Text style={[localStyles.monoText, localStyles.receiptRestName]}>
                      🍽️ {selectedOrderForInvoice.restaurantName || "Restaurant"}
                    </Text>
                    <Text style={[localStyles.monoText, localStyles.receiptMetaText]}>
                      Address: {restaurantAddress}
                    </Text>
                    <Text style={[localStyles.monoText, localStyles.receiptMetaText]}>
                      FSSAI: {restaurantFssai}
                    </Text>
                  </View>

                  {/* Dashed Separator */}
                  <Text style={[localStyles.monoText, localStyles.dashedLine]}>
                    ------------------------------------------
                  </Text>

                  {/* Order Details */}
                  <Text style={[localStyles.monoText, localStyles.receiptDetailRow]}>
                    Order ID: {selectedOrderForInvoice.orderId || `ORD-${selectedOrderForInvoice._id?.substring(0, 8)}`}
                  </Text>
                  <Text style={[localStyles.monoText, localStyles.receiptDetailRow]}>
                    Date: {formatOrderDateWithSeconds(selectedOrderForInvoice.orderDate)}
                  </Text>

                  {/* Dashed Separator */}
                  <Text style={[localStyles.monoText, localStyles.dashedLine]}>
                    ------------------------------------------
                  </Text>

                  {/* Columns Header */}
                  <View style={localStyles.receiptTableHeader}>
                    <Text style={[localStyles.monoText, localStyles.receiptHeaderColItem]}>ITEM</Text>
                    <Text style={[localStyles.monoText, localStyles.receiptHeaderColQty]}>QTY</Text>
                    <Text style={[localStyles.monoText, localStyles.receiptHeaderColPrice]}>PRICE</Text>
                  </View>

                  {/* Dashed Separator */}
                  <Text style={[localStyles.monoText, localStyles.dashedLine, { marginTop: 4, marginBottom: 8 }]}>
                    ------------------------------------------
                  </Text>

                  {/* Items */}
                  {Array.isArray(selectedOrderForInvoice.items) &&
                    selectedOrderForInvoice.items.map((foodItem, index) => {
                      const discountedPrice = foodItem.price || 0;
                      return (
                        <View key={foodItem._id || index} style={localStyles.receiptItemRow}>
                          <Text style={[localStyles.monoText, localStyles.receiptItemName]}>
                            {foodItem.name}
                          </Text>
                          <Text style={[localStyles.monoText, localStyles.receiptItemQty]}>
                            {foodItem.quantity}
                          </Text>
                          <Text style={[localStyles.monoText, localStyles.receiptItemPrice]}>
                            ₹{discountedPrice.toFixed(2)}
                          </Text>
                        </View>
                      );
                    })}

                  {/* Dashed Separator */}
                  <Text style={[localStyles.monoText, localStyles.dashedLine, { marginTop: 8 }]}>
                    ------------------------------------------
                  </Text>

                  {/* Grand Total */}
                  <View style={localStyles.receiptTotalRow}>
                    <Text style={[localStyles.monoText, localStyles.receiptTotalLabel]}>Grand Total</Text>
                    <Text style={[localStyles.monoText, localStyles.receiptTotalValue]}>
                      ₹{selectedOrderForInvoice.totalPrice || selectedOrderForInvoice.grandTotal || 0}
                    </Text>
                  </View>

                  {/* Thank You Footer */}
                  <Text style={[localStyles.monoText, localStyles.receiptFooter]}>
                    🙏 Thank you for ordering!
                  </Text>
                </View>

                {/* Print Button */}
                <Pressable
                  onPress={() => handleGenerateInvoice(selectedOrderForInvoice)}
                  style={({ pressed }) => [
                    localStyles.printAgainButton,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                  ]}
                >
                  <FontAwesome name="print" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={localStyles.printAgainButtonText}>Print</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const localStyles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#777265",
    fontWeight: "600",
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 16,
  },
  orderCard: {
    backgroundColor: "#FAF6EC", // card background
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
    width: 60,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  headerColPrice: {
    width: 100,
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
    width: 60,
    alignItems: "center",
  },
  foodItemColPrice: {
    width: 100,
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
    fontWeight: "600",
  },
  originalPriceText: {
    fontSize: 11,
    color: "#A09B8C",
    textDecorationLine: "line-through",
    marginBottom: 2,
  },
  discountedPriceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E1E1D",
  },
  commissionText: {
    fontSize: 10,
    color: "#B85C4B",
    fontWeight: "700",
    marginTop: 2,
  },
  dividerSolid: {
    height: 1,
    backgroundColor: "#C6BEA9",
    marginVertical: 14,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  totalLabelText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E1E1D",
  },
  totalValueText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  originalTotalText: {
    fontSize: 12,
    color: "#A09B8C",
    textDecorationLine: "line-through",
    marginBottom: 2,
  },
  totalCommissionText: {
    fontSize: 11,
    color: "#B85C4B",
    fontWeight: "700",
    marginTop: 2,
  },
  invoiceButton: {
    backgroundColor: "#2E2D2B",
    borderRadius: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    ...Platform.select({
      web: { cursor: "pointer" },
    }),
  },
  invoiceButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  customerSection: {
    backgroundColor: "#F4EFE0",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5DEC9",
    overflow: "hidden",
  },
  customerHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  customerHeaderTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#777265",
  },
  customerDetailsContent: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#E5DEC9",
    backgroundColor: "#FAF6EC",
  },
  customerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  customerLabel: {
    width: 80,
    fontSize: 12,
    fontWeight: "700",
    color: "#777265",
  },
  customerValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E1E1D",
  },
  callLabel: {
    fontSize: 10,
    color: "#A6A6A6",
    marginLeft: 6,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1E1D",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#A6A6A6",
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 260,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "#F4EFE0",
    borderRadius: 28,
    padding: 20,
    width: "100%",
    maxWidth: 420,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5DEC9",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  receiptSheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  receiptCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  monoText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#1E1E1D",
  },
  receiptRestName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  receiptMetaText: {
    fontSize: 12,
    color: "#777265",
    marginVertical: 1,
    textAlign: "center",
  },
  dashedLine: {
    fontSize: 12,
    color: "#777265",
    letterSpacing: 1,
    marginVertical: 8,
    textAlign: "center",
  },
  receiptDetailRow: {
    fontSize: 13,
    fontWeight: "700",
    marginVertical: 3,
  },
  receiptTableHeader: {
    flexDirection: "row",
  },
  receiptHeaderColItem: {
    flex: 1,
    fontSize: 13,
    fontWeight: "bold",
  },
  receiptHeaderColQty: {
    width: 40,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "bold",
  },
  receiptHeaderColPrice: {
    width: 90,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "bold",
  },
  receiptItemRow: {
    flexDirection: "row",
    marginVertical: 4,
    alignItems: "flex-start",
  },
  receiptItemName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  receiptItemQty: {
    width: 40,
    textAlign: "center",
    fontSize: 13,
  },
  receiptItemPrice: {
    width: 90,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "bold",
  },
  receiptTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  receiptTotalLabel: {
    fontSize: 15,
    fontWeight: "bold",
  },
  receiptTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  receiptFooter: {
    fontSize: 13,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 20,
    marginBottom: 10,
  },
  printAgainButton: {
    backgroundColor: "#1E1E1D",
    borderRadius: 24,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    width: "100%",
    ...Platform.select({
      web: { cursor: "pointer" },
    }),
  },
  printAgainButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});


