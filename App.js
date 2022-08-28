import React, { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as WebBrowser from 'expo-web-browser';
import { StyleSheet, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import registerForPushNotificationsAsync from './lib/pushNotifications';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';

// matches the background color of the webapp's navbar
const navbarStaticTopColor = "rgba(39,151,175,0.9)";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const baseUrl = () => {
  const { releaseChannel } = Constants.manifest;
  console.log("Constants.manifest = ");
  console.log(Constants.manifest);
  console.log("release channel = " + releaseChannel);

  return (releaseChannel === 'staging') ?
    'https://staging.timeoverflow.org' :
    'https://www.timeoverflow.org';
}

export default function App() {
  const [currentUrl, setCurrentUrl] = useState(baseUrl());
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  const webViewRef = useRef(null);

  useEffect(() => {
    const backAction = () => {
      console.log("Back button pressed");

      try {
        webViewRef.current?.goBack()
      }
      catch (err) {
          console.log("[handleBackButtonPress] Error : ", err.message)
      }
      finally {
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    console.log(expoPushToken);

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
      console.log(response.notification.request.content.data);
      const data = response.notification.request.content.data;
      setCurrentUrl(`${baseUrl()}${data.url}`);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const handleStateChange = (navState) => {
    console.log(navState);
    const { url, canGoBack } = navState;

    if (!url.includes('timeoverflow')) {
      if (canGoBack) {
        webViewRef.current?.goBack()
      }
      WebBrowser.openBrowserAsync(url)
    }
  };

  return (
    <>
      <StatusBar style="light" backgroundColor={navbarStaticTopColor} />
      <WebView
        ref={ref => webViewRef.current = ref}
        style={styles.container}
        source={{ uri: currentUrl }}
        scalesPageToFit={false}
        onNavigationStateChange={handleStateChange}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
  },
});
