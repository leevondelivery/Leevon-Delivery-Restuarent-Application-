import { Platform, StyleSheet } from "react-native";

const isMobile = Platform.OS === "ios" || Platform.OS === "android";

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F7F6F1", // creamy white/beige
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    width: "100%",
  },
  headerBar: {
    backgroundColor: "#E5DEC9", // soft beige/tan color matching the screenshot
    borderRadius: 24,
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
      },
    }),
  },
  headerLeftCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  headerTitle: {
    color: "#333333",
    fontSize: isMobile ? 17 : 26,
    fontWeight: "700",
    fontStyle: "italic",
    letterSpacing: 2,
    paddingRight: 8, // prevents italic slanting from cutting off the letter N
  },
  headerRightSpacer: {
    width: 48, // matches left circle size to keep title perfectly centered
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
      },
    }),
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F7F6F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: isMobile ? 15 : 24,
    fontWeight: "800",
    color: "#1E1E1D",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: isMobile ? 9 : 14,
    color: "#A6A6A6",
    marginBottom: 28,
    textAlign: "center",
  },
  detailsContainer: {
    width: "100%",
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDFBF7",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FAF8F5",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
      },
    }),
  },
  detailLabel: {
    fontSize: isMobile ? 8 : 12,
    color: "#A6A6A6",
    fontWeight: "600",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: isMobile ? 10 : 15,
    color: "#1E1E1D",
    fontWeight: "700",
    flexShrink: 1,
  },
  toggleContainer: {
    alignItems: "center",
    marginVertical: 16,
    width: "100%",
  },
  toggleBar: {
    width: 180,
    height: 52,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingHorizontal: 8,
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
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
        cursor: "pointer",
        userSelect: "none",
      },
    }),
  },
  toggleBarOpen: {
    backgroundColor: "#0AB28D", // green
  },
  toggleBarClosed: {
    backgroundColor: "#E05638", // red
  },
  toggleText: {
    color: "#FFFFFF",
    fontSize: isMobile ? 14 : 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  toggleKnob: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    position: "absolute",
    top: 6,
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
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  toggleKnobOpen: {
    right: 6,
  },
  toggleKnobClosed: {
    left: 6,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    alignItems: "center",
    width: "100%",
  },
  statsGrid: {
    width: "100%",
    gap: 16,
    marginVertical: 24,
    paddingHorizontal: isMobile ? 7 : 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  statsCard: {
    flex: 1,
    backgroundColor: "#E5DEC9", // warm beige/tan matching the header bar
    borderRadius: 24,
    paddingVertical: isMobile ? 24 : 40,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
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
  statsCardLabel: {
    fontSize: isMobile ? 7 : 13,
    fontWeight: "700",
    color: "#777265", // muted charcoal-brown for premium feel
    marginBottom: 10,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  statsCardValue: {
    fontSize: isMobile ? 18 : 32,
    fontWeight: "800",
    color: "#1E1E1D",
    textAlign: "center",
  },
  menuButtonContainer: {
    alignItems: "center",
    marginBottom: 8,
    width: "100%",
  },
  menuButton: {
    backgroundColor: "#1E1E1D",
    borderRadius: 26,
    height: 52,
    width: 180,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
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
  menuButtonIcon: {
    marginRight: 8,
  },
  menuButtonText: {
    color: "#FFFFFF",
    fontSize: isMobile ? 12 : 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 8,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    position: "relative",
  },
  headerPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5DEC9",
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
  headerPillRightButton: {
    position: "absolute",
    right: 16,
    top: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
        cursor: "pointer",
      },
    }),
  },
  headerPillLeftButton: {
    position: "absolute",
    left: 16,
    top: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
        cursor: "pointer",
      },
    }),
  },
});
