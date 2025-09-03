import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000); 
    return () => clearTimeout(timer);
  }, []);

  if (showWelcome) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="dark-content" />
        <Image
          source={require('./assets/images/image.png')} // Your PNG logo file
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Task Manager</Text>
      </View>
    );
  }

  
  return (
    <AuthScreen />
  );
}

function AuthScreen() {
  return (
    <View style={styles.authContainer}>
      <Text style={styles.subtitle}>Sign In / Sign Up</Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold'
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  subtitle: {
    fontSize: 22
  }
});





