import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  X,
  Volume2,
  Zap,
  Activity,
  Music,
  Sparkles,
  ChevronRight,
  LogOut,
  Check,
  Play,
} from 'lucide-react-native';
import { useAuthStore, useAppSettingsStore, usePacerStore, useRunSettingsStore } from '@/lib/stores';
import { cn } from '@/lib/cn';
import { getStravaAutoUpload, setStravaAutoUpload } from '@/lib/app-settings';
import { testSpeech, isSpeechAvailable } from '@/lib/audio/voice';
import * as Haptics from 'expo-haptics';
import type { IntensityLevel } from '@/lib/types';

type PlaybackMode = 'duck_voice' | 'queue_injection' | 'voice_only';
type DuckAmount = 'low' | 'medium' | 'high';

const PLAYBACK_MODES: { value: PlaybackMode; label: string; desc: string }[] = [
  { value: 'duck_voice', label: 'Duck + Voice', desc: 'Lower music, play voice, resume' },
  { value: 'queue_injection', label: 'Queue Injection', desc: 'Add tracks to Spotify queue' },
  { value: 'voice_only', label: 'Voice Only', desc: 'Only play voice clips' },
];

const DUCK_AMOUNTS: { value: DuckAmount; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const HYPE_FREQUENCIES: { value: IntensityLevel; label: string; desc: string }[] = [
  { value: 'low', label: 'Low', desc: '4 min cooldown' },
  { value: 'medium', label: 'Medium', desc: '3 min cooldown' },
  { value: 'high', label: 'High', desc: '2 min cooldown' },
];

export default function SettingsScreen() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const myPacerProfile = usePacerStore((s) => s.myPacerProfile);
  const setPacers = usePacerStore((s) => s.setPacers);
  const setMyPacerProfile = usePacerStore((s) => s.setMyPacerProfile);
  const resetRunSettings = useRunSettingsStore((s) => s.resetSettings);

  const playbackMode = useAppSettingsStore((s) => s.playbackMode);
  const duckAmount = useAppSettingsStore((s) => s.duckAmount);
  const hypeFrequency = useAppSettingsStore((s) => s.hypeFrequency);
  const showStravaPostPreview = useAppSettingsStore((s) => s.showStravaPostPreview);

  const setPlaybackMode = useAppSettingsStore((s) => s.setPlaybackMode);
  const setDuckAmount = useAppSettingsStore((s) => s.setDuckAmount);
  const setHypeFrequency = useAppSettingsStore((s) => s.setHypeFrequency);
  const setShowStravaPostPreview = useAppSettingsStore((s) => s.setShowStravaPostPreview);

  const [stravaAutoUpload, setStravaAutoUploadLocal] = useState<boolean>(true);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Load auto-upload setting on mount
  useEffect(() => {
    getStravaAutoUpload().then(setStravaAutoUploadLocal);
  }, []);

  const handleTestVoice = async () => {
    setIsTestingVoice(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const available = await isSpeechAvailable();
      if (!available) {
        Alert.alert('Voice Unavailable', 'No speech voices available on this device.');
        setIsTestingVoice(false);
        return;
      }

      const success = await testSpeech();
      if (!success) {
        Alert.alert('Voice Test Failed', 'Could not play voice. Check your device volume.');
      }
    } catch (e) {
      console.error('Voice test error:', e);
      Alert.alert('Error', 'Failed to test voice. Please try again.');
    } finally {
      setIsTestingVoice(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? This will reset all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            // Clear all stores
            logout();
            setPacers([]);
            setMyPacerProfile(null);
            resetRunSettings();
            router.replace('/welcome');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-pacer-bg">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(300)}
          className="flex-row items-center justify-between px-4 py-3 border-b border-pacer-border"
        >
          <View className="w-10" />
          <Text className="text-lg font-semibold text-pacer-white">
            Settings
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="p-2 -mr-2 active:opacity-50"
          >
            <X size={24} color="#FAFAFA" />
          </Pressable>
        </Animated.View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Audio Settings */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(300)}
            className="px-6 pt-6"
          >
            <View className="flex-row items-center mb-4">
              <Volume2 size={18} color="#FF6B35" />
              <Text className="text-lg font-semibold text-pacer-white ml-2">
                Audio
              </Text>
            </View>

            {/* Playback Mode */}
            <View className="mb-6">
              <Text className="text-pacer-muted text-sm font-medium mb-3">
                Playback Mode
              </Text>
              <View className="bg-pacer-surface rounded-xl overflow-hidden">
                {PLAYBACK_MODES.map((mode, index) => (
                  <Pressable
                    key={mode.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setPlaybackMode(mode.value);
                    }}
                    className={cn(
                      'flex-row items-center p-4',
                      index < PLAYBACK_MODES.length - 1 && 'border-b border-pacer-border'
                    )}
                  >
                    <View className="flex-1">
                      <Text className="text-pacer-white font-medium">
                        {mode.label}
                      </Text>
                      <Text className="text-pacer-muted text-sm">
                        {mode.desc}
                      </Text>
                    </View>
                    <View
                      className={cn(
                        'w-6 h-6 rounded-full border-2 items-center justify-center',
                        playbackMode === mode.value
                          ? 'bg-pacer-accent border-pacer-accent'
                          : 'border-pacer-border'
                      )}
                    >
                      {playbackMode === mode.value && (
                        <Check size={14} color="#FFF" />
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Duck Amount */}
            {playbackMode === 'duck_voice' && (
              <View className="mb-6">
                <Text className="text-pacer-muted text-sm font-medium mb-3">
                  Duck Amount
                </Text>
                <View className="flex-row bg-pacer-surface rounded-xl p-1">
                  {DUCK_AMOUNTS.map((amount) => (
                    <Pressable
                      key={amount.value}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setDuckAmount(amount.value);
                      }}
                      className={cn(
                        'flex-1 py-3 rounded-lg',
                        duckAmount === amount.value ? 'bg-pacer-accent' : ''
                      )}
                    >
                      <Text
                        className={cn(
                          'text-center font-medium',
                          duckAmount === amount.value ? 'text-white' : 'text-pacer-muted'
                        )}
                      >
                        {amount.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Test Voice Button */}
            <Pressable
              onPress={handleTestVoice}
              disabled={isTestingVoice}
              className={cn(
                'bg-pacer-surface rounded-xl p-4 flex-row items-center justify-center',
                isTestingVoice && 'opacity-60'
              )}
            >
              <Play size={18} color="#FF6B35" />
              <Text className="text-pacer-accent font-medium ml-2">
                {isTestingVoice ? 'Playing...' : 'Test Voice'}
              </Text>
            </Pressable>
            <Text className="text-pacer-muted text-xs text-center mt-2">
              Make sure your volume is up
            </Text>
          </Animated.View>

          {/* Hype Settings */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(300)}
            className="px-6 pt-4"
          >
            <View className="flex-row items-center mb-4">
              <Zap size={18} color="#FF6B35" />
              <Text className="text-lg font-semibold text-pacer-white ml-2">
                Hype Frequency
              </Text>
            </View>

            <View className="bg-pacer-surface rounded-xl overflow-hidden">
              {HYPE_FREQUENCIES.map((freq, index) => (
                <Pressable
                  key={freq.value}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setHypeFrequency(freq.value);
                  }}
                  className={cn(
                    'flex-row items-center p-4',
                    index < HYPE_FREQUENCIES.length - 1 && 'border-b border-pacer-border'
                  )}
                >
                  <View className="flex-1">
                    <Text className="text-pacer-white font-medium">
                      {freq.label}
                    </Text>
                    <Text className="text-pacer-muted text-sm">
                      {freq.desc}
                    </Text>
                  </View>
                  <View
                    className={cn(
                      'w-6 h-6 rounded-full border-2 items-center justify-center',
                      hypeFrequency === freq.value
                        ? 'bg-pacer-accent border-pacer-accent'
                        : 'border-pacer-border'
                    )}
                  >
                    {hypeFrequency === freq.value && (
                      <Check size={14} color="#FFF" />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Strava Settings */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(300)}
            className="px-6 pt-8"
          >
            <View className="flex-row items-center mb-4">
              <Activity size={18} color="#FF6B35" />
              <Text className="text-lg font-semibold text-pacer-white ml-2">
                Strava
              </Text>
            </View>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowStravaPostPreview(!showStravaPostPreview);
              }}
              className="bg-pacer-surface rounded-xl p-4 flex-row items-center"
            >
              <View className="flex-1">
                <Text className="text-pacer-white font-medium">
                  Show post preview
                </Text>
                <Text className="text-pacer-muted text-sm">
                  Preview before posting to Strava
                </Text>
              </View>
              <View
                className={cn(
                  'w-12 h-7 rounded-full p-1',
                  showStravaPostPreview ? 'bg-pacer-accent' : 'bg-pacer-border'
                )}
              >
                <View
                  className={cn(
                    'w-5 h-5 rounded-full bg-white',
                    showStravaPostPreview ? 'ml-auto' : ''
                  )}
                />
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const newValue = !stravaAutoUpload;
                setStravaAutoUploadLocal(newValue);
                setStravaAutoUpload(newValue);
              }}
              className="bg-pacer-surface rounded-xl p-4 mt-3 flex-row items-center"
            >
              <View className="flex-1">
                <Text className="text-pacer-white font-medium">
                  Auto-upload runs
                </Text>
                <Text className="text-pacer-muted text-sm">
                  Automatically upload to Strava after run ends
                </Text>
              </View>
              <View
                className={cn(
                  'w-12 h-7 rounded-full p-1',
                  stravaAutoUpload ? 'bg-pacer-accent' : 'bg-pacer-border'
                )}
              >
                <View
                  className={cn(
                    'w-5 h-5 rounded-full bg-white',
                    stravaAutoUpload ? 'ml-auto' : ''
                  )}
                />
              </View>
            </Pressable>

            {/* Connected Account */}
            <View className="bg-pacer-surface rounded-xl p-4 mt-3 flex-row items-center">
              <View className="w-10 h-10 rounded-lg bg-[#FC4C02] items-center justify-center mr-3">
                <Activity size={20} color="#FFF" />
              </View>
              <View className="flex-1">
                <Text className="text-pacer-white font-medium">
                  Strava Connected
                </Text>
                <Text className="text-pacer-muted text-sm">
                  {user?.stravaUserId || 'Connected'}
                </Text>
              </View>
              <View className="w-3 h-3 rounded-full bg-pacer-success" />
            </View>
          </Animated.View>

          {/* My Pacer Profile */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(300)}
            className="px-6 pt-8"
          >
            <View className="flex-row items-center mb-4">
              <Sparkles size={18} color="#FF6B35" />
              <Text className="text-lg font-semibold text-pacer-white ml-2">
                My Pacer Profile
              </Text>
            </View>

            <Pressable className="bg-pacer-surface rounded-xl p-4 flex-row items-center">
              <View className="flex-1">
                <Text className="text-pacer-white font-medium">
                  AI Voice
                </Text>
                <Text className="text-pacer-muted text-sm">
                  {myPacerProfile?.aiVoiceEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </Pressable>

            <Pressable className="bg-pacer-surface rounded-xl p-4 mt-3 flex-row items-center">
              <View className="flex-1">
                <Text className="text-pacer-white font-medium">
                  Voice Memos
                </Text>
                <Text className="text-pacer-muted text-sm">
                  {myPacerProfile?.voiceMemos.length || 0} recorded
                </Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </Pressable>

            <Pressable className="bg-pacer-surface rounded-xl p-4 mt-3 flex-row items-center">
              <View className="flex-1">
                <Text className="text-pacer-white font-medium">
                  Music
                </Text>
                <Text className="text-pacer-muted text-sm">
                  {myPacerProfile?.spotifyConnected ? 'Spotify connected' : 'Not connected'}
                </Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </Pressable>
          </Animated.View>

          {/* Sign Out */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(300)}
            className="px-6 py-8"
          >
            <Pressable
              onPress={handleLogout}
              className="bg-red-500/10 rounded-xl p-4 flex-row items-center justify-center"
            >
              <LogOut size={18} color="#EF4444" />
              <Text className="text-red-400 font-medium ml-2">
                Sign Out
              </Text>
            </Pressable>
          </Animated.View>

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
