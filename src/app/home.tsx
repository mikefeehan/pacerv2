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
} from 'lucide-react-native';
import { PacerLogo } from '@/components/PacerLogo';
import { Button } from '@/components/Button';
import { useAuthStore, usePacerStore, useRunSettingsStore } from '@/lib/stores';
import { cn } from '@/lib/cn';
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

        {/* Chevron */}
        <ChevronRight size={20} color="#6B7280" />
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
  const user = useAuthStore((s) => s.user);
  const pacers = usePacerStore((s) => s.pacers);
  const selectedPacerId = useRunSettingsStore((s) => s.selectedPacerId);
  const setSelectedPacer = useRunSettingsStore((s) => s.setSelectedPacer);

  const readyPacers = pacers.filter((p) => p.status === 'ready');
  const otherPacers = pacers.filter((p) => p.status !== 'ready');

  const selectedPacer = pacers.find((p) => p.pacerUserId === selectedPacerId);
  const canStartRun = selectedPacer?.status === 'ready';

  const handleSelectPacer = (pacerUserId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPacer(pacerUserId);
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
          {/* Today's Pacer CTA */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            className="px-6 mb-8"
          >
            <View className="bg-gradient-to-br from-pacer-surface to-pacer-bg rounded-3xl p-6 border border-pacer-border">
              <Text className="text-pacer-muted text-sm font-medium uppercase tracking-wide mb-2">
                Today's Pacer
              </Text>

              {selectedPacer ? (
                <View className="flex-row items-center mb-4">
                  {selectedPacer.pacerAvatar ? (
                    <Image
                      source={{ uri: selectedPacer.pacerAvatar }}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <View className="w-16 h-16 rounded-full bg-pacer-border items-center justify-center">
                      <User size={28} color="#6B7280" />
                    </View>
                  )}
                  <View className="ml-4">
                    <Text className="text-2xl font-bold text-pacer-white">
                      {selectedPacer.pacerName}
                    </Text>
                    <Text className="text-pacer-muted">
                      {selectedPacer.status === 'ready' ? 'Ready to pace you' : 'Not ready yet'}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text className="text-xl font-semibold text-pacer-white mb-4">
                  Select a pacer below
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

            {/* Ready Pacers */}
            {readyPacers.map((pacer, index) => (
              <Animated.View key={pacer.pacerUserId} entering={FadeIn.delay(300 + index * 50)}>
                <PacerCard
                  pacer={pacer}
                  onPress={() => handleSelectPacer(pacer.pacerUserId)}
                  isSelected={selectedPacerId === pacer.pacerUserId}
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
                      onPress={() => handleSelectPacer(pacer.pacerUserId)}
                      isSelected={selectedPacerId === pacer.pacerUserId}
                    />
                  </Animated.View>
                ))}
              </>
            )}

            {/* Demo Mode Button */}
            <View className="mt-8 mb-8">
              <Pressable
                onPress={() => {
                  // Set first ready pacer and navigate directly to run
                  if (readyPacers.length > 0) {
                    setSelectedPacer(readyPacers[0].pacerUserId);
                  }
                  router.push('/pre-run');
                }}
                className="bg-pacer-surface/50 border border-dashed border-pacer-border rounded-xl p-4"
              >
                <Text className="text-pacer-muted text-center text-sm">
                  🧪 Demo Mode: Start a simulated run
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
