import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  ChevronLeft,
  BadgeCheck,
  Users,
  TrendingUp,
  ChevronRight,
} from 'lucide-react-native';
import { PUBLIC_PACER_CATEGORIES, VIBES } from '@/lib/types';
import type { PublicPacer, PublicPacerCategory } from '@/lib/types';
import { getPublicPacersByCategory } from '@/lib/public-pacers-data';
import * as Haptics from 'expo-haptics';

function PacerListItem({
  pacer,
  onPress,
  delay = 0,
}: {
  pacer: PublicPacer;
  onPress: () => void;
  delay?: number;
}) {
  const vibeEmojis = pacer.vibesOffered
    .map(v => VIBES.find(vb => vb.type === v)?.emoji)
    .filter(Boolean)
    .join(' ');

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(300)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        className="flex-row items-center bg-pacer-surface rounded-2xl p-4 mb-3"
      >
        <View className="relative">
          {pacer.avatar ? (
            <Image
              source={{ uri: pacer.avatar }}
              className="w-14 h-14 rounded-full"
            />
          ) : (
            <View className="w-14 h-14 rounded-full bg-pacer-border items-center justify-center">
              <Users size={24} color="#6B7280" />
            </View>
          )}
          {pacer.isVerified && (
            <View className="absolute -bottom-1 -right-1 bg-pacer-surface rounded-full">
              <BadgeCheck size={18} color="#3B82F6" fill="#3B82F6" />
            </View>
          )}
        </View>

        <View className="flex-1 ml-4">
          <View className="flex-row items-center">
            <Text className="text-pacer-white font-semibold">{pacer.name}</Text>
            <Text className="text-sm ml-2">{vibeEmojis}</Text>
          </View>
          <Text className="text-pacer-muted text-sm mt-0.5" numberOfLines={1}>
            {pacer.bestUseCase}
          </Text>
          <View className="flex-row items-center mt-1">
            <TrendingUp size={12} color="#34D399" />
            <Text className="text-green-400 text-xs ml-1">
              {pacer.paceRecoveryScore}% effective
            </Text>
            <Text className="text-pacer-muted text-xs ml-3">
              {pacer.totalRunsPaced.toLocaleString()} runs
            </Text>
          </View>
        </View>

        <ChevronRight size={20} color="#6B7280" />
      </Pressable>
    </Animated.View>
  );
}

export default function PublicPacersCategoryScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: PublicPacerCategory }>();

  const categoryConfig = PUBLIC_PACER_CATEGORIES.find(c => c.id === category);
  const pacers = category ? getPublicPacersByCategory(category) : [];

  if (!categoryConfig) {
    return (
      <View className="flex-1 bg-pacer-bg items-center justify-center">
        <Text className="text-pacer-muted">Category not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-pacer-accent">Go back</Text>
        </Pressable>
      </View>
    );
  }

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
            <View className="flex-row items-center">
              <Text className="text-4xl mr-3">{categoryConfig.emoji}</Text>
              <View>
                <Text className="text-2xl font-bold text-pacer-white">
                  {categoryConfig.title}
                </Text>
                <Text className="text-pacer-muted">
                  {categoryConfig.subtitle}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Pacers List */}
          <View className="px-6">
            {pacers.map((pacer, index) => (
              <PacerListItem
                key={pacer.id}
                pacer={pacer}
                delay={100 + index * 50}
                onPress={() => router.push(`/public-pacer-profile?id=${pacer.id}`)}
              />
            ))}
          </View>

          {/* Empty State */}
          {pacers.length === 0 && (
            <View className="items-center py-12">
              <Text className="text-pacer-muted">No pacers in this category yet</Text>
            </View>
          )}

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
