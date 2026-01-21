import React from 'react';
import { View, Text, ScrollView, Pressable, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  ChevronLeft,
  User,
  Mic,
  Sparkles,
  Shuffle,
  Music,
  Gauge,
  Play,
  ExternalLink,
} from 'lucide-react-native';
import { Button } from '@/components/Button';
import { usePacerStore, useRunSettingsStore } from '@/lib/stores';
import { cn } from '@/lib/cn';
import type { ToneType, VoiceMode, IntensityLevel } from '@/lib/types';
import * as Haptics from 'expo-haptics';

const VOICE_MODES: { value: VoiceMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'real_only', label: 'Real Only', icon: <Mic size={18} color="#FAFAFA" />, desc: 'Only recorded memos' },
  { value: 'ai_only', label: 'AI Only', icon: <Sparkles size={18} color="#FAFAFA" />, desc: 'AI-generated lines' },
  { value: 'mix', label: 'Mix', icon: <Shuffle size={18} color="#FAFAFA" />, desc: 'Best of both (default)' },
];

const TONES: { value: ToneType; label: string; emoji: string; desc: string }[] = [
  { value: 'cheerful', label: 'Cheerful', emoji: '😊', desc: 'Supportive & upbeat' },
  { value: 'fired_up', label: 'Fired Up', emoji: '🔥', desc: 'Intense & energetic' },
  { value: 'angry', label: 'Angry', emoji: '😤', desc: 'Sharp & challenging' },
  { value: 'harsh_coach', label: 'Harsh Coach', emoji: '💪', desc: 'Blunt, no excuses' },
  { value: 'calm', label: 'Calm', emoji: '😌', desc: 'Steady & reassuring' },
];

