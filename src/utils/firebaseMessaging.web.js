// Mock of React Native Firebase Messaging for Web/Electron environment
const messagingMock = () => {
  return {
    requestPermission: async () => 1, // Authorized
    getToken: async () => 'mock-web-fcm-token',
    deleteToken: async () => {},
    onTokenRefresh: () => {
      // Returns an unsubscribe function
      return () => {};
    },
    onMessage: () => {
      // Returns an unsubscribe function
      return () => {};
    },
    onNotificationOpenedApp: () => {
      // Returns an unsubscribe function
      return () => {};
    },
    getInitialNotification: async () => null,
    setBackgroundMessageHandler: () => {},
  };
};

messagingMock.AuthorizationStatus = {
  NOT_DETERMINED: -1,
  DENIED: 0,
  AUTHORIZED: 1,
  PROVISIONAL: 2,
};

export default messagingMock;
