import React, { useEffect, useState, useCallback } from 'react';
import { View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useAuthStore } from '@/lib/stores';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function SplashScreenPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [appReady, setAppReady] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);

  const navigateNext = useCallback(() => {
    if (user?.stravaConnected && user?.onboardingComplete) {
      router.replace('/home');
    } else if (user?.stravaConnected) {
      router.replace('/onboarding');
    } else {
      router.replace('/welcome');
    }
  }, [user, router]);

  // Prepare app resources
  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading resources (auth state, etc.)
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  // Hide native splash and start animation when app is ready
  useEffect(() => {
    if (!appReady) return;

    // Hide the native splash screen
    SplashScreen.hideAsync();

    // Start animations
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    logoScale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.1)) });

    // Set animation complete after showing splash for 2 seconds
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [appReady]);

  // Navigate when animation completes and store is ready
  useEffect(() => {
    if (animationComplete && !isLoading) {
      navigateNext();
    }
  }, [animationComplete, isLoading, navigateNext]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <View className="flex-1 bg-black items-center justify-center">
      <Animated.View style={logoAnimatedStyle}>
        <Image
          source={require('../../public/chatgpt-image-jan-21--2026--06-19-03-pm-1.png')}
          style={{ width: 340, height: 170 }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}
