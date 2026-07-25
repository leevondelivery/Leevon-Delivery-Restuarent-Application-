import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F7F6F1", // creamy white/beige (left half)
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
    zIndex: 2,
  },
  keyboardView: {
    flex: 1,
  },
  rightBackground: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "50%",
    backgroundColor: "#DDD7CC", // beige/tan (right half)
    zIndex: 1,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    width: "100%",
  },
  logoContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    paddingVertical: 18,
    paddingHorizontal: 28,
    minWidth: 180,
    marginTop: -50,
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.06)",
        userSelect: "none",
      },
    }),
  },
  logoImage: {
    width: 90,
    height: 90,
    marginBottom: 4,
  },
  logoText: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 6,
    ...Platform.select({
      ios: {
        fontFamily: "Georgia",
      },
      android: {
        fontFamily: "serif",
      },
      web: {
        fontFamily: "'Lucida Bright', 'Lucida Fax', 'Merriweather', 'Lora', Georgia, serif",
      },
    }),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 9999,
    width: "85%",
    maxWidth: 360,
    height: 56,
    paddingHorizontal: 24,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.06)",
      },
    }),
  },
  inputIcon: {
    marginRight: 14,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#1E1E1D",
    paddingVertical: 0,
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  },
  passwordTextInput: {
    color: "#E05638",
  },
  loginButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 9999,
    paddingVertical: 14,
    width: "55%",
    maxWidth: 220,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.06)",
        cursor: "pointer",
        userSelect: "none",
      },
    }),
  },
  loginButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#F9F8F3", // creamy soft off-white/beige
    borderRadius: 40,
    width: "85%",
    maxWidth: 320,
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
      },
    }),
  },
  modalIconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#F34D4D", // bright red/coral
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#F34D4D",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0 6px 15px rgba(243, 77, 77, 0.4)",
      },
    }),
  },
  modalText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 32,
  },
  modalButton: {
    backgroundColor: "#000000",
    borderRadius: 9999,
    paddingVertical: 14,
    width: "90%",
    maxWidth: 240,
    alignItems: "center",
    justifyContent: "center",
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
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
        cursor: "pointer",
        userSelect: "none",
      },
    }),
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});
