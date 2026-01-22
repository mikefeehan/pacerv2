import React, { useEffect, useState } from 'react';
import { View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAuthStore } from '@/lib/stores';

export default function SplashScreenPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [animationComplete, setAnimationComplete] = useState(false);

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.9);

  const navigateNext = () => {
    if (user?.stravaConnected && user?.onboardingComplete) {
      router.replace('/home');
    } else if (user?.stravaConnected) {
      router.replace('/onboarding');
    } else {
      router.replace('/welcome');
    }
  };

  useEffect(() => {
    SplashScreen.hideAsync();

    // Animate logo in with a smooth fade and scale
    logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    logoScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.2)) });

    // Set animation complete after delay
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (animationComplete) {
      navigateNext();
    }
  }, [animationComplete, isLoading]);

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
