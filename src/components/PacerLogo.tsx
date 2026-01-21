import React from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { cn } from '@/lib/cn';

interface PacerLogoProps {
  size?: number;
  animated?: boolean;
  intensity?: 'idle' | 'active' | 'hype';
  className?: string;
}

export function PacerLogo({
  size = 80,
  animated = false,
  intensity = 'idle',
  className,
}: PacerLogoProps) {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  React.useEffect(() => {
    if (animated) {
      const duration = intensity === 'hype' ? 400 : intensity === 'active' ? 800 : 1500;
      const scale = intensity === 'hype' ? 1.3 : intensity === 'active' ? 1.15 : 1.08;

      pulseScale.value = withRepeat(
        withSequence(
          withTiming(scale, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.2, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.6, { duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [animated, intensity, pulseScale, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View className={cn('items-center justify-center', className)}>
      {/* Pulse ring behind logo */}
      {animated && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: size * 1.4,
              height: size * 1.4,
              borderRadius: size * 0.7,
              backgroundColor: '#FF6B35',
            },
            pulseStyle,
          ]}
        />
      )}

      {/* Logo container */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.25,
          backgroundColor: '#141416',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: '#2A2A2E',
        }}
      >
        <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 48 48">
          {/* Running shoe silhouette */}
          <Path
            d="M8 32 L12 28 L16 30 L20 26 L26 28 L32 24 L38 26 L42 22 L44 24 L44 32 L40 36 L8 36 Z"
            fill="#FAFAFA"
            strokeWidth={0}
          />
          {/* Audio wave accent */}
          <Path
            d="M14 18 L14 22 M20 14 L20 22 M26 16 L26 22 M32 12 L32 22"
            stroke="#FF6B35"
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* Small pulse dot */}
          <Circle cx="38" cy="16" r="3" fill="#FF6B35" />
        </Svg>
      </View>
    </View>
  );
}
