import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
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
import { PacerLogo } from '@/components/PacerLogo';
import { useAuthStore } from '@/lib/stores';

export default function SplashScreenPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);

  const navigateNext = () => {
    if (isLoading) return;

    if (user?.stravaConnected && user?.onboardingComplete) {
      router.replace('/home');
    } else if (user?.stravaConnected) {
      router.replace('/onboarding');
    } else {
      router.replace('/welcome');
    }
  };

  useEffect(() => {
    // Hide the native splash screen
    SplashScreen.hideAsync();

    // Animate logo in
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    logoScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) });

    // Animate text
    textOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));

    // Navigate after animation
    const timer = setTimeout(() => {
      runOnJS(navigateNext)();
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View className="flex-1 bg-pacer-bg items-center justify-center">
      {/* Animated Logo */}
      <Animated.View style={logoAnimatedStyle}>
        <PacerLogo size={120} animated intensity="idle" />
      </Animated.View>

      {/* Brand Name */}
      <Animated.View style={textAnimatedStyle} className="mt-8">
        <Text className="text-4xl font-bold text-pacer-white tracking-widest">
          PACER
        </Text>
      </Animated.View>

      {/* Subtle tagline */}
      <Animated.View style={textAnimatedStyle} className="mt-3">
        <Text className="text-sm text-pacer-muted">
          Take your friends on a run with you
        </Text>
      </Animated.View>
    </View>
  );
}
