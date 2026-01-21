import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { X, Edit3, Check, Activity } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { useActiveRunStore } from '@/lib/run-store';
import * as Haptics from 'expo-haptics';

const VIBE_LABELS: Record<string, string> = {
  cheerful: 'Cheerful',
  fired_up: 'Fired Up',
  angry: 'Angry',
  harsh_coach: 'Harsh Coach',
  calm: 'Calm',
};

export default function StravaPostScreen() {
  const router = useRouter();
  const session = useActiveRunStore((s) => s.session);
  const resetRun = useActiveRunStore((s) => s.resetRun);

  const pacerNames = session?.pacerNames?.join(' + ') || 'friends';
  const vibeName = session?.vibe ? VIBE_LABELS[session.vibe] : 'Mixed';
  const recapTracks = session?.recapTracks || [];

  const generateDescription = () => {
    let desc = `Run powered by PACER — paced by ${pacerNames}.\n`;
    desc += `Vibe: ${vibeName}\n`;

    if (recapTracks.length > 0) {
      desc += `\nSongs that carried me:\n`;
      recapTracks.forEach((track) => {
        desc += `• ${track.trackName} — ${track.artistName}\n`;
      });
    }

    desc += `\n🏃‍♂️ pacer.app`;
    return desc;
  };

  const [description, setDescription] = useState(generateDescription());
  const [isEditing, setIsEditing] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isPosted, setIsPosted] = useState(false);

  const handlePost = async () => {
    setIsPosting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate posting to Strava
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsPosted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Wait then navigate home
    await new Promise((resolve) => setTimeout(resolve, 1000));
    resetRun();
    router.replace('/home');
  };

  const handleSkip = () => {
    resetRun();
    router.replace('/home');
  };

  return (
    <View className="flex-1 bg-pacer-bg">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Header */}
          <Animated.View
            entering={FadeIn.duration(300)}
            className="flex-row items-center justify-between px-4 py-3 border-b border-pacer-border"
          >
            <Pressable
              onPress={handleSkip}
              className="p-2 -ml-2 active:opacity-50"
            >
              <X size={24} color="#FAFAFA" />
            </Pressable>
            <Text className="text-lg font-semibold text-pacer-white">
              Post to Strava
            </Text>
            <View className="w-10" />
          </Animated.View>

          {/* Content */}
          <View className="flex-1 px-6 py-6">
            {/* Strava Preview Card */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(300)}
              className="bg-pacer-surface rounded-2xl overflow-hidden"
            >
              {/* Strava Header */}
              <View className="flex-row items-center p-4 border-b border-pacer-border">
                <View className="w-10 h-10 rounded-lg bg-[#FC4C02] items-center justify-center mr-3">
                  <Activity size={20} color="#FFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-pacer-white font-semibold">
                    Strava Activity
                  </Text>
                  <Text className="text-pacer-muted text-sm">
                    Description preview
                  </Text>
                </View>
                <Pressable
                  onPress={() => setIsEditing(!isEditing)}
                  className="p-2 rounded-full bg-pacer-border active:opacity-70"
                >
                  <Edit3 size={16} color="#FAFAFA" />
                </Pressable>
              </View>

              {/* Description */}
              <View className="p-4">
                {isEditing ? (
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    className="text-pacer-white min-h-[200px] text-base leading-6"
                    placeholderTextColor="#6B7280"
                    autoFocus
                    onBlur={() => setIsEditing(false)}
                  />
                ) : (
                  <Pressable onPress={() => setIsEditing(true)}>
                    <Text className="text-pacer-white text-base leading-6 whitespace-pre-wrap">
                      {description}
                    </Text>
                  </Pressable>
                )}
              </View>
            </Animated.View>

            {/* Hint */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(300)}
              className="mt-4"
            >
              <Text className="text-pacer-muted text-sm text-center">
                Tap the edit icon or text to customize your post
              </Text>
            </Animated.View>
          </View>

          {/* Bottom CTAs */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(300)}
            className="px-6 pb-4"
          >
            {isPosted ? (
              <View className="flex-row items-center justify-center py-4 bg-pacer-success/20 rounded-xl">
                <Check size={20} color="#34D399" />
                <Text className="text-pacer-success font-semibold ml-2">
                  Posted to Strava!
                </Text>
              </View>
            ) : (
              <>
                <Button
                  onPress={handlePost}
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isPosting}
                >
                  {isPosting ? 'Posting...' : 'Post to Strava'}
                </Button>
                <Pressable
                  onPress={handleSkip}
                  className="py-4 active:opacity-70"
                >
                  <Text className="text-pacer-muted text-center font-medium">
                    Skip
                  </Text>
                </Pressable>
              </>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
