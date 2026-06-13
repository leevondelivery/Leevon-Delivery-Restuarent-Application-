import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles as globalStyles } from "../../../styles/main.styles";

export default function NotificationsTabPlaceholder() {
  return (
    <View style={globalStyles.mainContainer}>
      <SafeAreaView style={globalStyles.safeArea} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={globalStyles.headerContainer}>
          <View style={globalStyles.headerPill}>
            <FontAwesome name="bell" size={18} color="#777265" style={globalStyles.headerPillIcon} />
            <Text style={globalStyles.headerPillText}>Alerts</Text>
          </View>
        </View>

        {/* Blank Content Area */}
        <View style={localStyles.content}>
          <FontAwesome name="shopping-basket" size={48} color="#777265" style={{ marginBottom: 16 }} />
          <Text style={localStyles.placeholderText}>No Orders Received</Text>
          <Text style={localStyles.subText}>You haven't received any orders yet.</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1E1D",
    textAlign: "center",
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: "#777265",
    textAlign: "center",
    fontWeight: "500",
  },
});
