import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { X, Link, Copy, Check, Send, Users } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { usePacerStore } from '@/lib/stores';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

const INVITE_MESSAGE = `Join PACER so I can take your voice + music on my runs. Takes 2 minutes.

Download: https://pacer.app/invite`;

export default function InvitePacerScreen() {
  const router = useRouter();
  const addPacer = usePacerStore((s) => s.addPacer);

  const [inviteName, setInviteName] = useState('');
  const [copied, setCopied] = useState(false);
  const [invited, setInvited] = useState(false);

  const handleCopyLink = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync('https://pacer.app/invite/abc123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: INVITE_MESSAGE,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleSendInvite = () => {
    if (!inviteName.trim()) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Add mock invited pacer
    addPacer({
      runnerUserId: 'user_1',
      pacerUserId: `pacer_${Date.now()}`,
      pacerName: inviteName.trim(),
      status: 'invited',
      voiceReady: false,
      musicReady: false,
    });

    setInvited(true);
    setInviteName('');

    // Auto-close after showing success
    setTimeout(() => {
      router.back();
    }, 1500);
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
            Invite a Pacer
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="p-2 -mr-2 active:opacity-50"
          >
            <X size={24} color="#FAFAFA" />
          </Pressable>
        </Animated.View>

        <View className="flex-1 px-6 pt-6">
          {/* Hero */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(300)}
            className="items-center mb-8"
          >
            <View className="w-16 h-16 rounded-full bg-pacer-accent/20 items-center justify-center mb-4">
              <Users size={32} color="#FF6B35" />
            </View>
            <Text className="text-xl font-bold text-pacer-white text-center">
              Invite friends to pace you
            </Text>
            <Text className="text-pacer-muted text-center mt-2 px-4">
              They'll record voice memos and share their music so you can take them on runs with you.
            </Text>
          </Animated.View>

          {/* Invite by Name */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(300)}
            className="mb-8"
          >
            <Text className="text-pacer-muted text-sm font-medium mb-3">
              Invite by name
            </Text>
            <View className="flex-row items-center">
              <TextInput
                value={inviteName}
                onChangeText={setInviteName}
                placeholder="Enter friend's name"
                placeholderTextColor="#6B7280"
                className="flex-1 bg-pacer-surface rounded-xl px-4 py-4 text-pacer-white mr-3"
              />
              <Button
                onPress={handleSendInvite}
                variant="primary"
                disabled={!inviteName.trim()}
                icon={<Send size={18} color="#FFF" />}
              >
                Send
              </Button>
            </View>
          </Animated.View>

          {/* Invite Link */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(300)}
          >
            <Text className="text-pacer-muted text-sm font-medium mb-3">
              Or share invite link
            </Text>

            <View className="bg-pacer-surface rounded-xl p-4">
              <View className="flex-row items-center mb-4">
                <Link size={18} color="#FF6B35" />
                <Text className="text-pacer-white ml-2 flex-1" numberOfLines={1}>
                  pacer.app/invite/abc123
                </Text>
              </View>

              <View className="flex-row gap-x-3">
                <Pressable
                  onPress={handleCopyLink}
                  className="flex-1 flex-row items-center justify-center bg-pacer-border rounded-xl py-3 active:opacity-70"
                >
                  {copied ? (
                    <>
                      <Check size={18} color="#34D399" />
                      <Text className="text-pacer-success font-medium ml-2">
                        Copied!
                      </Text>
                    </>
                  ) : (
                    <>
                      <Copy size={18} color="#FAFAFA" />
                      <Text className="text-pacer-white font-medium ml-2">
                        Copy
                      </Text>
                    </>
                  )}
                </Pressable>

                <Pressable
                  onPress={handleShare}
                  className="flex-1 flex-row items-center justify-center bg-pacer-accent rounded-xl py-3 active:opacity-70"
                >
                  <Send size={18} color="#FFF" />
                  <Text className="text-white font-medium ml-2">
                    Share
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {/* Pre-written message */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(300)}
            className="mt-6"
          >
            <Text className="text-pacer-muted text-sm font-medium mb-3">
              Pre-written message
            </Text>
            <View className="bg-pacer-surface/50 rounded-xl p-4 border border-pacer-border">
              <Text className="text-pacer-muted text-sm leading-5">
                "{INVITE_MESSAGE}"
              </Text>
            </View>
          </Animated.View>

          {/* Success State */}
          {invited && (
            <Animated.View
              entering={FadeIn.duration(300)}
              className="absolute inset-0 items-center justify-center bg-pacer-bg/95"
            >
              <View className="w-20 h-20 rounded-full bg-pacer-success/20 items-center justify-center mb-4">
                <Check size={40} color="#34D399" />
              </View>
              <Text className="text-xl font-bold text-pacer-white">
                Invite Sent!
              </Text>
              <Text className="text-pacer-muted mt-2">
                We'll notify you when they join
              </Text>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