const INTENSITIES: { value: IntensityLevel; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export default function PreRunScreen() {
  const router = useRouter();
  const pacers = usePacerStore((s) => s.pacers);

  const selectedPacerId = useRunSettingsStore((s) => s.selectedPacerId);
  const voiceMode = useRunSettingsStore((s) => s.voiceMode);
  const tone = useRunSettingsStore((s) => s.tone);
  const intensity = useRunSettingsStore((s) => s.intensity);
  const musicEnabled = useRunSettingsStore((s) => s.musicEnabled);

  const setSelectedPacer = useRunSettingsStore((s) => s.setSelectedPacer);
  const setVoiceMode = useRunSettingsStore((s) => s.setVoiceMode);
  const setTone = useRunSettingsStore((s) => s.setTone);
  const setIntensity = useRunSettingsStore((s) => s.setIntensity);
  const setMusicEnabled = useRunSettingsStore((s) => s.setMusicEnabled);

  const readyPacers = pacers.filter((p) => p.status === 'ready');
  const selectedPacer = pacers.find((p) => p.pacerUserId === selectedPacerId);

  const handleStartRun = () => {
    if (!selectedPacer) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/run-active');
  };

  const handleOpenStrava = () => {
    Linking.openURL('strava://');
  };

  return (
    <View className="flex-1 bg-pacer-bg">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center p-2 -ml-2 active:opacity-50"
          >
            <ChevronLeft size={24} color="#FF6B35" />
            <Text className="text-pacer-accent font-medium">Back</Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Title */}
          <Animated.View
            entering={FadeIn.duration(300)}
            className="px-6 mb-6"
          >
            <Text className="text-2xl font-bold text-pacer-white">
              Who's pacing you today?
            </Text>
          </Animated.View>

          {/* Pacer Selection */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(300)}
            className="px-6 mb-8"
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-6 px-6"
              style={{ flexGrow: 0 }}
            >
              {readyPacers.map((pacer) => (
                <Pressable
                  key={pacer.pacerUserId}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedPacer(pacer.pacerUserId);
                  }}
                  className={cn(
                    'items-center mr-4 p-3 rounded-2xl border-2',
                    selectedPacerId === pacer.pacerUserId
                      ? 'border-pacer-accent bg-pacer-accent/10'
                      : 'border-transparent bg-pacer-surface'
                  )}
                >
                  {pacer.pacerAvatar ? (
                    <Image
                      source={{ uri: pacer.pacerAvatar }}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <View className="w-16 h-16 rounded-full bg-pacer-border items-center justify-center">
                      <User size={28} color="#6B7280" />
                    </View>
                  )}
                  <Text className="text-pacer-white font-medium mt-2">
                    {pacer.pacerName}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Settings Panel */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(300)}
            className="px-6"
          >
            {/* Voice Mode */}
            <View className="mb-6">
              <Text className="text-pacer-muted text-sm font-medium uppercase tracking-wide mb-3">
                Voice Mode
              </Text>
              <View className="flex-row">
                {VOICE_MODES.map((mode) => (
                  <Pressable
                    key={mode.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setVoiceMode(mode.value);
                    }}
                    className={cn(
                      'flex-1 p-3 rounded-xl mr-2 last:mr-0 border',
                      voiceMode === mode.value
                        ? 'bg-pacer-accent/20 border-pacer-accent'
                        : 'bg-pacer-surface border-transparent'
                    )}
                  >
                    <View className="items-center">
                      {mode.icon}
                      <Text className="text-pacer-white font-medium text-sm mt-2">
                        {mode.label}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Tone */}
            <View className="mb-6">
              <Text className="text-pacer-muted text-sm font-medium uppercase tracking-wide mb-3">
                Tone
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-6 px-6"
                style={{ flexGrow: 0 }}
              >
                {TONES.map((t) => (
                  <Pressable
                    key={t.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setTone(t.value);
                    }}
                    className={cn(
                      'px-4 py-3 rounded-xl mr-2 border',
                      tone === t.value
                        ? 'bg-pacer-accent/20 border-pacer-accent'
                        : 'bg-pacer-surface border-transparent'
                    )}
                  >
                    <Text className="text-2xl text-center">{t.emoji}</Text>
                    <Text className="text-pacer-white font-medium text-sm mt-1">
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Music Toggle */}
            <View className="mb-6">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMusicEnabled(!musicEnabled);
                }}
                className={cn(
                  'flex-row items-center p-4 rounded-xl border',
                  musicEnabled
                    ? 'bg-pacer-accent/20 border-pacer-accent'
                    : 'bg-pacer-surface border-transparent'
                )}
              >
                <View className="w-10 h-10 rounded-full bg-pacer-accent/30 items-center justify-center mr-3">
                  <Music size={20} color="#FF6B35" />
                </View>
                <View className="flex-1">
                  <Text className="text-pacer-white font-medium">
                    Use {selectedPacer?.pacerName || "Pacer"}'s Music
                  </Text>
                  <Text className="text-pacer-muted text-sm">
                    AI-adjusted to match your tone
                  </Text>
                </View>
                <View
                  className={cn(
                    'w-12 h-7 rounded-full p-1',
                    musicEnabled ? 'bg-pacer-accent' : 'bg-pacer-border'
                  )}
                >
                  <View
                    className={cn(
                      'w-5 h-5 rounded-full bg-white',
                      musicEnabled ? 'ml-auto' : ''
                    )}
                  />
                </View>
              </Pressable>
            </View>

            {/* Intensity */}
            <View className="mb-8">
              <View className="flex-row items-center mb-3">
                <Gauge size={16} color="#6B7280" />
                <Text className="text-pacer-muted text-sm font-medium uppercase tracking-wide ml-2">
                  Intensity
                </Text>
              </View>
              <View className="flex-row bg-pacer-surface rounded-xl p-1">
                {INTENSITIES.map((i) => (
                  <Pressable
                    key={i.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIntensity(i.value);
                    }}
                    className={cn(
                      'flex-1 py-3 rounded-lg',
                      intensity === i.value ? 'bg-pacer-accent' : ''
                    )}
                  >
                    <Text
                      className={cn(
                        'text-center font-medium',
                        intensity === i.value ? 'text-white' : 'text-pacer-muted'
                      )}
                    >
                      {i.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text className="text-pacer-muted text-xs text-center mt-2">
                Controls how often hype moments trigger
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Bottom CTAs */}
        <View className="px-6 pb-4 pt-2 border-t border-pacer-border">
          <Button
            onPress={handleStartRun}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selectedPacer}
            icon={<Play size={20} color="#FFF" fill="#FFF" />}
          >
            Start PACER
          </Button>

          <Pressable
            onPress={handleOpenStrava}
            className="flex-row items-center justify-center py-3 mt-2 active:opacity-70"
          >
            <Text className="text-pacer-accent font-medium mr-2">
              Open Strava
            </Text>
            <ExternalLink size={16} color="#FF6B35" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
