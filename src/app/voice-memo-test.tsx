import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import VoiceMemoTest from '@/components/VoiceMemoTest';

export default function VoiceMemoTestScreen() {
  return (
    <SafeAreaView className="flex-1 bg-pacer-bg">
      <Stack.Screen
        options={{
          title: 'Voice Memo Test',
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0B' },
          headerTintColor: '#FAFAFA',
        }}
      />
      <VoiceMemoTest />
    </SafeAreaView>
  );
}
