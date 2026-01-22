import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { cn } from '@/lib/cn';
import { useVoiceMemo } from '@/lib/audio/useVoiceMemo';

function msToTime(ms: number | null) {
  if (!ms && ms !== 0) return '—';
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function VoiceMemoTest() {
  const vm = useVoiceMemo();
  const playDisabled = !vm.uri || vm.isRecording;

  return (
    <View className="gap-4 p-5">
      <Text className="text-xl font-semibold text-pacer-white">Voice Memo Test</Text>

      <View className="gap-1">
        <Text className="text-pacer-muted">Ready: {String(vm.isReady)}</Text>
        <Text className="text-pacer-muted">Recording: {String(vm.isRecording)}</Text>
        <Text className="text-pacer-muted">Playing: {String(vm.isPlaying)}</Text>
        <Text className="text-pacer-muted">Duration: {msToTime(vm.durationMs)}</Text>
        <Text className="text-pacer-muted" numberOfLines={2}>
          URI: {vm.uri ?? '—'}
        </Text>
      </View>

      {vm.error ? (
        <Text className="text-red-400">Error: {vm.error}</Text>
      ) : null}

      <Pressable
        onPress={vm.isRecording ? vm.stopRecording : vm.startRecording}
        className="items-center rounded-xl bg-black px-4 py-3"
      >
        <Text className="font-semibold text-white">
          {vm.isRecording ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => void vm.play()}
        disabled={playDisabled}
        className={cn(
          'items-center rounded-xl px-4 py-3',
          playDisabled ? 'bg-neutral-600' : 'bg-black'
        )}
      >
        <Text className="font-semibold text-white">Play</Text>
      </Pressable>

      <Pressable onPress={() => void vm.reset()} className="items-center rounded-xl bg-neutral-800 px-4 py-3">
        <Text className="font-semibold text-white">Reset</Text>
      </Pressable>
    </View>
  );
}
