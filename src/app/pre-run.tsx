import React from 'react';
import { View, Text, ScrollView, Pressable, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  ChevronLeft,
  User,
  Mic,
  Sparkles,
  Shuffle,
  Music,
  Play,
  ExternalLink,
  Check,
  Vibrate,
  Watch,
  Smartphone,
} from 'lucide-react-native';
import { Button } from '@/components/Button';
import { usePacerStore, useRunSettingsStore } from '@/lib/stores';
import { cn } from '@/lib/cn';
import { VIBES } from '@/lib/types';
import type { VibeType, VoiceMode, IntensityLevel } from '@/lib/types';
import type { HapticDeviceMode } from '@/lib/haptics';
import { getHapticPatternDescription } from '@/lib/haptics';
import * as Haptics from 'expo-haptics';

const VOICE_MODES: { value: VoiceMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'real_only', label: 'Real Only', icon: <Mic size={18} color="#FAFAFA" />, desc: 'Only recorded memos' },
  { value: 'ai_only', label: 'AI Only', icon: <Sparkles size={18} color="#FAFAFA" />, desc: 'AI-generated lines' },
  { value: 'mix', label: 'Mix', icon: <Shuffle size={18} color="#FAFAFA" />, desc: 'Best of both (default)' },
];

const HAPTIC_DEVICE_MODES: { value: HapticDeviceMode; label: string; icon: React.ReactNode }[] = [
  { value: 'off', label: 'Off', icon: null },
  { value: 'iphone_only', label: 'iPhone', icon: <Smartphone size={16} color="#FAFAFA" /> },
  { value: 'iphone_watch', label: 'iPhone + Watch', icon: <Watch size={16} color="#FAFAFA" /> },
];

