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

const MOCK_REVIEWS = [
  {
    _id: "rev1",
    orderId: "ORD-00737",
    userName: "Gsvinith",
    restaurantRating: 5,
    restaurantReview: "Delicious milk chocolate waffle, hot and fresh!",
    createdAt: "2026-06-22T11:45:00.000Z",
    items: [{ name: "Milk Chocolate Waffle", quantity: 1 }]
  },
  {
    _id: "rev2",
    orderId: "ORD-00512",
    userName: "Ramesh Kumar",
    restaurantRating: 4,
    restaurantReview: "", // empty text review
    createdAt: "2026-06-21T15:20:00.000Z",
    items: [{ name: "Double Waffle Combo", quantity: 1 }]
  },
  {
    _id: "rev3",
    orderId: "ORD-00289",
    userName: "Anjali Devi",
    restaurantRating: 5,
    restaurantReview: "Very prompt delivery and great packaging. Loved the Triple Chocolate Waffle!",
    createdAt: "2026-06-20T19:10:00.000Z",
    items: [{ name: "Triple Chocolate Waffle", quantity: 1 }]
  }
];

export default function RestaurantReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async (showPullIndicator = false) => {
    if (showPullIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const storedRestId = await AsyncStorage.getItem("restId");
      
      // If we are logged in as the demo account, or if there is no restaurant ID, load the mock reviews
      if (!storedRestId || storedRestId === "demo_rest_101") {
        setReviews(MOCK_REVIEWS);
        return;
      }

      console.log(`Fetching reviews for restaurantId: ${storedRestId} from ${API_URL}`);
      const res = await fetch(`${API_URL}/restaurant-reviews/${storedRestId}`);
      
      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
      } else {
        throw new Error(data.message || "Failed to fetch reviews");
      }
    } catch (err) {
      console.log("Error fetching reviews:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const formatReviewDate = (dateStr) => {
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

  const renderStars = (rating) => {
    const stars = [];
    const maxRating = 5;
    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i <= rating ? "star" : "star-o"}
          size={15}
          color="#D4AF37"
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderReviewItem = ({ item }) => {
    const isTextEmpty = !item.restaurantReview || item.restaurantReview.trim() === "";
    const displayReviewText = isTextEmpty
      ? "The customer rated this order but did not write a text review."
      : item.restaurantReview;

    const initialLetter = item.userName ? item.userName.charAt(0).toUpperCase() : "C";

    return (
      <View style={styles.reviewCard}>
        {/* Top Section: User Info and Rating */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initialLetter}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userNameText}>{item.userName || "Customer"}</Text>
            <View style={styles.ratingRow}>
              {renderStars(item.restaurantRating)}
              <Text style={styles.dateText}>{formatReviewDate(item.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Body Section: Review Text */}
        <Text style={[styles.reviewText, isTextEmpty && styles.emptyReviewText]}>
          {displayReviewText}
        </Text>

        {/* Items Ordered Section */}
        {Array.isArray(item.items) && item.items.length > 0 && (
          <View style={styles.itemsBox}>
            <Text style={styles.itemsBoxTitle}>Items Ordered:</Text>
            <View style={styles.itemsListContainer}>
              {item.items.map((foodItem, idx) => (
                <View key={idx} style={styles.foodItemBadge}>
                  <Text style={styles.foodItemBadgeText}>
                    {foodItem.name} <Text style={styles.foodItemBadgeQty}>x{foodItem.quantity || 1}</Text>
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer Section: Order ID Reference */}
        <View style={styles.cardFooter}>
          <Text style={styles.orderIdText}>Order Reference: {item.orderId || "N/A"}</Text>
        </View>
      </View>
    );
  };

  // Calculate stats for header summary
  const totalReviewsCount = reviews.length;
  const averageRating =
    totalReviewsCount > 0
      ? (
          reviews.reduce((sum, r) => sum + r.restaurantRating, 0) / totalReviewsCount
        ).toFixed(1)
      : "0.0";

  if (loading && !refreshing) {
    return (
      <View style={[globalStyles.mainContainer, { justifyContent: "center", alignItems: "center" }]}>
        <LogoLoader title="Loading reviews..." subtitle="Please wait a second" />
      </View>
    );
  }

  return (
    <View style={globalStyles.mainContainer}>
      <SafeAreaView style={globalStyles.safeArea} edges={["top", "left", "right"]}>
        <FlatList
          ListHeaderComponent={
            <>
              {/* Header with Back Button */}
              <View style={[globalStyles.headerContainer, { alignSelf: "center" }]}>
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
                  <FontAwesome name="star" size={18} color="#777265" style={globalStyles.headerPillIcon} />
                  <Text style={globalStyles.headerPillText}>My Reviews</Text>
                </View>
              </View>

              {/* Reviews Summary Pill Cards */}
              <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>AVERAGE RATING</Text>
                  <View style={styles.avgRatingRow}>
                    <Text style={styles.avgRatingText}>{averageRating}</Text>
                    <FontAwesome name="star" size={20} color="#D4AF37" style={{ marginLeft: 6 }} />
                  </View>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>TOTAL REVIEWS</Text>
                  <Text style={styles.summaryValueText}>{totalReviewsCount}</Text>
                </View>
              </View>
            </>
          }
          data={error ? [] : reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.listContent,
            (reviews.length === 0 || error) && { flexGrow: 1, justifyContent: "center" }
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchReviews(true)}
              colors={["#E05638"]}
              tintColor="#E05638"
            />
          }
          ListEmptyComponent={
            error ? (
              <View style={styles.centerContainer}>
                <FontAwesome name="exclamation-triangle" size={48} color="#E05638" />
                <Text style={styles.errorText}>{error}</Text>
                <Pressable onPress={() => fetchReviews()} style={styles.retryButton}>
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <FontAwesome name="star-o" size={60} color="#777265" />
                <Text style={styles.emptyTitle}>No Reviews Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Customer reviews and ratings for your food will appear here.
                </Text>
                <Pressable onPress={() => fetchReviews()} style={styles.retryButton}>
                  <Text style={styles.retryText}>Refresh</Text>
                </Pressable>
              </View>
            )
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 16,
  },
  summaryContainer: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    maxWidth: 530,
    alignSelf: "center",
    marginBottom: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#E5DEC9", // Theme light tan/beige color
    borderWidth: 1,
    borderColor: "#C6BEA9",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.01)",
      },
    }),
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#777265",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  avgRatingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avgRatingText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  summaryValueText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5DEC9",
    width: "100%",
    maxWidth: 530,
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.02,
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1E1E1D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  userInfo: {
    flex: 1,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E1E1D",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 11,
    color: "#A09B8C",
    fontWeight: "600",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#E5DEC9",
    width: "100%",
    marginVertical: 14,
  },
  reviewText: {
    fontSize: 14,
    color: "#3A3937",
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 14,
  },
  emptyReviewText: {
    color: "#A09B8C",
    fontStyle: "italic",
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
  },
  orderIdText: {
    fontSize: 11,
    color: "#777265",
    fontWeight: "700",
    backgroundColor: "#F7F6F1",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
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
  itemsBox: {
    backgroundColor: "#F7F6F1", // matching page background
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  itemsBoxTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#777265",
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  itemsListContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  foodItemBadge: {
    backgroundColor: "#E5DEC9", // matching theme soft beige
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#C6BEA9",
  },
  foodItemBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E1E1D",
  },
  foodItemBadgeQty: {
    fontWeight: "800",
    color: "#E05638", // highlighted quantity in red
  },
});
