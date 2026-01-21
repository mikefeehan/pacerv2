import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  Play,
  UserPlus,
  Settings,
  Check,
  AlertCircle,
  Clock,
  ChevronRight,
  User,
  Globe,
} from 'lucide-react-native';
import { PacerLogo } from '@/components/PacerLogo';
import { Button } from '@/components/Button';
import { useAuthStore, usePacerStore, useRunSettingsStore } from '@/lib/stores';
import { cn } from '@/lib/cn';
import { VIBES } from '@/lib/types';
import type { PacerRelationship, PacerStatus } from '@/lib/types';
import * as Haptics from 'expo-haptics';

const STATUS_CONFIG: Record<
  PacerStatus,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  ready: {
    label: 'Ready',
    color: 'text-pacer-success',
    bgColor: 'bg-pacer-success/20',
    icon: <Check size={14} color="#34D399" />,
  },
  needs_setup: {
    label: 'Needs Setup',
    color: 'text-pacer-accent',
    bgColor: 'bg-pacer-accent/20',
    icon: <AlertCircle size={14} color="#FF6B35" />,
  },
  invited: {
    label: 'Invited',
    color: 'text-pacer-muted',
    bgColor: 'bg-pacer-muted/20',
    icon: <Clock size={14} color="#6B7280" />,
  },
  accepted: {
    label: 'Accepted',
    color: 'text-pacer-success',
    bgColor: 'bg-pacer-success/20',
    icon: <Check size={14} color="#34D399" />,
  },
  blocked: {
    label: 'Blocked',
    color: 'text-red-500',
    bgColor: 'bg-red-500/20',
    icon: <AlertCircle size={14} color="#EF4444" />,
  },
};

