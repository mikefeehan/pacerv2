import React from 'react';
import { View, Text, ScrollView, Pressable, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  ChevronLeft,
  BadgeCheck,
  Users,
  TrendingUp,
  Music,
  Mic,
  Sparkles,
  UserPlus,
  Shield,
} from 'lucide-react-native';
import { Button } from '@/components/Button';
import { VIBES, MUSIC_STYLE_LABELS } from '@/lib/types';
import type { PublicPacer } from '@/lib/types';
import { getPublicPacerById } from '@/lib/public-pacers-data';
import { usePacerStore } from '@/lib/stores';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';

export default function PublicPacerProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pacer = id ? getPublicPacerById(id) : undefined;

  const pacers = usePacerStore((s) => s.pacers);
  const addPacer = usePacerStore((s) => s.addPacer);

  const isAlreadyAdded = pacers.some(p => p.pacerUserId === id);

  if (!pacer) {
    return (
      <View className="flex-1 bg-pacer-bg items-center justify-center">
        <Text className="text-pacer-muted">Pacer not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-pacer-accent">Go back</Text>
        </Pressable>
      </View>
    );
  }

  const handleAddPacer = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Add as a pacer relationship
    addPacer({
      runnerUserId: 'user_1',
      pacerUserId: pacer.id,
      status: 'ready',
      pacerName: pacer.name,
      pacerAvatar: pacer.avatar,
      voiceReady: true,
      musicReady: true,
    });

    Alert.alert(
      'Pacer Added!',
      `${pacer.name} is now in your Pacer lineup.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const vibeConfigs = pacer.vibesOffered.map(v => VIBES.find(vb => vb.type === v)).filter(Boolean);
  const musicStyleLabels = pacer.musicStyles.map(m => MUSIC_STYLE_LABELS[m]);

  return (
    <View className="flex-1 bg-pacer-bg">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
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
          {/* Profile Header */}
          <Animated.View
            entering={FadeIn.duration(300)}
            className="items-center px-6 pb-6"
          >
            <View className="relative">
              {pacer.avatar ? (
                <Image
                  source={{ uri: pacer.avatar }}
                  className="w-28 h-28 rounded-full"
                />
              ) : (
                <View className="w-28 h-28 rounded-full bg-pacer-surface items-center justify-center">
                  <Users size={48} color="#6B7280" />
                </View>
              )}
              {pacer.isVerified && (
                <View className="absolute bottom-0 right-0 bg-pacer-bg rounded-full p-1">
                  <BadgeCheck size={28} color="#3B82F6" fill="#3B82F6" />
                </View>
              )}
            </View>

            <Text className="text-2xl font-bold text-pacer-white mt-4">
              {pacer.name}
            </Text>

            {pacer.isVerified && (
              <View className="flex-row items-center mt-1">
                <BadgeCheck size={16} color="#3B82F6" />
                <Text className="text-blue-400 text-sm ml-1">Verified Pacer</Text>
              </View>
            )}

            {pacer.bio && (
              <Text className="text-pacer-muted text-center mt-3 px-4">
                {pacer.bio}
              </Text>
            )}
          </Animated.View>

          {/* Stats Row */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(300)}
            className="flex-row px-6 mb-6"
          >
            <View className="flex-1 bg-pacer-surface rounded-xl p-4 mr-2 items-center">
              <TrendingUp size={20} color="#34D399" />
              <Text className="text-2xl font-bold text-pacer-white mt-2">
                {pacer.paceRecoveryScore}%
              </Text>
              <Text className="text-pacer-muted text-xs mt-1">Effectiveness</Text>
            </View>
            <View className="flex-1 bg-pacer-surface rounded-xl p-4 ml-2 items-center">
              <Users size={20} color="#FF6B35" />
              <Text className="text-2xl font-bold text-pacer-white mt-2">
                {pacer.totalRunsPaced >= 1000
                  ? `${(pacer.totalRunsPaced / 1000).toFixed(1)}K`
                  : pacer.totalRunsPaced}
              </Text>
              <Text className="text-pacer-muted text-xs mt-1">Runs Paced</Text>
            </View>
          </Animated.View>

          {/* Best Use Case */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(300)}
            className="px-6 mb-6"
          >
            <View className="bg-pacer-accent/10 border border-pacer-accent/30 rounded-xl p-4">
              <Text className="text-pacer-accent text-sm font-medium mb-1">
                Best for
              </Text>
              <Text className="text-pacer-white text-lg">
                {pacer.bestUseCase}
              </Text>
            </View>
          </Animated.View>

          {/* Vibes Offered */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(300)}
            className="px-6 mb-6"
          >
            <Text className="text-pacer-muted text-sm font-medium uppercase tracking-wide mb-3">
              Vibes Offered
            </Text>
            <View className="flex-row flex-wrap">
              {vibeConfigs.map((vibe) => vibe && (
                <View
                  key={vibe.type}
                  className="bg-pacer-surface rounded-xl px-4 py-3 mr-2 mb-2"
                >
                  <Text className="text-2xl text-center">{vibe.emoji}</Text>
                  <Text className="text-pacer-white font-medium text-sm mt-1">
                    {vibe.label}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Music Style */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(300)}
            className="px-6 mb-6"
          >
            <View className="flex-row items-center mb-3">
              <Music size={16} color="#FF6B35" />
              <Text className="text-pacer-muted text-sm font-medium uppercase tracking-wide ml-2">
                Music Style
              </Text>
            </View>
            <View className="flex-row flex-wrap">
              {musicStyleLabels.map((style) => (
                <View
                  key={style}
                  className="bg-pacer-surface rounded-full px-4 py-2 mr-2 mb-2"
                >
                  <Text className="text-pacer-white text-sm">{style}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Voice Options */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(300)}
            className="px-6 mb-6"
          >
            <Text className="text-pacer-muted text-sm font-medium uppercase tracking-wide mb-3">
              Voice Options
            </Text>
            <View className="bg-pacer-surface rounded-xl p-4">
              <View className="flex-row items-center mb-3">
                <Mic size={18} color="#FF6B35" />
                <Text className="text-pacer-white ml-3">Real Voice Memos</Text>
                <View className="ml-auto bg-green-500/20 px-2 py-1 rounded">
                  <Text className="text-green-400 text-xs">Available</Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <Sparkles size={18} color="#FF6B35" />
                <Text className="text-pacer-white ml-3">AI Voice</Text>
                <View className={cn(
                  'ml-auto px-2 py-1 rounded',
                  pacer.aiVoiceEnabled ? 'bg-green-500/20' : 'bg-pacer-border'
                )}>
                  <Text className={pacer.aiVoiceEnabled ? 'text-green-400 text-xs' : 'text-pacer-muted text-xs'}>
                    {pacer.aiVoiceEnabled ? 'Available' : 'Disabled'}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Privacy Notice */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(300)}
            className="px-6 mb-6"
          >
            <View className="flex-row items-start bg-pacer-surface/50 rounded-xl p-4">
              <Shield size={20} color="#6B7280" className="mt-0.5" />
              <View className="flex-1 ml-3">
                <Text className="text-pacer-muted text-sm">
                  Privacy Protected
                </Text>
                <Text className="text-pacer-muted text-xs mt-1">
                  {pacer.name} shares their energy as a Public Pacer. They cannot see
                  who uses their content or receive messages from runners.
                </Text>
              </View>
            </View>
          </Animated.View>

          <View className="h-24" />
        </ScrollView>

        {/* Bottom CTA */}
        <Animated.View
          entering={FadeInDown.delay(700).duration(300)}
          className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-4 bg-gradient-to-t from-pacer-bg via-pacer-bg"
        >
          <SafeAreaView edges={['bottom']}>
            {isAlreadyAdded ? (
              <View className="bg-pacer-surface rounded-xl py-4 items-center">
                <Text className="text-pacer-muted font-medium">
                  Already in your Pacer lineup
                </Text>
              </View>
            ) : (
              <Button
                onPress={handleAddPacer}
                variant="primary"
                size="lg"
                fullWidth
                icon={<UserPlus size={20} color="#FFF" />}
              >
                Add as PACER
              </Button>
            )}
          </SafeAreaView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
