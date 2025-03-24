import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import 'react-native-reanimated';
import { Platform } from 'react-native';
import React  from 'react'

import { useColorScheme } from '../hooks/useColorScheme';


import WelcomeScreen from './welcome';
import Login from './login';
import ProductList from './productlist';
import TabTwoScreen from './(tabs)/explore'

if (Platform.OS !== 'web') {
  // Prevent auto-hiding the splash screen on native platforms
  SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showWelcome, setShowWelcome] = useState(true);
  const [showLogin, setShowLogin] = useState(false); 
  
  // Show WelcomeScreen for 2 seconds, then switch to Login
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      setShowLogin(true);

    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loaded && Platform.OS !== 'web') {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

<Login showLogin={showLogin} setShowLogin={setShowLogin} />

      
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
