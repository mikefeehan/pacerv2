import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
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
} from 'lucide-react-native';
import { Button } from '@/components/Button';
import { useAuthStore, usePacerStore } from '@/lib/stores';
import { cn } from '@/lib/cn';
import { VIBES } from '@/lib/types';
import type { VoiceMemo, VibeType } from '@/lib/types';
import * as Haptics from 'expo-haptics';

const MEMO_PROMPTS: Record<VibeType, string[]> = {
  cheerful: [
    "Let's go, you got this!",
    "You're crushing it!",
    "Turn it up!",
  ],
  fired_up: [
    "THIS is your moment!",
    "No stopping now!",
    "You trained for this!",
  ],
  angry: [
    "You think this is hard? PROVE IT!",
    "Pain is temporary. MOVE!",
    "Show me what you're made of!",
  ],
  harsh_coach: [
    "Push mode. No excuses.",
    "No slowing down now, c'mon!",
    "Dig deeper. You have more.",
  ],
  calm: [
    "Breathe. One step at a time.",
    "Stay steady. Trust your training.",
    "Find your rhythm.",
  ],
};

export default function OnboardingScreen() {
  const router = useRouter();
  const updateUser = useAuthStore((s) => s.updateUser);
  const setMyPacerProfile = usePacerStore((s) => s.setMyPacerProfile);

  const [currentStep, setCurrentStep] = useState(0);
  const [memos, setMemos] = useState<VoiceMemo[]>([]);
  const [selectedVibe, setSelectedVibe] = useState<VibeType>('fired_up');
  const [isRecording, setIsRecording] = useState(false);
  const [aiVoiceConsent, setAiVoiceConsent] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [playingMemoId, setPlayingMemoId] = useState<string | null>(null);

  const minMemosRequired = 3; // Minimum 3 for ONE vibe
  const totalSteps = 3;

  const currentPrompts = MEMO_PROMPTS[selectedVibe];
  const memosForSelectedVibe = memos.filter(m => m.vibeTag === selectedVibe);

  // Simulate recording a memo
  const handleStartRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(true);

    // Simulate recording for 3-5 seconds
    const duration = 3 + Math.random() * 2;
    setTimeout(() => {
      const promptIndex = memosForSelectedVibe.length % currentPrompts.length;
      const newMemo: VoiceMemo = {
        id: `memo_${Date.now()}`,
        url: '',
        duration: Math.round(duration),
        vibeTag: selectedVibe,
        name: currentPrompts[promptIndex],
        createdAt: new Date().toISOString(),
      };
      setMemos((prev) => [...prev, newMemo]);
      setIsRecording(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, duration * 1000);
  };

  const handleStopRecording = () => {
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
      const memo = memos.find((m) => m.id === id);
      if (memo) {
        setTimeout(() => setPlayingMemoId(null), memo.duration * 1000);
      }
    }
  };

  const handleConnectSpotify = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

    setMyPacerProfile({
      pacerUserId: 'user_1',
      voiceMemos: memos,
      aiVoiceEnabled: aiVoiceConsent,
      spotifyConnected,
    });

    updateUser({ onboardingComplete: true });
    router.replace('/home');
  };

  const canProceedStep0 = memosForSelectedVibe.length >= minMemosRequired;

  const renderStep0 = () => (
    <Animated.View
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(300)}
      className="flex-1"
    >
      {/* Header */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-pacer-white">
          Record Voice Memos
        </Text>
        <Text className="text-pacer-muted mt-2 leading-6">
          Record at least {minMemosRequired} phrases for a vibe. These play when someone you pace is struggling.
        </Text>
      </View>

      {/* Vibe Selection */}
      <View className="mb-4">
        <Text className="text-pacer-muted text-sm font-medium mb-2">
          Select a Vibe to record for:
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-6 px-6"
          style={{ flexGrow: 0 }}
        >
          {VIBES.map((v) => {
            const count = memos.filter(m => m.vibeTag === v.type).length;
            return (
              <Pressable
                key={v.type}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedVibe(v.type);
                }}
                className={cn(
                  'px-4 py-2 rounded-xl mr-2 border',
                  selectedVibe === v.type
                    ? 'bg-pacer-accent/20 border-pacer-accent'
                    : 'bg-pacer-surface border-transparent'
                )}
              >
                <Text className="text-xl text-center">{v.emoji}</Text>
                <Text className="text-pacer-white text-xs mt-1">{v.label}</Text>
                {count > 0 && (
                  <Text className="text-pacer-accent text-xs text-center">{count} rec</Text>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Progress */}
      <View className="bg-pacer-surface rounded-xl p-4 mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-pacer-muted text-sm">
            {VIBES.find(v => v.type === selectedVibe)?.label} Progress
          </Text>
          <Text className="text-pacer-white font-semibold">
            {memosForSelectedVibe.length} / {minMemosRequired}
          </Text>
        </View>
        <View className="h-2 bg-pacer-border rounded-full overflow-hidden">
          <View
            className="h-full bg-pacer-accent rounded-full"
            style={{ width: `${Math.min((memosForSelectedVibe.length / minMemosRequired) * 100, 100)}%` }}
          />
        </View>
      </View>

      {/* Prompt suggestion */}
      {memosForSelectedVibe.length < currentPrompts.length && (
        <View className="bg-pacer-accent/10 border border-pacer-accent/30 rounded-xl p-4 mb-4">
          <Text className="text-pacer-accent text-sm font-medium">Try saying:</Text>
          <Text className="text-pacer-white mt-1">
            "{currentPrompts[memosForSelectedVibe.length % currentPrompts.length]}"
          </Text>
        </View>
      )}

      {/* Memos List */}
      <ScrollView className="flex-1 -mx-6 px-6" showsVerticalScrollIndicator={false}>
        {memosForSelectedVibe.map((memo, index) => (
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
                {memo.duration}s
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
      <View className="mb-8">
        <Text className="text-2xl font-bold text-pacer-white">
          AI Voice
        </Text>
        <Text className="text-pacer-muted mt-2 leading-6">
          Allow PACER to generate new motivational lines in your voice when someone needs extra encouragement.
        </Text>
      </View>

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

      <View className="bg-pacer-surface/50 rounded-xl p-4 mt-6">
        <Text className="text-pacer-muted text-sm leading-5">
          You control this setting and can disable it anytime. AI-generated lines are short (1-2 sentences) and match the vibe selected by the runner.
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
      <View className="mb-8">
        <Text className="text-2xl font-bold text-pacer-white">
          Connect Music
        </Text>
        <Text className="text-pacer-muted mt-2 leading-6">
          Share your music taste so PACER can play tracks from your library when you pace someone.
        </Text>
      </View>

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

      {!spotifyConnected && (
        <Text className="text-pacer-muted text-sm text-center mt-6">
          You can skip this and use PACER's default mix instead
        </Text>
      )}
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
