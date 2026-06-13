import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LogoLoader from "../../../components/LogoLoader";

const isMobile = Platform.OS === "ios" || Platform.OS === "android";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("amigo");
  const [phone, setPhone] = useState("9636");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("email");
        const storedPhone = await AsyncStorage.getItem("phone");
        if (storedEmail) setEmail(storedEmail);
        if (storedPhone) setPhone(storedPhone);
      } catch (error) {
        console.error("Error reading profile details from storage:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "restId",
        "restid",
        "restLocation",
        "restlocation",
        "address",
        "addredd",
        "fssai",
        "email",
        "phone",
        "restaurantLocation",
        "restaurantlocation",
        "lat",
        "lng",
      ]);
      router.replace("/");
    } catch (error) {
      console.error("Error clearing session:", error);
      router.replace("/");
    }
  };

  const handleDeleteAccount = () => {
    if (Platform.OS === "web") {
      alert("Delete Account Request\n\nTo delete your account and associated data, please email support@leevondelivery.in. Your data will be deleted within 30 days.");
    } else {
      Alert.alert(
        "Delete Account Request",
        "To delete your account and associated data, please email support@leevondelivery.in.\n\nYour account and data will be permanently deleted within 30 days.",
        [{ text: "OK" }]
      );
    }
  };

  const handleOpenPrivacyPolicy = () => {
    const url = "https://privacypolicyrestuarent.vercel.app/";
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open privacy policy link:", err)
    );
  };

  if (loading) {
    return (
      <View style={[styles.mainContainer, { justifyContent: "center", alignItems: "center" }]}>
        <LogoLoader />
      </View>
    );
  }

  // Get first letter of email or "A" as avatar initial
  const displayEmailName = email.includes("@") ? email.split("@")[0] : email;
  const avatarLetter = displayEmailName ? displayEmailName.charAt(0).toUpperCase() : "A";

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Centered Page Header Pill (No ribbon) */}
        <View style={styles.headerContainer}>
          <View style={styles.headerPill}>
            <FontAwesome name="cog" size={18} color="#777265" style={styles.headerPillIcon} />
            <Text style={styles.headerPillText}>Settings</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Upper Profile Details Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>{displayEmailName}</Text>
              <View style={styles.phoneRow}>
                <FontAwesome name="phone" size={17} color="#D4AF37" style={styles.phoneIcon} />
                <Text style={styles.profilePhone}>{phone}</Text>
              </View>
            </View>
          </View>

          {/* Beige Container with Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Restaurant Profile */}
            <Pressable
              onPress={() => router.push("/main/settings/profile")}
              style={({ pressed }) => [
                styles.actionItem,
                pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={styles.actionLeftRow}>
                <FontAwesome name="user" size={22} color="#1E1E1D" style={styles.actionIcon} />
                <Text style={styles.actionText}>Restaurant Profile</Text>
              </View>
              <FontAwesome name="chevron-right" size={17} color="#1E1E1D" />
            </Pressable>

            {/* My Orders */}
            <Pressable
              onPress={() => router.push("/main/orders-history")}
              style={({ pressed }) => [
                styles.actionItem,
                pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={styles.actionLeftRow}>
                <FontAwesome name="archive" size={20} color="#1E1E1D" style={styles.actionIcon} />
                <Text style={styles.actionText}>My Orders</Text>
              </View>
              <FontAwesome name="chevron-right" size={17} color="#1E1E1D" />
            </Pressable>

            {/* My Reviews */}
            {/* <Pressable
              style={({ pressed }) => [
                styles.actionItem,
                pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={styles.actionLeftRow}>
                <FontAwesome name="star" size={22} color="#1E1E1D" style={styles.actionIcon} />
                <Text style={styles.actionText}>My Reviews</Text>
              </View>
              <FontAwesome name="chevron-right" size={17} color="#1E1E1D" />
            </Pressable> */}

            {/* Contact Us */}
            <Pressable
              onPress={() => router.push("/main/contact")}
              style={({ pressed }) => [
                styles.actionItem,
                pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={styles.actionLeftRow}>
                <FontAwesome name="envelope" size={20} color="#1E1E1D" style={styles.actionIcon} />
                <Text style={styles.actionText}>Contact Us</Text>
              </View>
              <FontAwesome name="chevron-right" size={17} color="#1E1E1D" />
            </Pressable>

            {/* Privacy Policy */}
            <Pressable
              onPress={handleOpenPrivacyPolicy}
              style={({ pressed }) => [
                styles.actionItem,
                pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={styles.actionLeftRow}>
                <FontAwesome name="shield" size={20} color="#1E1E1D" style={styles.actionIcon} />
                <Text style={styles.actionText}>Privacy Policy</Text>
              </View>
              <FontAwesome name="chevron-right" size={17} color="#1E1E1D" />
            </Pressable>

            {/* Terms & Conditions */}
            <Pressable
              onPress={() => setShowTerms(true)}
              style={({ pressed }) => [
                styles.actionItem,
                pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={styles.actionLeftRow}>
                <FontAwesome name="file-text" size={20} color="#1E1E1D" style={styles.actionIcon} />
                <Text style={styles.actionText}>Terms & Conditions</Text>
              </View>
              <FontAwesome name="chevron-right" size={17} color="#1E1E1D" />
            </Pressable>

            {/* Delete Account */}
            <Pressable
              onPress={handleDeleteAccount}
              style={({ pressed }) => [
                styles.actionItem,
                pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={styles.actionLeftRow}>
                <FontAwesome name="trash" size={20} color="#E05638" style={styles.actionIcon} />
                <Text style={[styles.actionText, { color: "#E05638" }]}>Delete Account</Text>
              </View>
              <FontAwesome name="chevron-right" size={17} color="#E05638" />
            </Pressable>

            {/* Logout */}
            <Pressable
              onPress={() => setShowLogoutConfirm(true)}
              style={({ pressed }) => [
                styles.actionItem,
                styles.logoutItem,
                pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }
              ]}
            >
              <View style={styles.actionLeftRow}>
                <FontAwesome name="sign-out" size={22} color="#FFFFFF" style={styles.actionIcon} />
                <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
              </View>
              <FontAwesome name="chevron-right" size={17} color="#FFFFFF" />
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            {/* Red Circle with Logout Arrow */}
            <View style={styles.iconContainer}>
              <FontAwesome name="sign-out" size={36} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </View>

            {/* Modal Title */}
            <Text style={styles.confirmTitle}>Are you sure you want to logout?</Text>

            {/* Confirm Logout Button */}
            <Pressable
              onPress={() => {
                setShowLogoutConfirm(false);
                handleLogout();
              }}
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
              ]}
            >
              <Text style={styles.confirmButtonText}>Logout</Text>
            </Pressable>

            {/* Cancel Link */}
            <Pressable onPress={() => setShowLogoutConfirm(false)}>
              <Text style={styles.cancelTextLink}>Not now</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Terms & Conditions Modal */}
      <Modal
        visible={showTerms}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTerms(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.termsCard}>
            <View style={styles.termsHeader}>
              <Text style={styles.termsHeaderTitle}>Terms & Conditions</Text>
              <Pressable onPress={() => setShowTerms(false)} style={styles.closeButton}>
                <FontAwesome name="times" size={20} color="#1E1E1D" />
              </Pressable>
            </View>
            <ScrollView style={styles.termsScroll} showsVerticalScrollIndicator={true}>
              <Text style={styles.termsTitle}>Restaurant Partner Terms & Conditions</Text>
              <Text style={styles.termsSub}>Effective Date: January 2026</Text>
              
              <Text style={styles.sectionTitle}>1. Relationship & Engagement</Text>
              <Text style={styles.sectionParagraph}>
                The Restaurant Partner acknowledges and agrees that its engagement with the Company is on a principal-to-principal basis and shall not be deemed to create any partnership, joint venture, agency, franchise, or employer–employee relationship between the Restaurant Partner and the Company. The Company operates solely as a technology platform and marketplace facilitator that enables listing, discovery, order placement, payment facilitation, and delivery coordination, and does not own, manage, or control the Restaurant Partner’s business operations, food preparation processes, pricing decisions, staffing, or premises. The Restaurant Partner shall have no authority to bind, represent, or incur any obligation on behalf of the Company.
              </Text>
              <Text style={styles.sectionParagraph}>
                The Restaurant Partner shall remain solely responsible for the quality, quantity, safety, hygiene, packaging, and legality of food items, and for compliance with all &quot;Applicable Laws&quot; (which shall mean all provincial, state, national, central, local, and municipal laws, statutes, ordinances, rules, regulations, guidelines, notifications, policies, and judgements issued by any governmental, statutory, or regulatory authority in India, including the Government of India and the Government of Andhra Pradesh, as amended, updated, or replaced from time to time). This engagement is governed by Applicable Laws regarding contracts, and the Restaurant Partner acknowledges that no exclusivity, employment, or agency relationship is intended or created unless expressly agreed in writing.
              </Text>

              <Text style={styles.sectionTitle}>2. Eligibility & Onboarding</Text>
              <Text style={styles.sectionParagraph}>
                To be eligible to register and operate as a Restaurant Partner on the Company’s platform, the restaurant must be a legally established business entity or sole proprietorship capable of entering into a binding contract under Applicable Laws. The Restaurant Partner must hold and maintain all required licenses, registrations, and approvals necessary to prepare and sell food, including a valid food safety license in accordance with Applicable Laws, as well as any applicable local municipal trade licenses.
              </Text>
              <Text style={styles.sectionParagraph}>
                The Restaurant Partner must provide accurate, complete, and up-to-date information and documentation during the onboarding process, including business details, bank account information for settlements, menu listings, pricing, and operating hours. The Company reserves the right to verify submitted information, conduct inspections or audits where permitted by law, and approve, suspend, or reject any Restaurant Partner application at its sole discretion. Continued access to the platform is subject to ongoing compliance with eligibility requirements, platform policies, and Applicable Laws, and failure to meet such requirements may result in suspension or termination of the Restaurant Partner’s account without prejudice to any other rights or remedies available to the Company under law.
              </Text>

              <Text style={styles.sectionTitle}>3. Food Quality & Compliance</Text>
              <Text style={styles.sectionParagraph}>
                The Restaurant Partner shall be solely responsible for ensuring that all food items listed, prepared, packaged, and supplied through the platform are of merchantable quality, safe for human consumption, hygienically prepared, and compliant with all applicable food safety and health standards under Applicable Laws. The Restaurant Partner agrees to strictly comply with the provisions of all Applicable Laws, abide by the law and shall not do any act which is forbidden by law, and all relevant rules, notifications, and guidelines issued thereunder under the Government of India and by the Government of Andhra Pradesh, including requirements relating to food handling, storage, preparation, packaging, and labeling.
              </Text>
              <Text style={styles.sectionParagraph}>
                The Restaurant Partner shall ensure that all food ingredients used are fresh, permitted under law, and sourced from authorized suppliers, and that food is prepared in clean premises by trained staff following proper hygiene practices. The Restaurant Partner shall promptly address any food quality complaints, safety issues, or regulatory notices and shall fully cooperate with the Company and also with delivery agents and relevant authorities in the event of inspections or investigations. The Company reserves the right to suspend or delist the Restaurant Partner or specific food items from the platform in case of non-compliance, customer complaints, or potential health and safety risks, without prejudice to any other rights or remedies available under Applicable Laws.
              </Text>

              <Text style={styles.sectionTitle}>4. Availability</Text>
              <Text style={styles.sectionParagraph}>
                The Restaurant Partner shall maintain accurate and updated operating hours, service areas, and item availability on the platform and shall ensure that it is operational and capable of fulfilling customer orders during the declared availability periods. The Restaurant Partner agrees to promptly accept, prepare, and hand over orders in accordance with the timelines communicated through the platform and to immediately mark itself as unavailable or update the platform in the event of temporary closure, stock unavailability, technical issues, or any circumstances that may impact order fulfillment.
              </Text>
              <Text style={styles.sectionParagraph}>
                Repeated failure to maintain availability, excessive order cancellations, or delayed order preparation may adversely affect the Restaurant Partner’s performance metrics and may result in temporary suspension or delisting from the platform. The Company reserves the right to modify, restrict, or disable the Restaurant Partner’s availability on the platform in case of operational issues, customer complaints, non-compliance with platform policies, or as required under Applicable Laws, without prejudice to any other rights or remedies available to the Company.
              </Text>

              <Text style={styles.sectionTitle}>5. Orders & Fulfilment</Text>
              <Text style={styles.sectionParagraph}>
                The Restaurant Partner agrees to promptly receive, confirm, prepare, and fulfill customer orders placed through the platform in accordance with the order details, preparation timelines, and quality standards communicated via the platform. Upon acceptance of an order, the Restaurant Partner shall ensure that the food items are prepared accurately, packaged securely, and made ready for pickup within the stipulated time to avoid delays or cancellations. The Restaurant Partner shall not cancel accepted orders except in exceptional circumstances such as force majeure events or genuine unavailability of ingredients, and shall immediately notify the Company through the platform in such cases.
              </Text>
              <Text style={styles.sectionParagraph}>
                The Restaurant Partner shall promptly liaison and coordinate with the delivery agent and shall not delay or hinder the delivery process in any manner. The Restaurant Partner shall cooperate with Delivery Partners for timely handover of orders and ensure proper labeling and order verification at the time of pickup. Repeated order delays, inaccuracies, or cancellations may result in customer complaints, penalties, reduced platform visibility, suspension, or termination of the Restaurant Partner’s access to the platform, without prejudice to the Company’s rights under Applicable Laws.
              </Text>

              <Text style={styles.sectionTitle}>6. Taxes</Text>
              <Text style={styles.sectionParagraph}>
                The Restaurant Partner shall be solely responsible for the determination, collection, reporting, and payment of all applicable taxes, duties, levies, and statutory charges arising from the sale of food and beverages through the platform, including but not limited to Goods and Services Tax (GST), in accordance with Applicable Laws.
              </Text>
              <Text style={styles.sectionParagraph}>
                The Restaurant Partner shall ensure that all prices, tax rates, and tax classifications displayed on the platform are accurate and compliant with Applicable Laws and shall issue valid tax invoices wherever required. The Company acts only as a technology platform and marketplace facilitator and shall not be liable for any tax obligations of the Restaurant Partner, except to the extent expressly required under Applicable Laws. Any tax demands, penalties, interest, or liabilities arising due to incorrect tax treatment, non-compliance, or misreporting by the Restaurant Partner shall be borne solely by the Restaurant Partner, and the Company reserves the right to recover any losses or amounts incurred due to such non-compliance.
              </Text>

              <Text style={styles.sectionTitle}>7. Delivery</Text>
              <Text style={styles.sectionParagraph}>
                The Restaurant Partner agrees to prepare, package, and hand over customer orders in a timely manner to the assigned Delivery Partner or logistics service provider as notified through the platform. The Restaurant Partner shall ensure that all orders are securely packed, properly sealed, and labeled to prevent spillage, contamination, or tampering during transit. The Restaurant Partner shall cooperate with Delivery Partners to facilitate smooth pickup, including order verification and timely handover.
              </Text>
              <Text style={styles.sectionParagraph}>
                While the Company facilitates delivery coordination through the platform, the Restaurant Partner remains responsible for ensuring that the food is fit for delivery at the time of handover. The Company shall not be liable for any due negligence caused by the restaurant, i.e., delays or failures in delivery arising from incorrect order preparation, improper packaging, or delayed handover by the Restaurant Partner.
              </Text>

              <Text style={styles.sectionTitle}>8. Intellectual Property</Text>
              <Text style={styles.sectionParagraph}>
                The Restaurant Partner acknowledges that all intellectual property rights related to the Company’s platform, including but not limited to software, applications, trademarks, logos, trade names, domain names, designs, content, user interfaces, and proprietary technology, are and shall remain the exclusive property of the Company. Nothing in this agreement shall be construed as transferring or assigning any ownership rights in the Company’s intellectual property to the Restaurant Partner.
              </Text>
              <Text style={styles.sectionParagraph}>
                The Restaurant Partner grants the Company a limited, non-exclusive, royalty-free, revocable license to use the Restaurant Partner’s name, trademarks, logos, menu details, images, and other brand materials solely for the purpose of listing, promoting, marketing, and facilitating orders through the platform. The Restaurant Partner represents and warrants that it owns or has lawful rights to use such materials and that their use by the Company will not infringe any third-party rights.
              </Text>
              <Text style={styles.sectionParagraph}>
                The Restaurant Partner shall not copy, modify, reverse engineer, misuse, or create derivative works from the Company’s platform or intellectual property and shall not use the Company’s trademarks or branding except as expressly permitted in writing. Any unauthorized use or infringement of intellectual property rights may result in immediate suspension or termination of the Restaurant Partner’s access to the platform, without prejudice to the Company’s rights and remedies under all Applicable Laws.
              </Text>

              <Text style={styles.sectionTitle}>9. Litigation and Dispute Resolution</Text>
              <Text style={styles.sectionParagraph}>
                Any dispute arising between the Company (application operator) and the Restaurant Partner shall be resolved through arbitration. An arbitrator shall be appointed with the mutual consent of both the Company and the Restaurant Partner. The arbitration proceedings shall be conducted in accordance with the provisions of Applicable Laws governing arbitration.
              </Text>
              <Text style={styles.sectionParagraph}>
                Notwithstanding the above, both the Company and the Restaurant Partner shall have the right to approach the appropriate civil court for resolution of disputes, where applicable under Applicable Laws.
              </Text>

              <Text style={styles.sectionTitle}>10. Liability</Text>
              <Text style={styles.sectionParagraph}>
                The responsibility for the preparation, cooking, packaging, and all other related aspects of the food rests solely with the restaurant. In the event that a consumer is affected by food poisoning, health-related issues, or any adverse effects arising from the consumption of the food or products provided by the restaurant, the restaurant shall be fully and exclusively liable.
              </Text>
              <Text style={styles.sectionParagraph}>
                The company (application operator) shall not be held responsible for any such incidents or grievances raised by the consumer. All liabilities, including civil damages and any criminal proceedings, shall be borne entirely by the restaurant, in accordance with the compliance standards of all Applicable Laws.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerContainer: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 8,
    width: "100%",
  },
  headerPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 29,
    height: 53,
    paddingHorizontal: 28,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
      },
    }),
  },
  headerPillIcon: {
    marginRight: 8,
  },
  headerPillText: {
    color: "#1E1E1D",
    fontSize: 20,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // extra padding to clear absolute tabbar
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
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#1E1E1D", // dark charcoal avatar backing
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  profileName: {
    fontSize: isMobile ? 22 : 26,
    fontWeight: "800",
    color: "#1E1E1D",
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneIcon: {
    marginRight: 6,
  },
  profilePhone: {
    fontSize: isMobile ? 15 : 18,
    color: "#777265",
    fontWeight: "600",
  },
  actionsContainer: {
    backgroundColor: "#E5DEC9", // beige rounded box matching mockup
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
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 30, // increased roundedness for the buttons as requested
    height: 65,
    paddingHorizontal: 24,
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  actionLeftRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    width: 26,
    marginRight: 12,
  },
  actionText: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: "700",
    color: "#1E1E1D",
  },
  logoutItem: {
    backgroundColor: "#E05638",
  },
  logoutText: {
    color: "#FFFFFF",
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
  termsCard: {
    width: "90%",
    height: "80%",
    backgroundColor: "#FAF6EC",
    borderRadius: 24,
    padding: 20,
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
  termsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5DEC9",
    paddingBottom: 12,
    marginBottom: 12,
  },
  termsHeaderTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E1E1D",
  },
  closeButton: {
    padding: 4,
  },
  termsScroll: {
    flex: 1,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1E1D",
    marginBottom: 4,
  },
  termsSub: {
    fontSize: 14,
    color: "#777265",
    fontWeight: "600",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E1E1D",
    marginTop: 14,
    marginBottom: 6,
  },
  sectionParagraph: {
    fontSize: 14,
    color: "#4A4945",
    lineHeight: 20,
    marginBottom: 10,
    textAlign: "justify",
  },
});
