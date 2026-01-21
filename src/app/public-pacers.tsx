import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import {
  ChevronLeft,
  Search,
  BadgeCheck,
  Users,
  TrendingUp,
  ChevronRight,
} from 'lucide-react-native';
import {
  PUBLIC_PACER_CATEGORIES,
  VIBES,
  MUSIC_STYLE_LABELS,
} from '@/lib/types';
import type { PublicPacer, PublicPacerCategory } from '@/lib/types';
import {
  getPublicPacersByCategory,
  getFeaturedPacers,
  searchPublicPacers,
} from '@/lib/public-pacers-data';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';

function PacerCard({ pacer, onPress, delay = 0 }: { pacer: PublicPacer; onPress: () => void; delay?: number }) {
  const vibeEmojis = pacer.vibesOffered
    .map(v => VIBES.find(vb => vb.type === v)?.emoji)
    .filter(Boolean)
    .join(' ');

  return (
    <Animated.View entering={FadeInRight.delay(delay).duration(300)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        className="bg-pacer-surface rounded-2xl p-4 mr-3 w-40"
      >
        <View className="items-center">
          {pacer.avatar ? (
            <Image
              source={{ uri: pacer.avatar }}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <View className="w-16 h-16 rounded-full bg-pacer-border items-center justify-center">
              <Users size={28} color="#6B7280" />
            </View>
          )}
          {pacer.isVerified && (
            <View className="absolute top-0 right-8">
              <BadgeCheck size={20} color="#3B82F6" fill="#3B82F6" />
            </View>
          )}
        </View>
        <Text className="text-pacer-white font-semibold text-center mt-3" numberOfLines={1}>
          {pacer.name}
        </Text>
        <Text className="text-pacer-muted text-xs text-center mt-1">
          {vibeEmojis}
        </Text>
        <View className="flex-row items-center justify-center mt-2">
          <TrendingUp size={12} color="#34D399" />
          <Text className="text-green-400 text-xs ml-1">
            {pacer.paceRecoveryScore}% effective
          </Text>
        </View>
        <Text className="text-pacer-muted text-xs text-center mt-1" numberOfLines={1}>
          {pacer.totalRunsPaced.toLocaleString()} runs
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function CategorySection({
  category,
  delay = 0,
}: {
  category: typeof PUBLIC_PACER_CATEGORIES[number];
  delay?: number;
}) {
  const router = useRouter();
  const pacers = getPublicPacersByCategory(category.id);

  if (pacers.length === 0) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(300)}
      className="mb-6"
    >
      <View className="flex-row items-center justify-between px-6 mb-3">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">{category.emoji}</Text>
          <View>
            <Text className="text-pacer-white font-semibold">{category.title}</Text>
            <Text className="text-pacer-muted text-xs">{category.subtitle}</Text>
          </View>
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/public-pacers-category?category=${category.id}`);
          }}
          className="flex-row items-center"
        >
          <Text className="text-pacer-accent text-sm mr-1">See all</Text>
          <ChevronRight size={16} color="#FF6B35" />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pl-6"
        style={{ flexGrow: 0 }}
      >
        {pacers.slice(0, 5).map((pacer, index) => (
          <PacerCard
            key={pacer.id}
            pacer={pacer}
            delay={delay + index * 50}
            onPress={() => router.push(`/public-pacer-profile?id=${pacer.id}`)}
          />
        ))}
        <View className="w-6" />
      </ScrollView>
    </Animated.View>
  );
}

export default function PublicPacersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const featuredPacers = getFeaturedPacers();
  const searchResults = searchQuery.length > 1 ? searchPublicPacers(searchQuery) : [];

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
            className="px-6 mb-4"
          >
            <Text className="text-2xl font-bold text-pacer-white">
              Discover Public Pacers
            </Text>
            <Text className="text-pacer-muted mt-1">
              Find inspiration from pacers around the world
            </Text>
          </Animated.View>

          {/* Search */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(300)}
            className="px-6 mb-6"
          >
            <View className="flex-row items-center bg-pacer-surface rounded-xl px-4 py-3">
              <Search size={20} color="#6B7280" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search pacers..."
                placeholderTextColor="#6B7280"
                className="flex-1 text-pacer-white ml-3"
                onFocus={() => setIsSearching(true)}
                onBlur={() => searchQuery.length === 0 && setIsSearching(false)}
              />
            </View>
          </Animated.View>

          {/* Search Results */}
          {searchQuery.length > 1 && (
            <Animated.View entering={FadeIn.duration(200)} className="px-6 mb-6">
              <Text className="text-pacer-muted text-sm mb-3">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </Text>
              {searchResults.map((pacer) => (
                <Pressable
                  key={pacer.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/public-pacer-profile?id=${pacer.id}`);
                  }}
                  className="flex-row items-center bg-pacer-surface rounded-xl p-4 mb-2"
                >
                  {pacer.avatar ? (
                    <Image
                      source={{ uri: pacer.avatar }}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <View className="w-12 h-12 rounded-full bg-pacer-border items-center justify-center">
                      <Users size={20} color="#6B7280" />
                    </View>
                  )}
                  <View className="flex-1 ml-3">
                    <View className="flex-row items-center">
                      <Text className="text-pacer-white font-medium">{pacer.name}</Text>
                      {pacer.isVerified && (
                        <BadgeCheck size={16} color="#3B82F6" fill="#3B82F6" className="ml-1" />
                      )}
                    </View>
                    <Text className="text-pacer-muted text-sm" numberOfLines={1}>
                      {pacer.bestUseCase}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#6B7280" />
                </Pressable>
              ))}
            </Animated.View>
          )}

          {/* Featured Pacers */}
          {!isSearching && searchQuery.length === 0 && (
            <>
              <Animated.View
                entering={FadeInDown.delay(200).duration(300)}
                className="mb-6"
              >
                <View className="flex-row items-center px-6 mb-3">
                  <Text className="text-2xl mr-2">⭐</Text>
                  <View>
                    <Text className="text-pacer-white font-semibold">Featured Pacers</Text>
                    <Text className="text-pacer-muted text-xs">Top verified pacers this week</Text>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="pl-6"
                  style={{ flexGrow: 0 }}
                >
                  {featuredPacers.map((pacer, index) => (
                    <PacerCard
                      key={pacer.id}
                      pacer={pacer}
                      delay={200 + index * 50}
                      onPress={() => router.push(`/public-pacer-profile?id=${pacer.id}`)}
                    />
                  ))}
                  <View className="w-6" />
                </ScrollView>
              </Animated.View>

              {/* Category Sections */}
              {PUBLIC_PACER_CATEGORIES.map((category, index) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  delay={300 + index * 100}
                />
              ))}

              {/* Privacy Notice */}
              <Animated.View
                entering={FadeInDown.delay(800).duration(300)}
                className="px-6 mb-8"
              >
                <View className="bg-pacer-surface/50 rounded-xl p-4">
                  <Text className="text-pacer-muted text-xs text-center">
                    Public Pacers share their energy, not personal info.{'\n'}
                    They can't see who uses their content.
                  </Text>
                </View>
              </Animated.View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