function PacerCard({
  pacer,
  onPress,
  isSelected,
}: {
  pacer: PacerRelationship;
  onPress: () => void;
  isSelected: boolean;
}) {
  const status = STATUS_CONFIG[pacer.status];

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'bg-pacer-surface rounded-2xl p-4 mb-3 border-2',
        isSelected ? 'border-pacer-accent' : 'border-transparent'
      )}
    >
      <View className="flex-row items-center">
        {/* Avatar */}
        {pacer.pacerAvatar ? (
          <Image
            source={{ uri: pacer.pacerAvatar }}
            className="w-14 h-14 rounded-full"
          />
        ) : (
          <View className="w-14 h-14 rounded-full bg-pacer-border items-center justify-center">
            <User size={24} color="#6B7280" />
          </View>
        )}

        {/* Info */}
        <View className="flex-1 ml-4">
          <Text className="text-lg font-semibold text-pacer-white">
            {pacer.pacerName}
          </Text>
          <View className="flex-row items-center mt-1">
            <View className={cn('flex-row items-center px-2 py-1 rounded-full', status.bgColor)}>
              {status.icon}
              <Text className={cn('text-xs ml-1 font-medium', status.color)}>
                {status.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Selection indicator */}
        {isSelected && (
          <View className="w-6 h-6 rounded-full bg-pacer-accent items-center justify-center">
            <Check size={14} color="#FFF" />
          </View>
        )}
      </View>

      {/* Ready indicators */}
      {pacer.status === 'ready' && (
        <View className="flex-row mt-3 pt-3 border-t border-pacer-border">
          <View className="flex-row items-center mr-4">
            <View className={cn('w-2 h-2 rounded-full mr-2', pacer.voiceReady ? 'bg-pacer-success' : 'bg-pacer-muted')} />
            <Text className="text-pacer-muted text-sm">Voice</Text>
          </View>
          <View className="flex-row items-center">
            <View className={cn('w-2 h-2 rounded-full mr-2', pacer.musicReady ? 'bg-pacer-success' : 'bg-pacer-muted')} />
            <Text className="text-pacer-muted text-sm">Music</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const pacers = usePacerStore((s) => s.pacers);

  const selectedPacerIds = useRunSettingsStore((s) => s.selectedPacerIds);
  const togglePacer = useRunSettingsStore((s) => s.togglePacer);
  const vibe = useRunSettingsStore((s) => s.vibe);

  const readyPacers = pacers.filter((p) => p.status === 'ready');
  const otherPacers = pacers.filter((p) => p.status !== 'ready');

  const selectedPacers = pacers.filter((p) => selectedPacerIds.includes(p.pacerUserId));
  const canStartRun = selectedPacers.length > 0 && selectedPacers.every(p => p.status === 'ready');

  const vibeConfig = VIBES.find(v => v.type === vibe);

  const handleTogglePacer = (pacerUserId: string) => {
    const pacer = pacers.find(p => p.pacerUserId === pacerUserId);
    if (pacer?.status !== 'ready') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    togglePacer(pacerUserId);
  };

  const handleStartRun = () => {
    if (!canStartRun) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/pre-run');
  };

  return (
    <View className="flex-1 bg-pacer-bg">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          className="flex-row items-center justify-between px-6 py-4"
        >
          <View className="flex-row items-center">
            <PacerLogo size={40} />
            <Text className="text-xl font-bold text-pacer-white ml-3">PACER</Text>
          </View>
          <Pressable
            onPress={() => router.push('/settings')}
            className="p-2 rounded-full bg-pacer-surface active:bg-pacer-border"
          >
            <Settings size={22} color="#FAFAFA" />
          </Pressable>
        </Animated.View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Today's Run CTA */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            className="px-6 mb-8"
          >
            <View className="bg-gradient-to-br from-pacer-surface to-pacer-bg rounded-3xl p-6 border border-pacer-border">
              <Text className="text-pacer-muted text-sm font-medium uppercase tracking-wide mb-2">
                Today's Run
              </Text>

              {selectedPacers.length > 0 ? (
                <View className="mb-4">
                  <View className="flex-row items-center flex-wrap">
                    {selectedPacers.map((pacer, idx) => (
                      <View key={pacer.pacerUserId} className="flex-row items-center mr-2 mb-1">
                        {pacer.pacerAvatar ? (
                          <Image
                            source={{ uri: pacer.pacerAvatar }}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <View className="w-8 h-8 rounded-full bg-pacer-border items-center justify-center">
                            <User size={16} color="#6B7280" />
                          </View>
                        )}
                        {idx < selectedPacers.length - 1 && (
                          <Text className="text-pacer-muted mx-1">+</Text>
                        )}
                      </View>
                    ))}
                  </View>
                  <Text className="text-xl font-bold text-pacer-white mt-2">
                    {selectedPacers.map(p => p.pacerName).join(' + ')}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Text className="text-2xl mr-2">{vibeConfig?.emoji}</Text>
                    <Text className="text-pacer-accent font-medium">{vibeConfig?.label} Run</Text>
                  </View>
                </View>
              ) : (
                <Text className="text-xl font-semibold text-pacer-white mb-4">
                  Select pacers below
                </Text>
              )}

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

              {selectedPacers.length > 0 && (
                <Text className="text-pacer-muted text-xs text-center mt-3">
                  {selectedPacers.length} pacer{selectedPacers.length > 1 ? 's' : ''} selected
                </Text>
              )}
            </View>
          </Animated.View>

          {/* My Pacers */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            className="px-6"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-pacer-white">
                My Pacers
              </Text>
              <View className="flex-row items-center">
                <Pressable
                  onPress={() => router.push('/public-pacers')}
                  className="flex-row items-center active:opacity-70 mr-4"
                >
                  <Globe size={18} color="#3B82F6" />
                  <Text className="text-blue-400 font-medium ml-2">
                    Discover
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push('/invite-pacer')}
                  className="flex-row items-center active:opacity-70"
                >
                  <UserPlus size={18} color="#FF6B35" />
                  <Text className="text-pacer-accent font-medium ml-2">
                    Invite
                  </Text>
                </Pressable>
              </View>
            </View>

            <Text className="text-pacer-muted text-sm mb-3">
              Tap to select (multi-select supported)
            </Text>

            {/* Ready Pacers */}
            {readyPacers.map((pacer, index) => (
              <Animated.View key={pacer.pacerUserId} entering={FadeIn.delay(300 + index * 50)}>
                <PacerCard
                  pacer={pacer}
                  onPress={() => handleTogglePacer(pacer.pacerUserId)}
                  isSelected={selectedPacerIds.includes(pacer.pacerUserId)}
                />
              </Animated.View>
            ))}

            {/* Other Pacers */}
            {otherPacers.length > 0 && (
              <>
                <Text className="text-pacer-muted text-sm font-medium mt-4 mb-3">
                  Pending
                </Text>
                {otherPacers.map((pacer, index) => (
                  <Animated.View key={pacer.pacerUserId} entering={FadeIn.delay(400 + index * 50)}>
                    <PacerCard
                      pacer={pacer}
                      onPress={() => {}}
                      isSelected={false}
                    />
                  </Animated.View>
                ))}
              </>
            )}

            {/* Demo Mode Button */}
            <View className="mt-8 mb-8">
              <Pressable
                onPress={() => {
                  // Set first two ready pacers and navigate directly to run
                  if (readyPacers.length > 0) {
                    const demoIds = readyPacers.slice(0, 2).map(p => p.pacerUserId);
                    useRunSettingsStore.getState().setSelectedPacers(demoIds);
                  }
                  router.push('/pre-run');
                }}
                className="bg-pacer-surface/50 border border-dashed border-pacer-border rounded-xl p-4"
              >
                <Text className="text-pacer-muted text-center text-sm">
                  Demo Mode: Start a simulated multi-pacer run
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
