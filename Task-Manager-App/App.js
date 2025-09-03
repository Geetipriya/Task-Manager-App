import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, StyleSheet, Platform, Dimensions } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';

const isTablet = Dimensions.get('window').width > 768;

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    async function prepare() {
      await Notifications.requestPermissionsAsync();

     
      setTimeout(() => {
        setAppReady(true);
        SplashScreen.hideAsync();
      }, 5000);
    }
    prepare();
  }, []);

  if (!appReady) {
    return null;
  }

  return (
    <View style={isTablet ? styles.tabletContainer : styles.container}>
   
      {!isAuthenticated ? (
        <View style={styles.centered}>
          <Image
            source={require('./assets/images/image.png')} // update path to your logo
            style={isTablet ? styles.logoTablet : styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Task Manager</Text>
        
          <Button title="Sign in" onPress={() => setIsAuthenticated(true)} />
          <Button title="Sign up" onPress={() => setIsAuthenticated(true)} />
        </View>
      ) : (
        <TaskManagerScreen />
      )}
    </View>
  );
}

function TaskManagerScreen() {
 
  return (
    <View style={styles.centered}>
      <Text style={styles.subtitle}>Welcome!</Text>
      <Text>Here is your Task Manager (Add/Edit/Delete/Toggle tasks)</Text>
      
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabletContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 80,
  },
  centered: {
    alignItems: 'center'
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24
  },
  logoTablet: {
    width: 220,
    height: 220,
    marginBottom: 30
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 14
  },
  subtitle: {
    fontSize: 22,
    marginBottom: 8
  }
});



