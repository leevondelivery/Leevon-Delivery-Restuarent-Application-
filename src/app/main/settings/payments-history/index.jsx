import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  BackHandler,
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

const MOCK_PENDING_PAYMENTS = {
  grandTotal: 4850.50,
  transactions: [
    {
      id: "TXN-98401",
      amount: 1250.00,
      date: "2026-07-30",
      time: "02:45 PM",
      status: "Pending"
    },
    {
      id: "TXN-98382",
      amount: 2100.50,
      date: "2026-07-29",
      time: "07:15 PM",
      status: "Pending"
    },
    {
      id: "TXN-98210",
      amount: 1500.00,
      date: "2026-07-28",
      time: "09:30 AM",
      status: "Pending"
    }
  ]
};

export default function PaymentsHistoryPage() {
  const [paymentData, setPaymentData] = useState({ grandTotal: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchPendingPayments = useCallback(async (showPullIndicator = false) => {
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
        setPaymentData(MOCK_PENDING_PAYMENTS);
        return;
      }

      console.log(`Fetching pending payments for restaurantId: ${storedRestId} from ${API_URL}`);
      
      let res;
      try {
        res = await fetch(`${API_URL}/pending-payments/${storedRestId}`);
        if (!res.ok) {
          res = await fetch(`${API_URL}/pendingpayments/${storedRestId}`);
        }
      } catch (networkErr) {
        // Fallback endpoint retry
        res = await fetch(`${API_URL}/pendingpayments/${storedRestId}`);
      }

      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success || data.grandTotal !== undefined || data.grossTotal !== undefined || Array.isArray(data.transactions) || Array.isArray(data.pendingPayments)) {
        const grandTotalVal = data.grandTotal ?? data.grossTotal ?? data.pendingPayment?.grandTotal ?? data.pendingPayment?.grossTotal ?? data.totalGross ?? data.totalAmount;
        const rawTxns = data.transactions || data.pendingPayments || data.payments || data.orders || (Array.isArray(data.data) ? data.data : []);
        
        const parsedTxns = rawTxns.map((item, index) => {
          let itemDate = item.date || item.createdAt || item.timestamp;
          let itemTime = item.time;

          if (itemDate && !itemTime && typeof itemDate === "string" && itemDate.includes("T")) {
            try {
              const d = new Date(itemDate);
              itemDate = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
              itemTime = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
            } catch (e) {}
          }

          return {
            id: item.id || item._id || item.transactionId || item.orderId || `TXN-${index + 101}`,
            amount: item.amount ?? item.totalPrice ?? item.grandTotal ?? item.grossTotal ?? 0,
            date: itemDate || "N/A",
            time: itemTime || "N/A",
            status: item.status || "Pending"
          };
        });

        const computedGrand = grandTotalVal !== undefined && grandTotalVal !== null 
          ? Number(grandTotalVal) 
          : parsedTxns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        setPaymentData({
          grandTotal: computedGrand,
          transactions: parsedTxns
        });
      } else {
        throw new Error(data.message || "Failed to fetch pending payments");
      }
    } catch (err) {
      console.log("Error fetching pending payments:", err.message);
      setError(err.message);
      // If network/endpoint error occurs, fallback to mock data gracefully so UI is viewable
      setPaymentData(MOCK_PENDING_PAYMENTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingPayments();
  }, [fetchPendingPayments]);

  // Handle Android hardware back button to navigate back to Settings
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      router.push("/main/settings");
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatTxnDate = (dateVal) => {
    if (!dateVal || dateVal === "N/A") return "N/A";
    try {
      const date = new Date(dateVal);
      if (isNaN(date.getTime())) return dateVal;
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateVal;
    }
  };

  const formatTxnTime = (dateVal, timeVal) => {
    if (timeVal && timeVal !== "N/A") return timeVal;
    if (!dateVal || dateVal === "N/A") return "N/A";
    try {
      const date = new Date(dateVal);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return "N/A";
    }
  };

  const renderTransactionItem = ({ item }) => {
    const formattedDate = formatTxnDate(item.date);
    const formattedTime = formatTxnTime(item.date, item.time);

    return (
      <View style={styles.txnCard}>
        {/* Top Row: Icon + ID & Status + Amount */}
        <View style={styles.txnHeaderRow}>
          <View style={styles.txnLeftGroup}>
            <View style={styles.iconCircle}>
              <FontAwesome name="exchange" size={14} color="#FFFFFF" />
            </View>
            <View style={styles.txnIdGroup}>
              <Text style={styles.txnIdLabel}>Transaction ID</Text>
              <Text style={styles.txnIdValue} numberOfLines={1}>{item.id}</Text>
            </View>
          </View>
          <View style={styles.txnRightGroup}>
            <Text style={styles.txnAmount}>{formatCurrency(item.amount)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bottom Row: Date & Time */}
        <View style={styles.txnFooterRow}>
          <View style={styles.dateTimeBadge}>
            <FontAwesome name="calendar" size={12} color="#747472" style={styles.metaIcon} />
            <Text style={styles.metaText}>{formattedDate}</Text>
          </View>
          <View style={styles.dateTimeBadge}>
            <FontAwesome name="clock-o" size={12} color="#747472" style={styles.metaIcon} />
            <Text style={styles.metaText}>{formattedTime}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[globalStyles.mainContainer, { justifyContent: "center", alignItems: "center" }]}>
        <LogoLoader title="Loading payments..." subtitle="Fetching pending payments data" />
      </View>
    );
  }

  return (
    <View style={globalStyles.mainContainer}>
      <SafeAreaView style={globalStyles.safeArea} edges={["top", "left", "right"]}>
        <FlatList
          data={paymentData.transactions}
          keyExtractor={(item, index) => item.id || String(index)}
          renderItem={renderTransactionItem}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchPendingPayments(true)}
              colors={["#E05638"]}
              tintColor="#E05638"
            />
          }
          ListHeaderComponent={
            <>
              {/* Header with Back Button */}
              <View style={[globalStyles.headerContainer, { alignSelf: "center", justifyContent: "space-between" }]}>
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
                  <FontAwesome name="credit-card" size={18} color="#777265" style={globalStyles.headerPillIcon} />
                  <Text style={globalStyles.headerPillText}>Payments History</Text>
                </View>

                <View style={globalStyles.headerPillRightSpacer} />
              </View>

              {/* Error Notice if any */}
              {error && (
                <View style={styles.errorCard}>
                  <FontAwesome name="exclamation-circle" size={18} color="#C53030" style={{ marginRight: 8 }} />
                  <Text style={styles.errorText}>Using fallback data ({error})</Text>
                </View>
              )}

              {/* Hero Pending Payment Card */}
              <View style={styles.pendingCard}>
                <View style={styles.pendingHeaderRow}>
                  <View style={styles.pendingIconContainer}>
                    <FontAwesome name="clock-o" size={22} color="#FFFFFF" />
                  </View>
                  <Text style={styles.pendingTitle}>Pending Payment</Text>
                </View>

                <View style={styles.grandTotalContainer}>
                  <Text style={styles.grandTotalLabel}>Grand Total</Text>
                  <Text style={styles.grandTotalValue}>
                    {formatCurrency(paymentData.grandTotal)}
                  </Text>
                </View>
                
                <View style={styles.pendingBadgeRow}>
                  <View style={styles.statusPill}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusPillText}>Pending Clearance</Text>
                  </View>
                  <Text style={styles.txnCountText}>
                    {paymentData.transactions.length} Transaction{paymentData.transactions.length !== 1 ? "s" : ""}
                  </Text>
                </View>
              </View>

              {/* Transactions Section Title */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Transactions</Text>
                <Text style={styles.sectionSubtitle}>
                  {paymentData.transactions.length} item{paymentData.transactions.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome name="inbox" size={48} color="#A39F93" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>No Transactions Found</Text>
              <Text style={styles.emptySubtitle}>There are currently no pending payments registered.</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  pendingCard: {
    backgroundColor: "#1E1E1D", // Charcoal container card matching app accent
    borderRadius: 28,
    padding: 24,
    marginTop: 16,
    marginBottom: 24,
    width: "100%",
    maxWidth: 530,
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
      },
    }),
  },
  pendingHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  pendingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E05638", // Brand red icon backing
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  pendingTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  grandTotalContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#A39F93",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  grandTotalValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  pendingBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(224, 86, 56, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#E05638",
    marginRight: 6,
  },
  statusPillText: {
    color: "#FFA896",
    fontSize: 12,
    fontWeight: "700",
  },
  txnCountText: {
    color: "#A39F93",
    fontSize: 13,
    fontWeight: "600",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    width: "100%",
    maxWidth: 530,
    alignSelf: "center",
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#747472",
  },
  txnCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    width: "100%",
    maxWidth: 530,
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
      },
    }),
  },
  txnHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  txnLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1E1E1D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  txnIdGroup: {
    flex: 1,
  },
  txnIdLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#747472",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  txnIdValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E1E1D",
    marginTop: 2,
  },
  txnRightGroup: {
    alignItems: "flex-end",
  },
  txnAmount: {
    fontSize: 17,
    fontWeight: "800",
    color: "#E05638",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0ECE1",
    marginVertical: 14,
  },
  txnFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F6F1",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  metaIcon: {
    marginRight: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4A4945",
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FEB2B2",
    width: "100%",
    maxWidth: 530,
    alignSelf: "center",
  },
  errorText: {
    color: "#C53030",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    width: "100%",
    maxWidth: 530,
    alignSelf: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1E1D",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#747472",
    textAlign: "center",
    fontWeight: "600",
  },
});
