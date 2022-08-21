import React, { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
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

  return (releaseChannel === 'staging') ?
    'https://staging.timeoverflow.org' :
    'https://www.timeoverflow.org';
}

export default function App() {
  const [currentUrl, setCurrentUrl] = useState(baseUrl());
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

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

  console.log(Constants.statusBarHeight);

  return (
    <>
      <WebView
        ref={(ref) => (webview = ref)}
        style={styles.container}
        source={{ uri: currentUrl }}
        scalesPageToFit={false}
      />
      <StatusBar style="light" backgroundColor={navbarStaticTopColor} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Constants.statusBarHeight,
  },
});
