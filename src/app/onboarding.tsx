import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import {
  Mic,
  Play,
  Pause,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
  Gift,
} from 'lucide-react-native';
import { Button } from '@/components/Button';
import { useAuthStore, usePacerStore } from '@/lib/stores';
import { cn } from '@/lib/cn';
import { PACER_TYPES } from '@/lib/types';
import type { VoiceMemo, PacerType } from '@/lib/types';
import * as Haptics from 'expo-haptics';

const TOTAL_STEPS = 3;
const MIN_CORE_PHRASES = 3;
const MAX_BONUS_MEMOS = 2;

export default function OnboardingScreen() {
  const router = useRouter();
  const updateUser = useAuthStore((s) => s.updateUser);
  const setMyPacerProfile = usePacerStore((s) => s.setMyPacerProfile);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPacerType, setSelectedPacerType] = useState<PacerType | null>(null);
  const [corePhrases, setCorePhrases] = useState<VoiceMemo[]>([]);
  const [bonusMemos, setBonusMemos] = useState<VoiceMemo[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [playingMemoId, setPlayingMemoId] = useState<string | null>(null);

  const selectedTypeConfig = PACER_TYPES.find(t => t.type === selectedPacerType);

  // Simulate recording a memo
  const handleStartRecording = (isBonus: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(true);

    const duration = 2 + Math.random() * 2; // 2-4 seconds
    setTimeout(() => {
      const newMemo: VoiceMemo = {
        id: `memo_${Date.now()}`,
        url: '',
        duration: Math.round(duration),
        vibeTag: isBonus ? undefined : selectedPacerType ?? undefined,
        isBonus,
        name: isBonus
          ? `Bonus memo ${bonusMemos.length + 1}`
          : selectedTypeConfig?.examplePhrases[corePhrases.length % 3] ?? 'Recorded phrase',
        createdAt: new Date().toISOString(),
      };

      if (isBonus) {
        setBonusMemos((prev) => [...prev, newMemo]);
      } else {
        setCorePhrases((prev) => [...prev, newMemo]);
      }
      setIsRecording(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, duration * 1000);
  };

  const handleDeleteMemo = (id: string, isBonus: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isBonus) {
      setBonusMemos((prev) => prev.filter((m) => m.id !== id));
    } else {
      setCorePhrases((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handlePlayMemo = (id: string, memos: VoiceMemo[]) => {
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

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
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
    if (!selectedPacerType) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Combine all memos for backwards compatibility
    const allMemos = [...corePhrases, ...bonusMemos];

    setMyPacerProfile({
      pacerUserId: 'user_1',
      primaryPacerType: selectedPacerType,
      corePhrases,
      bonusMemos,
      additionalVibes: [],
      voiceMemos: allMemos,
      aiVoiceEnabled: false,
      spotifyConnected: false,
    });

    updateUser({ onboardingComplete: true });
    router.replace('/home');
  };

  const handleSkipBonus = () => {
    handleFinish();
  };

  const canProceedStep0 = selectedPacerType !== null;
  const canProceedStep1 = corePhrases.length >= MIN_CORE_PHRASES;

  // Step 0: Choose Pacer Type (Identity)
  const renderStep0 = () => (
    <Animated.View
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(300)}
      className="flex-1"
    >
      <View className="mb-6">
        <Text className="text-2xl font-bold text-pacer-white">
          What kind of Pacer do you want to be?
        </Text>
        <Text className="text-pacer-muted mt-2 leading-6">
          This is how runners will experience you. Choose one identity.
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {PACER_TYPES.map((pacerType, index) => (
          <Animated.View
            key={pacerType.type}
            entering={FadeInDown.delay(index * 100).duration(300)}
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setSelectedPacerType(pacerType.type);
              }}
              className={cn(
                'bg-pacer-surface rounded-2xl p-5 mb-3 border-2',
                selectedPacerType === pacerType.type
                  ? 'border-pacer-accent'
                  : 'border-transparent'
              )}
            >
              <View className="flex-row items-start">
                <Text className="text-4xl mr-4">{pacerType.emoji}</Text>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-pacer-white">
                    {pacerType.label}
                  </Text>
                  <Text className="text-pacer-muted mt-1 leading-5">
                    {pacerType.description}
                  </Text>
                </View>
                {selectedPacerType === pacerType.type && (
                  <View className="w-7 h-7 rounded-full bg-pacer-accent items-center justify-center">
                    <Check size={16} color="#FFF" />
                  </View>
                )}
              </View>
            </Pressable>
          </Animated.View>
        ))}
        <View className="h-8" />
      </ScrollView>
    </Animated.View>
  );

  // Step 1: Record Core Phrases (Required)
  const renderStep1 = () => (
    <Animated.View
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(300)}
      className="flex-1"
    >
      <View className="mb-4">
        <View className="flex-row items-center mb-2">
          <Text className="text-3xl mr-2">{selectedTypeConfig?.emoji}</Text>
          <Text className="text-2xl font-bold text-pacer-white">
            Record Your Phrases
          </Text>
        </View>
        <Text className="text-pacer-muted leading-6">
          Record {MIN_CORE_PHRASES} short phrases (2-4 seconds each) that match your {selectedTypeConfig?.label} style.
        </Text>
      </View>

      {/* Progress */}
      <View className="bg-pacer-surface rounded-xl p-4 mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-pacer-muted text-sm">Progress</Text>
          <Text className="text-pacer-white font-semibold">
            {corePhrases.length} / {MIN_CORE_PHRASES}
          </Text>
        </View>
        <View className="h-2 bg-pacer-border rounded-full overflow-hidden">
          <View
            className="h-full bg-pacer-accent rounded-full"
            style={{ width: `${Math.min((corePhrases.length / MIN_CORE_PHRASES) * 100, 100)}%` }}
          />
        </View>
        {corePhrases.length >= MIN_CORE_PHRASES && (
          <Text className="text-pacer-success text-sm mt-2">
            Ready to continue!
          </Text>
        )}
      </View>

      {/* Prompt suggestion */}
      {corePhrases.length < MIN_CORE_PHRASES && selectedTypeConfig && (
        <View className="bg-pacer-accent/10 border border-pacer-accent/30 rounded-xl p-4 mb-4">
          <Text className="text-pacer-accent text-sm font-medium">Try saying:</Text>
          <Text className="text-pacer-white text-lg mt-1">
            "{selectedTypeConfig.examplePhrases[corePhrases.length % 3]}"
          </Text>
        </View>
      )}

      {/* Recorded Phrases */}
      <ScrollView className="flex-1 -mx-6 px-6" showsVerticalScrollIndicator={false}>
        {corePhrases.map((memo, index) => (
          <Animated.View
            key={memo.id}
            entering={FadeIn.delay(index * 50)}
            className="bg-pacer-surface rounded-xl p-4 mb-3 flex-row items-center"
          >
            <Pressable
              onPress={() => handlePlayMemo(memo.id, corePhrases)}
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
              <Text className="text-pacer-muted text-sm">{memo.duration}s</Text>
            </View>

            <Pressable
              onPress={() => handleDeleteMemo(memo.id, false)}
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
          onPress={() => handleStartRecording(false)}
          disabled={isRecording}
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
          {isRecording ? 'Recording...' : 'Tap to record'}
        </Text>
      </View>
    </Animated.View>
  );

  // Step 2: Bonus Custom Memos (Optional)
  const renderStep2 = () => (
    <Animated.View
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(300)}
      className="flex-1"
    >
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Gift size={28} color="#FF6B35" />
          <Text className="text-2xl font-bold text-pacer-white ml-3">
            Want to add anything personal?
          </Text>
        </View>
        <Text className="text-pacer-muted leading-6">
          Record up to {MAX_BONUS_MEMOS} bonus voice memos. These are optional and will be played occasionally to make your pacing feel more personal.
        </Text>
      </View>

      {/* Ideas */}
      <View className="bg-pacer-surface/50 rounded-xl p-4 mb-4">
        <Text className="text-pacer-muted text-sm mb-2">Ideas:</Text>
        <Text className="text-pacer-white text-sm leading-5">
          • Inside jokes{'\n'}
          • Personal encouragement{'\n'}
          • Your signature catchphrase{'\n'}
          • Anything that makes it uniquely you
        </Text>
      </View>

      {/* Recorded Bonus Memos */}
      {bonusMemos.length > 0 && (
        <View className="mb-4">
          <Text className="text-pacer-muted text-sm font-medium mb-2">
            Your bonus memos ({bonusMemos.length}/{MAX_BONUS_MEMOS})
          </Text>
          {bonusMemos.map((memo, index) => (
            <Animated.View
              key={memo.id}
              entering={FadeIn.delay(index * 50)}
              className="bg-pacer-surface rounded-xl p-4 mb-3 flex-row items-center"
            >
              <Pressable
                onPress={() => handlePlayMemo(memo.id, bonusMemos)}
                className="w-10 h-10 rounded-full bg-pacer-accent/20 items-center justify-center mr-3"
              >
                {playingMemoId === memo.id ? (
                  <Pause size={18} color="#FF6B35" />
                ) : (
                  <Play size={18} color="#FF6B35" />
                )}
              </Pressable>

              <View className="flex-1">
                <Text className="text-pacer-white font-medium">{memo.name}</Text>
                <Text className="text-pacer-muted text-sm">{memo.duration}s</Text>
              </View>

              <Pressable
                onPress={() => handleDeleteMemo(memo.id, true)}
                className="p-2 active:opacity-50"
              >
                <Trash2 size={18} color="#6B7280" />
              </Pressable>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Record Button (if not at max) */}
      {bonusMemos.length < MAX_BONUS_MEMOS && (
        <View className="items-center mt-4">
          <Pressable
            onPress={() => handleStartRecording(true)}
            disabled={isRecording}
            className={cn(
              'w-16 h-16 rounded-full items-center justify-center',
              isRecording ? 'bg-red-500' : 'bg-pacer-surface border-2 border-pacer-accent'
            )}
          >
            {isRecording ? (
              <View className="w-5 h-5 bg-white rounded" />
            ) : (
              <Mic size={24} color="#FF6B35" />
            )}
          </Pressable>
          <Text className="text-pacer-muted text-sm mt-2">
            {isRecording ? 'Recording...' : 'Tap to add bonus memo'}
          </Text>
        </View>
      )}

      {/* Info about how bonus memos are used */}
      <View className="mt-auto mb-4 bg-pacer-accent/10 rounded-xl p-4">
        <Text className="text-pacer-accent text-sm">
          Bonus memos are special. They'll be played sparingly during late-run moments or after strong struggle recovery to feel personal.
        </Text>
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

        {/* Bottom Navigation */}
        {currentStep === 0 && canProceedStep0 && (
          <View className="px-6 pb-4">
            <Button onPress={handleNext} variant="primary" size="lg" fullWidth>
              Continue
            </Button>
          </View>
        )}

        {currentStep === 1 && canProceedStep1 && (
          <View className="absolute bottom-4 right-6">
            <Button onPress={handleNext} variant="primary" size="md">
              Next
            </Button>
          </View>
        )}

        {currentStep === 2 && (
          <View className="px-6 pb-4">
            <Button onPress={handleFinish} variant="primary" size="lg" fullWidth>
              {bonusMemos.length > 0 ? 'Finish Setup' : 'Finish Setup'}
            </Button>
            {bonusMemos.length === 0 && (
              <Pressable onPress={handleSkipBonus} className="py-3 mt-2">
                <Text className="text-pacer-muted text-center">Skip for now</Text>
              </Pressable>
            )}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