const HAPTIC_INTENSITY_OPTIONS: { value: IntensityLevel; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export default function PreRunScreen() {
  const router = useRouter();
  const pacers = usePacerStore((s) => s.pacers);

  const selectedPacerIds = useRunSettingsStore((s) => s.selectedPacerIds);
  const voiceMode = useRunSettingsStore((s) => s.voiceMode);
  const vibe = useRunSettingsStore((s) => s.vibe);
  const musicEnabled = useRunSettingsStore((s) => s.musicEnabled);
  const hapticSettings = useRunSettingsStore((s) => s.hapticSettings);

  const togglePacer = useRunSettingsStore((s) => s.togglePacer);
  const setVoiceMode = useRunSettingsStore((s) => s.setVoiceMode);
  const setVibe = useRunSettingsStore((s) => s.setVibe);
  const setMusicEnabled = useRunSettingsStore((s) => s.setMusicEnabled);
  const setHapticSettings = useRunSettingsStore((s) => s.setHapticSettings);

  const readyPacers = pacers.filter((p) => p.status === 'ready');
  const selectedPacers = pacers.filter((p) => selectedPacerIds.includes(p.pacerUserId));
  const vibeConfig = VIBES.find(v => v.type === vibe);

  const canStartRun = selectedPacers.length > 0;

  const handleStartRun = () => {
    if (!canStartRun) return;
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

          {/* Step 1: Pacer Selection (Multi-select) */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(300)}
            className="px-6 mb-8"
          >
            <Text className="text-pacer-muted text-sm font-medium uppercase tracking-wide mb-3">
              Step 1: Select Pacers
            </Text>
            <Text className="text-pacer-muted text-sm mb-3">
              Tap to select multiple pacers
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-6 px-6"
              style={{ flexGrow: 0 }}
            >
              {readyPacers.map((pacer) => {
                const isSelected = selectedPacerIds.includes(pacer.pacerUserId);
                return (
                  <Pressable
                    key={pacer.pacerUserId}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      togglePacer(pacer.pacerUserId);
                    }}
                    className={cn(
                      'items-center mr-4 p-3 rounded-2xl border-2',
                      isSelected
                        ? 'border-pacer-accent bg-pacer-accent/10'
                        : 'border-transparent bg-pacer-surface'
                    )}
                  >
                    <View className="relative">
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
                      {isSelected && (
                        <View className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-pacer-accent items-center justify-center">
                          <Check size={14} color="#FFF" />
                        </View>
                      )}
                    </View>
                    <Text className="text-pacer-white font-medium mt-2">
                      {pacer.pacerName}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            {selectedPacers.length > 0 && (
              <Text className="text-pacer-accent text-sm mt-3">
                {selectedPacers.length} pacer{selectedPacers.length > 1 ? 's' : ''} selected: {selectedPacers.map(p => p.pacerName).join(' + ')}
              </Text>
            )}
          </Animated.View>

          {/* Step 2: Vibe Selection (Required, single selection) */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(300)}
            className="px-6 mb-8"
          >
            <Text className="text-pacer-muted text-sm font-medium uppercase tracking-wide mb-3">
              Step 2: Choose Vibe
            </Text>
            <Text className="text-pacer-muted text-sm mb-3">
              One vibe for the entire run
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-6 px-6"
              style={{ flexGrow: 0 }}
            >
              {VIBES.map((v) => (
                <Pressable
                  key={v.type}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setVibe(v.type);
                  }}
                  className={cn(
                    'px-4 py-3 rounded-xl mr-3 border min-w-[100px]',
                    vibe === v.type
                      ? 'bg-pacer-accent/20 border-pacer-accent'
                      : 'bg-pacer-surface border-transparent'
                  )}
                >
                  <Text className="text-3xl text-center">{v.emoji}</Text>
                  <Text className="text-pacer-white font-medium text-sm mt-2 text-center">
                    {v.label}
                  </Text>
                  <Text className="text-pacer-muted text-xs mt-1 text-center">
                    {v.description}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Step 3: Voice Mode */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(300)}
            className="px-6 mb-6"
          >
            <Text className="text-pacer-muted text-sm font-medium uppercase tracking-wide mb-3">
              Step 3: Voice Source
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
          </Animated.View>

          {/* Step 4: Music Toggle */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(300)}
            className="px-6 mb-8"
          >
            <Text className="text-pacer-muted text-sm font-medium uppercase tracking-wide mb-3">
              Step 4: Music
            </Text>
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
                  Use Pacers' Spotify Music
                </Text>
                <Text className="text-pacer-muted text-sm">
                  AI-adjusted to match your vibe
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
          </Animated.View>

          {/* Step 5: Haptics */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(300)}
            className="px-6 mb-8"
          >
            <Text className="text-pacer-muted text-sm font-medium uppercase tracking-wide mb-3">
              Step 5: Haptics
            </Text>

            {/* Haptics On/Off + Device Mode */}
            <View className="bg-pacer-surface rounded-2xl overflow-hidden mb-3">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setHapticSettings({ enabled: !hapticSettings.enabled });
                }}
                className="flex-row items-center p-4 border-b border-pacer-border"
              >
                <View className="w-10 h-10 rounded-full bg-pacer-accent/30 items-center justify-center mr-3">
                  <Vibrate size={20} color="#FF6B35" />
                </View>
                <View className="flex-1">
                  <Text className="text-pacer-white font-medium">
                    Haptic Feedback
                  </Text>
                  <Text className="text-pacer-muted text-sm">
                    {hapticSettings.enabled
                      ? `${getHapticPatternDescription(vibe)} during hype`
                      : 'Disabled'}
                  </Text>
                </View>
                <View
                  className={cn(
                    'w-12 h-7 rounded-full p-1',
                    hapticSettings.enabled ? 'bg-pacer-accent' : 'bg-pacer-border'
                  )}
                >
                  <View
                    className={cn(
                      'w-5 h-5 rounded-full bg-white',
                      hapticSettings.enabled ? 'ml-auto' : ''
                    )}
                  />
                </View>
              </Pressable>

              {/* Device Mode Selector (only if enabled) */}
              {hapticSettings.enabled && (
                <View className="p-4 border-b border-pacer-border">
                  <Text className="text-pacer-muted text-xs mb-2">Device</Text>
                  <View className="flex-row">
                    {HAPTIC_DEVICE_MODES.filter(m => m.value !== 'off').map((mode) => (
                      <Pressable
                        key={mode.value}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setHapticSettings({ deviceMode: mode.value });
                        }}
                        className={cn(
                          'flex-1 flex-row items-center justify-center py-2 px-3 rounded-lg mr-2 last:mr-0',
                          hapticSettings.deviceMode === mode.value
                            ? 'bg-pacer-accent/20'
                            : 'bg-pacer-border/50'
                        )}
                      >
                        {mode.icon}
                        <Text
                          className={cn(
                            'text-sm font-medium ml-1',
                            hapticSettings.deviceMode === mode.value
                              ? 'text-pacer-accent'
                              : 'text-pacer-muted'
                          )}
                        >
                          {mode.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* Intensity Selector (only if enabled) */}
              {hapticSettings.enabled && (
                <View className="p-4 border-b border-pacer-border">
                  <Text className="text-pacer-muted text-xs mb-2">Intensity</Text>
                  <View className="flex-row">
                    {HAPTIC_INTENSITY_OPTIONS.map((option) => (
                      <Pressable
                        key={option.value}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setHapticSettings({ intensity: option.value });
                        }}
                        className={cn(
                          'flex-1 py-2 px-3 rounded-lg mr-2 last:mr-0 items-center',
                          hapticSettings.intensity === option.value
                            ? 'bg-pacer-accent/20'
                            : 'bg-pacer-border/50'
                        )}
                      >
                        <Text
                          className={cn(
                            'text-sm font-medium',
                            hapticSettings.intensity === option.value
                              ? 'text-pacer-accent'
                              : 'text-pacer-muted'
                          )}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* Beat Push Toggle (only if enabled) */}
              {hapticSettings.enabled && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setHapticSettings({ beatPushEnabled: !hapticSettings.beatPushEnabled });
                  }}
                  className="flex-row items-center justify-between p-4"
                >
                  <View className="flex-1">
                    <Text className="text-pacer-white font-medium">Beat Push</Text>
                    <Text className="text-pacer-muted text-xs">
                      Rhythm pulses after hype moment
                    </Text>
                  </View>
                  <View
                    className={cn(
                      'w-12 h-7 rounded-full p-1',
                      hapticSettings.beatPushEnabled ? 'bg-pacer-accent' : 'bg-pacer-border'
                    )}
                  >
                    <View
                      className={cn(
                        'w-5 h-5 rounded-full bg-white',
                        hapticSettings.beatPushEnabled ? 'ml-auto' : ''
                      )}
                    />
                  </View>
                </Pressable>
              )}
            </View>
          </Animated.View>

          {/* Run Preview */}
          {selectedPacers.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(600).duration(300)}
              className="px-6 mb-8"
            >
              <View className="bg-pacer-surface rounded-2xl p-4">
                <Text className="text-pacer-muted text-sm mb-2">Your run:</Text>
                <Text className="text-xl font-bold text-pacer-white">
                  {selectedPacers.map(p => p.pacerName).join(' + ')} — {vibeConfig?.label} Run
                </Text>
                <Text className="text-pacer-muted text-sm mt-1">
                  {vibeConfig?.emoji} {vibeConfig?.description}
                </Text>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Bottom CTAs */}
        <View className="px-6 pb-4 pt-2 border-t border-pacer-border">
          <Button
            onPress={handleStartRun}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canStartRun}
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
