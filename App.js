import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { StyleSheet, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import registerForPushNotificationsAsync from './lib/pushNotifications';

export default function App() {
  let webview;

  useEffect(() => {
    const backAction = () => {
      webview.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync()
    Notifications.addNotificationReceivedListener(_handleNotification);
    Notifications.addNotificationResponseReceivedListener(_handleNotificationResponse);
  }, []);

  const _handleNotification = notification => {
    console.log({ notification: notification });
  };

  const _handleNotificationResponse = response => {
    console.log('Push notification has been interacted with');
    console.log(response);
  };

  return (
    <WebView
      ref={(ref) => (webview = ref)}
      style={styles.container}
      source={{ uri: 'https://www.timeoverflow.org' }}
      scalesPageToFit={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 305,
    height: 159,
    marginBottom: 10,
  },
  instructions: {
    color: '#888',
    fontSize: 18,
    marginHorizontal: 15,
  },
  button: {
    backgroundColor: 'blue',
    padding: 20,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
  },
  thumbnail: {
    width: 300,
    height: 300,
    resizeMode: "contain"
  }
});
