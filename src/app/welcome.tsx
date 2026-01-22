import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { X, Headphones, Zap, Users, ChevronRight } from 'lucide-react-native';
import { Button } from '@/components/Button';

export default function WelcomeScreen() {
  const router = useRouter();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleConnectStrava = () => {
    router.push('/strava-connect');
  };

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6 justify-between py-8">
          {/* Top Section - Logo */}
          <Animated.View
            entering={FadeIn.delay(200).duration(600)}
            className="items-center flex-1 justify-center"
          >
            <Image
              source={require('../../public/chatgpt-image-jan-21--2026--06-19-03-pm-1.png')}
              style={{ width: 260, height: 130 }}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Bottom Section - Copy & CTAs */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            className="gap-y-6"
          >
            <View className="items-center">
              <Text className="text-2xl font-semibold text-pacer-white text-center leading-9">
                Take your friends{'\n'}on a run with you.
              </Text>
              <Text className="text-base text-pacer-muted text-center mt-4 px-4 leading-6">
                PACER plays voice and music from someone you choose when your run gets tough.
              </Text>
            </View>

            <View className="gap-y-4 pt-4">
              <Button
                onPress={handleConnectStrava}
                variant="primary"
                size="lg"
                fullWidth
                icon={<ChevronRight size={20} color="#FFF" />}
              >
                Connect Strava to Start
              </Button>

              <Pressable
                onPress={() => setShowHowItWorks(true)}
                className="py-3 active:opacity-70"
              >
                <Text className="text-center text-pacer-accent font-medium text-base">
                  How it works
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>

      {/* How It Works Modal */}
      <Modal
        visible={showHowItWorks}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHowItWorks(false)}
      >
        <View className="flex-1 bg-pacer-bg">
          <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-pacer-border">
              <Text className="text-xl font-semibold text-pacer-white">
                How PACER Works
              </Text>
              <Pressable
                onPress={() => setShowHowItWorks(false)}
                className="p-2 rounded-full bg-pacer-surface active:bg-pacer-border"
              >
                <X size={20} color="#FAFAFA" />
              </Pressable>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 px-6 py-6">
              {/* Step 1 */}
              <View className="flex-row mb-8">
                <View className="w-12 h-12 rounded-full bg-pacer-accent/20 items-center justify-center mr-4">
                  <Users size={24} color="#FF6B35" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-pacer-white mb-2">
                    1. Choose a Pacer
                  </Text>
                  <Text className="text-pacer-muted leading-6">
                    Invite friends to become your Pacers. They'll record voice memos and share their music taste with you.
                  </Text>
                </View>
              </View>

              {/* Step 2 */}
              <View className="flex-row mb-8">
                <View className="w-12 h-12 rounded-full bg-pacer-accent/20 items-center justify-center mr-4">
                  <Zap size={24} color="#FF6B35" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-pacer-white mb-2">
                    2. Start Your Run
                  </Text>
                  <Text className="text-pacer-muted leading-6">
                    Select your Pacer, set your tone (fired up, calm, harsh coach...), then start running. PACER watches your effort via Strava.
                  </Text>
                </View>
              </View>

              {/* Step 3 */}
              <View className="flex-row mb-8">
                <View className="w-12 h-12 rounded-full bg-pacer-accent/20 items-center justify-center mr-4">
                  <Headphones size={24} color="#FF6B35" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-pacer-white mb-2">
                    3. Get Paced
                  </Text>
                  <Text className="text-pacer-muted leading-6">
                    When you're struggling, PACER plays your friend's voice and queues up music that matches your effort. It's like having them right there pacing you.
                  </Text>
                </View>
              </View>

              {/* Why Strava */}
              <View className="bg-pacer-surface rounded-2xl p-5 mt-4">
                <Text className="text-base font-semibold text-pacer-white mb-2">
                  Why Strava?
                </Text>
                <Text className="text-pacer-muted leading-6">
                  PACER doesn't track GPS—Strava is your system of record. We read your run data to detect when you need a boost, nothing more.
                </Text>
              </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View className="px-6 pb-4">
              <Button
                onPress={() => {
                  setShowHowItWorks(false);
                  router.push('/strava-connect');
                }}
                variant="primary"
                size="lg"
                fullWidth
              >
                Let's Go
              </Button>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
