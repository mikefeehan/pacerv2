import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInRight,
  FadeOutLeft,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import {
  Mic,
  Play,
  Pause,
  Trash2,
  Sparkles,
  Music,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
} from 'lucide-react-native';
import { Button } from '@/components/Button';
import { useAuthStore, usePacerStore, useOnboardingStore } from '@/lib/stores';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import type { VoiceMemo, ToneType } from '@/lib/types';

const TONE_OPTIONS: { value: ToneType; label: string; emoji: string }[] = [
  { value: 'cheerful', label: 'Cheerful', emoji: '😊' },
  { value: 'fired_up', label: 'Fired Up', emoji: '🔥' },
  { value: 'angry', label: 'Angry', emoji: '😤' },
  { value: 'harsh_coach', label: 'Harsh Coach', emoji: '💪' },
  { value: 'calm', label: 'Calm', emoji: '😌' },
];

const MEMO_PROMPTS = [
  "Let's go! You've got this!",
  "Push through, you're stronger than this!",
  "One step at a time, keep moving!",
  "You trained for this moment!",
  "No excuses, finish strong!",
  "This is where champions are made!",
  "Feel the burn, embrace it!",
  "You're almost there, don't stop now!",
];

export default function OnboardingScreen() {
  const router = useRouter();
  const updateUser = useAuthStore((s) => s.updateUser);
  const setMyPacerProfile = usePacerStore((s) => s.setMyPacerProfile);

  const [currentStep, setCurrentStep] = useState(0);
  const [memos, setMemos] = useState<VoiceMemo[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [aiVoiceConsent, setAiVoiceConsent] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [playingMemoId, setPlayingMemoId] = useState<string | null>(null);

  const minMemosRequired = 5;
  const totalSteps = 3;

  // Simulate recording a memo
  const handleStartRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(true);

    // Simulate recording for 3-5 seconds
    const duration = 3 + Math.random() * 2;
    setTimeout(() => {
      const newMemo: VoiceMemo = {
        id: `memo_${Date.now()}`,
        url: '',
        duration: Math.round(duration),
        toneTag: TONE_OPTIONS[Math.floor(Math.random() * TONE_OPTIONS.length)].value,
        name: MEMO_PROMPTS[memos.length % MEMO_PROMPTS.length],
        createdAt: new Date().toISOString(),
      };
      setMemos((prev) => [...prev, newMemo]);
      setIsRecording(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, duration * 1000);
  };

  const handleStopRecording = () => {
    // In real app, would stop the actual recording
    setIsRecording(false);
  };

  const handleDeleteMemo = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMemos((prev) => prev.filter((m) => m.id !== id));
  };

  const handlePlayMemo = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (playingMemoId === id) {
      setPlayingMemoId(null);
    } else {
      setPlayingMemoId(id);
      // Simulate playback duration
      const memo = memos.find((m) => m.id === id);
      if (memo) {
        setTimeout(() => setPlayingMemoId(null), memo.duration * 1000);
      }
    }
  };

  const handleConnectSpotify = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Simulate Spotify OAuth
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSpotifyConnected(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Save pacer profile
    setMyPacerProfile({
      pacerUserId: 'user_1',
      voiceMemos: memos,
      aiVoiceEnabled: aiVoiceConsent,
      spotifyConnected,
    });

    // Mark onboarding complete
    updateUser({ onboardingComplete: true });

    // Navigate to home
    router.replace('/home');
  };

  const canProceedStep0 = memos.length >= minMemosRequired;
  const canProceedStep1 = true; // AI consent is optional
  const canProceedStep2 = true; // Spotify is optional

  const renderStep0 = () => (
    <Animated.View
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(300)}
      className="flex-1"
    >
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-pacer-white">
          Record Voice Memos
        </Text>
        <Text className="text-pacer-muted mt-2 leading-6">
          Record at least {minMemosRequired} motivational messages. These will play when someone you pace is struggling.
        </Text>
      </View>

      {/* Progress */}
      <View className="bg-pacer-surface rounded-xl p-4 mb-6">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-pacer-muted text-sm">Progress</Text>
          <Text className="text-pacer-white font-semibold">
            {memos.length} / {minMemosRequired}
          </Text>
        </View>
        <View className="h-2 bg-pacer-border rounded-full overflow-hidden">
          <View
            className="h-full bg-pacer-accent rounded-full"
            style={{ width: `${Math.min((memos.length / minMemosRequired) * 100, 100)}%` }}
          />
        </View>
      </View>

      {/* Prompt suggestion */}
      {memos.length < MEMO_PROMPTS.length && (
        <View className="bg-pacer-accent/10 border border-pacer-accent/30 rounded-xl p-4 mb-4">
          <Text className="text-pacer-accent text-sm font-medium">Try saying:</Text>
          <Text className="text-pacer-white mt-1">
            "{MEMO_PROMPTS[memos.length]}"
          </Text>
        </View>
      )}

      {/* Memos List */}
      <ScrollView className="flex-1 -mx-6 px-6" showsVerticalScrollIndicator={false}>
        {memos.map((memo, index) => (
          <Animated.View
            key={memo.id}
            entering={FadeIn.delay(index * 50)}
            className="bg-pacer-surface rounded-xl p-4 mb-3 flex-row items-center"
          >
            <Pressable
              onPress={() => handlePlayMemo(memo.id)}
              className="w-10 h-10 rounded-full bg-pacer-accent/20 items-center justify-center mr-3"
            >
              {playingMemoId === memo.id ? (
                <Pause size={18} color="#FF6B35" />
              ) : (
                <Play size={18} color="#FF6B35" />
              )}
            </Pressable>

            <View className="flex-1">
              <Text className="text-pacer-white font-medium" numberOfLines={1}>
                {memo.name}
              </Text>
              <Text className="text-pacer-muted text-sm">
                {memo.duration}s • {TONE_OPTIONS.find((t) => t.value === memo.toneTag)?.label}
              </Text>
            </View>

            <Pressable
              onPress={() => handleDeleteMemo(memo.id)}
              className="p-2 active:opacity-50"
            >
              <Trash2 size={18} color="#6B7280" />
            </Pressable>
          </Animated.View>
        ))}
        <View className="h-32" />
      </ScrollView>

      {/* Record Button */}
      <View className="absolute bottom-0 left-0 right-0 items-center pb-4">
        <Pressable
          onPress={isRecording ? handleStopRecording : handleStartRecording}
          className={cn(
            'w-20 h-20 rounded-full items-center justify-center',
            isRecording ? 'bg-red-500' : 'bg-pacer-accent'
          )}
          style={{
            shadowColor: isRecording ? '#EF4444' : '#FF6B35',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
          }}
        >
          {isRecording ? (
            <View className="w-6 h-6 bg-white rounded" />
          ) : (
            <Mic size={32} color="#FFF" />
          )}
        </Pressable>
        <Text className="text-pacer-muted text-sm mt-3">
          {isRecording ? 'Recording... tap to stop' : 'Tap to record'}
        </Text>
      </View>
    </Animated.View>
  );

  const renderStep1 = () => (
    <Animated.View
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(300)}
      className="flex-1"
    >
      {/* Header */}
      <View className="mb-8">
        <Text className="text-2xl font-bold text-pacer-white">
          AI Voice
        </Text>
        <Text className="text-pacer-muted mt-2 leading-6">
          Allow PACER to generate new motivational lines in your voice when someone needs extra encouragement.
        </Text>
      </View>

      {/* AI Voice Card */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setAiVoiceConsent(!aiVoiceConsent);
        }}
        className={cn(
          'bg-pacer-surface rounded-2xl p-6 border-2',
          aiVoiceConsent ? 'border-pacer-accent' : 'border-transparent'
        )}
      >
        <View className="flex-row items-start">
          <View className="w-14 h-14 rounded-2xl bg-pacer-accent/20 items-center justify-center mr-4">
            <Sparkles size={28} color="#FF6B35" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-pacer-white">
              Enable AI Voice
            </Text>
            <Text className="text-pacer-muted mt-1 leading-5">
              Generate unique motivational lines that sound like you
            </Text>
          </View>
          <View
            className={cn(
              'w-7 h-7 rounded-full items-center justify-center',
              aiVoiceConsent ? 'bg-pacer-accent' : 'bg-pacer-border'
            )}
          >
            {aiVoiceConsent && <Check size={16} color="#FFF" />}
          </View>
        </View>
      </Pressable>

      {/* Info Box */}
      <View className="bg-pacer-surface/50 rounded-xl p-4 mt-6">
        <Text className="text-pacer-muted text-sm leading-5">
          You control this setting and can disable it anytime. AI-generated lines are short (1-2 sentences) and match the tone selected by the runner.
        </Text>
      </View>

      {/* Privacy Note */}
      <View className="flex-row items-center mt-6 px-2">
        <View className="w-2 h-2 rounded-full bg-pacer-success mr-3" />
        <Text className="text-pacer-muted text-sm flex-1">
          Your voice data stays private and is only used to help friends you approve.
        </Text>
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(300)}
      className="flex-1"
    >
      {/* Header */}
      <View className="mb-8">
        <Text className="text-2xl font-bold text-pacer-white">
          Connect Music
        </Text>
        <Text className="text-pacer-muted mt-2 leading-6">
          Share your music taste so PACER can play tracks from your library when you pace someone.
        </Text>
      </View>

      {/* Spotify Card */}
      <Pressable
        onPress={spotifyConnected ? undefined : handleConnectSpotify}
        disabled={spotifyConnected}
        className={cn(
          'bg-pacer-surface rounded-2xl p-6 border-2',
          spotifyConnected ? 'border-pacer-success' : 'border-transparent'
        )}
      >
        <View className="flex-row items-center">
          <View
            className={cn(
              'w-14 h-14 rounded-2xl items-center justify-center mr-4',
              spotifyConnected ? 'bg-pacer-success/20' : 'bg-[#1DB954]/20'
            )}
          >
            <Music size={28} color={spotifyConnected ? '#34D399' : '#1DB954'} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-pacer-white">
              {spotifyConnected ? 'Spotify Connected' : 'Connect Spotify'}
            </Text>
            <Text className="text-pacer-muted mt-1">
              {spotifyConnected
                ? 'Your music taste is ready to share'
                : 'Share your workout playlists and top tracks'}
            </Text>
          </View>
          {spotifyConnected ? (
            <View className="w-7 h-7 rounded-full bg-pacer-success items-center justify-center">
              <Check size={16} color="#FFF" />
            </View>
          ) : (
            <ChevronRight size={20} color="#6B7280" />
          )}
        </View>
      </Pressable>

      {/* Skip option */}
      {!spotifyConnected && (
        <Text className="text-pacer-muted text-sm text-center mt-6">
          You can skip this and use PACER's default mix instead
        </Text>
      )}

      {/* What we access */}
      <View className="bg-pacer-surface/50 rounded-xl p-4 mt-8">
        <Text className="text-pacer-muted text-sm font-medium mb-3">
          What we'll access:
        </Text>
        <View className="gap-y-2">
          <Text className="text-pacer-muted text-sm">• Your top tracks and liked songs</Text>
          <Text className="text-pacer-muted text-sm">• Workout playlists</Text>
          <Text className="text-pacer-muted text-sm">• Basic playback (with your permission)</Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-pacer-bg">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6 pt-4">
          {/* Top Navigation */}
          <View className="flex-row items-center justify-between mb-6">
            {currentStep > 0 ? (
              <Pressable
                onPress={handleBack}
                className="flex-row items-center active:opacity-50"
              >
                <ChevronLeft size={20} color="#FF6B35" />
                <Text className="text-pacer-accent font-medium ml-1">Back</Text>
              </Pressable>
            ) : (
              <View className="w-16" />
            )}

            {/* Step Indicators */}
            <View className="flex-row gap-x-2">
              {[0, 1, 2].map((step) => (
                <View
                  key={step}
                  className={cn(
                    'w-8 h-1 rounded-full',
                    step === currentStep
                      ? 'bg-pacer-accent'
                      : step < currentStep
                      ? 'bg-pacer-success'
                      : 'bg-pacer-border'
                  )}
                />
              ))}
            </View>

            <View className="w-16" />
          </View>

          {/* Step Content */}
          {currentStep === 0 && renderStep0()}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
        </View>

        {/* Bottom Navigation (not for step 0 due to record button) */}
        {currentStep !== 0 && (
          <View className="px-6 pb-4">
            <Button
              onPress={currentStep === totalSteps - 1 ? handleFinish : handleNext}
              variant="primary"
              size="lg"
              fullWidth
            >
              {currentStep === totalSteps - 1 ? 'Finish Setup' : 'Continue'}
            </Button>
          </View>
        )}

        {/* Next button for step 0 */}
        {currentStep === 0 && canProceedStep0 && (
          <View className="absolute bottom-4 right-6">
            <Button onPress={handleNext} variant="primary" size="md">
              Next
            </Button>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
