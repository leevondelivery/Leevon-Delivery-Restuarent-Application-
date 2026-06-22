import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Print from "expo-print";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { useOrders } from "../../../context/OrdersContext";
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

  const originalTotal = order.totalPrice || order.grandTotal || 0;
  const discountedTotal = originalTotal;

  const itemRowsHtml = Array.isArray(order.items)
    ? order.items
        .map((foodItem) => {
          const originalPrice = foodItem.price || 0;
          const discountedPrice = originalPrice;
          return `
            <tr style="border-bottom: 1px dashed #EADEC2;">
              <td style="padding: 12px 0; font-weight: bold; font-family: sans-serif; color: #3A3937; font-size: 14px;">
                ${foodItem.name}
              </td>
              <td style="padding: 12px 0; text-align: center; font-family: sans-serif; color: #3A3937; font-size: 14px;">
                ${foodItem.quantity}
              </td>
              <td style="padding: 12px 0; text-align: right; font-family: sans-serif; font-weight: bold; color: #1E1E1D; font-size: 14px;">
                ₹${discountedPrice.toFixed(2)}
              </td>
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
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 15px;
            background-color: #F7F6F1;
          }
          .card {
            background-color: #FAF6EC;
            border-radius: 24px;
            padding: 20px;
            border: 1px solid #E5DEC9;
            max-width: 480px;
            margin: 0 auto;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          }
          .header-pill {
            background-color: #E5DEC9;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 16px;
            border-radius: 12px;
            margin-bottom: 20px;
            height: 48px;
            box-sizing: border-box;
          }
          .order-id {
            font-size: 12px;
            font-weight: 800;
            color: #1E1E1D;
            font-family: sans-serif;
          }
          .order-date {
            font-size: 11px;
            color: #777265;
            font-weight: 600;
            font-family: sans-serif;
          }
          .item-table {
            width: 100%;
            border-collapse: collapse;
          }
          .item-table th {
            padding-bottom: 8px;
            border-bottom: 1px solid #C6BEA9;
            font-size: 12px;
            font-weight: 800;
            color: #1E1E1D;
            text-align: left;
            font-family: sans-serif;
          }
          .divider-solid {
            height: 1px;
            background-color: #C6BEA9;
            margin: 16px 0;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .total-label {
            font-size: 16px;
            font-weight: bold;
            color: #1E1E1D;
            font-family: sans-serif;
          }
          .total-value-container {
            text-align: right;
          }
          .discounted-total {
            font-size: 18px;
            font-weight: 800;
            color: #1E1E1D;
            font-family: sans-serif;
          }
          .customer-box {
            background-color: #F4EFE0;
            border-radius: 12px;
            padding: 12px;
            border: 1px solid #E5DEC9;
            margin-bottom: 16px;
            font-size: 12px;
          }
          .customer-title {
            font-weight: bold;
            color: #777265;
            margin-bottom: 6px;
            font-family: sans-serif;
          }
          .customer-row {
            display: flex;
            margin: 4px 0;
            font-family: sans-serif;
          }
          .customer-label {
            width: 80px;
            font-weight: bold;
            color: #777265;
          }
          .customer-value {
            color: #1E1E1D;
            flex: 1;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <!-- Customer Details if available -->
          ${
            order.userName || order.userPhone || order.deliveryAddress
              ? `
            <div class="customer-box">
              <div class="customer-title">Customer & Delivery Info</div>
              ${
                order.userName
                  ? `<div class="customer-row"><span class="customer-label">Customer:</span><span class="customer-value">${order.userName}</span></div>`
                  : ""
              }
              ${
                order.userPhone
                  ? `<div class="customer-row"><span class="customer-label">Phone:</span><span class="customer-value">${order.userPhone}</span></div>`
                  : ""
              }
              ${
                order.deliveryAddress
                  ? `<div class="customer-row"><span class="customer-label">Address:</span><span class="customer-value">${order.deliveryAddress}</span></div>`
                  : ""
              }
            </div>
            `
              : ""
          }

          <div class="header-pill">
            <span class="order-id">ORDER ID: ${
              order.orderId || `ORD-${order._id?.substring(0, 8)}`
            }</span>
            <span class="order-date">${formatPrintDate(order.orderDate)}</span>
          </div>

          <table class="item-table">
            <thead>
              <tr>
                <th style="width: 50%;">ITEM</th>
                <th style="width: 20%; text-align: center;">QTY</th>
                <th style="width: 30%; text-align: right;">PRICE</th>
              </tr>
            </thead>
            <tbody>
              ${itemRowsHtml}
            </tbody>
          </table>

          <div class="divider-solid"></div>

          <div class="total-row">
            <span class="total-label">Grand Total</span>
            <div class="total-value-container">
              <div class="discounted-total">₹${discountedTotal.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export default function AcceptedOrdersPage() {
  const { orders, loading, error, refetch } = useOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [restaurantAddress, setRestaurantAddress] = useState("None");
  const [restaurantFssai, setRestaurantFssai] = useState("None");

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  useEffect(() => {
    // Fetch address and fssai details on mount
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
  }, []);

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
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? "0" + minutes : minutes;
      const hoursStr = hours < 10 ? "0" + hours : hours;
      return `${datePart}, ${hoursStr}:${minutesStr} ${ampm}`;
    } catch (e) {
      return dateStr;
    }
  };

  const renderOrderItem = ({ item }) => {
    const calculatedTotalPrice = item.items.reduce((sum, foodItem) => {
      const originalPrice = foodItem.price || 0;
      const discountedPrice = originalPrice * 0.88;
      return sum + (discountedPrice * (foodItem.quantity || 1));
    }, 0);

    const totalQty = item.items?.reduce((sum, fi) => sum + (fi.quantity || 0), 0) || 0;

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
            <Text style={localStyles.headerColQty}>QTY</Text>
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
              <Text style={localStyles.totalLabelText}>Total QTY</Text>
              <Text style={localStyles.totalValueText}>{totalQty}</Text>
            </View>
            <View style={localStyles.totalCol}>
              <Text style={localStyles.totalLabelText}>Total Price</Text>
              <Text style={localStyles.totalPriceValueText}>₹{calculatedTotalPrice.toFixed(2)}</Text>
            </View>
          </View>

          {/* Actions Row */}
          <View style={localStyles.actionsRow}>
            {/* Accepted Badge */}
            <View style={localStyles.acceptedBadge}>
              <Text style={localStyles.acceptedBadgeText}>Accepted</Text>
            </View>

            {/* Print Invoice Button (opens preview Modal) */}
            <Pressable
              onPress={() => setSelectedOrderForInvoice(item)}
              style={({ pressed }) => [
                localStyles.printInvoiceButton,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }
              ]}
            >
              <FontAwesome name="print" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={localStyles.printInvoiceButtonText}>Print Invoice</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[globalStyles.mainContainer, { justifyContent: "center", alignItems: "center" }]}>
        <LogoLoader title="Loading active orders..." subtitle="Please wait a second" />
      </View>
    );
  }

  return (
    <View style={globalStyles.mainContainer}>
      <SafeAreaView style={globalStyles.safeArea} edges={["top", "left", "right"]}>
        {/* Top Header Pill for "Accepted Orders" */}
        <View style={localStyles.topHeaderContainer}>
          <View style={localStyles.acceptedHeaderPill}>
            <FontAwesome name="check-circle" size={16} color="#0E8A5F" style={{ marginRight: 8 }} />
            <Text style={localStyles.acceptedHeaderPillText}>Accepted Orders</Text>
          </View>
        </View>

        {/* Errors / List */}
        {error ? (
          <View style={localStyles.centerContainer}>
            <FontAwesome name="exclamation-triangle" size={48} color="#E05638" />
            <Text style={localStyles.errorText}>{error}</Text>
            <Pressable onPress={() => refetch()} style={localStyles.retryButton}>
              <Text style={localStyles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
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
                onRefresh={onRefresh}
                colors={["#0E8A5F"]}
                tintColor="#0E8A5F"
              />
            }
            ListEmptyComponent={
              <View style={localStyles.emptyContainer}>
                <FontAwesome name="check-square-o" size={60} color="#777265" />
                <Text style={localStyles.emptyTitle}>No Accepted Orders</Text>
                <Text style={localStyles.emptySubtitle}>
                  Accepted customer orders will be listed here.
                </Text>
                <Pressable onPress={() => refetch()} style={localStyles.retryButton}>
                  <Text style={localStyles.retryText}>Refresh</Text>
                </Pressable>
              </View>
            }
          />
        )}
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
  topHeaderContainer: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
    width: "100%",
  },
  acceptedHeaderPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5DEC9", // theme color (warm tan/beige)
    borderRadius: 20,
    height: 40,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#C6BEA9",
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
  acceptedHeaderPillText: {
    color: "#1E1E1D",
    fontSize: 15,
    fontWeight: "700",
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 16,
  },
  orderCard: {
    backgroundColor: "#E5DEC9", // theme navbar background color
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
    backgroundColor: "#E5DEC9", // theme navbar background color
  },
  cardHeader: {
    alignItems: "center",
    width: "100%",
  },
  orderIdLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E1E1D",
    textAlign: "center",
  },
  orderIdValue: {
    fontWeight: "800",
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
    width: 60,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  headerColPrice: {
    width: 110,
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
    width: 110,
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
    fontSize: 10,
    color: "#B85C4B",
    fontWeight: "700",
  },
  discountedPriceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E1E1D",
    marginTop: 2,
  },
  dividerSolid: {
    height: 1,
    backgroundColor: "#C6BEA9",
    marginVertical: 16,
  },
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 4,
    marginBottom: 8,
  },
  totalCol: {
    alignItems: "center",
  },
  totalLabelText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#777265",
    marginBottom: 6,
  },
  totalValueText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  totalPriceValueText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  acceptedBadge: {
    backgroundColor: "#0E8A5F", // thick rich green background
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  acceptedBadgeText: {
    color: "#FFFFFF", // white text
    fontWeight: "700",
    fontSize: 13,
  },
  printInvoiceButton: {
    backgroundColor: "#0066FE",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    ...Platform.select({
      web: { cursor: "pointer" },
    }),
  },
  printInvoiceButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
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
