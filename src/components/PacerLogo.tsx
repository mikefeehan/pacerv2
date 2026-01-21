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
import Svg, { Path, Rect } from 'react-native-svg';
import { cn } from '@/lib/cn';

interface PacerLogoProps {
  size?: number;
  animated?: boolean;
  intensity?: 'idle' | 'active' | 'hype';
  className?: string;
  showAccent?: boolean;
}

export function PacerLogo({
  size = 80,
  animated = false,
  intensity = 'idle',
  className,
  showAccent = true,
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

  const accentColor = '#FF6B35';
  const primaryColor = '#FAFAFA';

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
              backgroundColor: accentColor,
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
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 64 64">
          {/* Motion lines behind shoe */}
          <Path
            d="M6 28 L14 28"
            stroke={primaryColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.5}
          />
          <Path
            d="M4 32 L12 32"
            stroke={primaryColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.35}
          />

          {/* Running shoe - sleek silhouette matching reference */}
          <Path
            d="M16 34
               C18 30 22 26 28 24
               L36 22
               C40 21 44 22 48 24
               L54 28
               C58 30 60 34 58 36
               L56 38
               C54 40 50 40 46 40
               L20 40
               C16 40 14 38 16 34Z"
            fill={primaryColor}
          />
          {/* Shoe swoosh detail */}
          <Path
            d="M22 34 Q34 30 48 33"
            stroke="#0A0A0B"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />

          {/* Audio waveform underneath shoe - matching reference style */}
          <Rect x="12" y="46" width="2" height="6" rx="1" fill={primaryColor} opacity={0.7} />
          <Rect x="16" y="44" width="2" height="10" rx="1" fill={primaryColor} opacity={0.8} />
          <Rect x="20" y="46" width="2" height="6" rx="1" fill={primaryColor} />
          <Rect x="24" y="43" width="2" height="12" rx="1" fill={showAccent ? accentColor : primaryColor} />
          <Rect x="28" y="45" width="2" height="8" rx="1" fill={primaryColor} />
          <Rect x="32" y="42" width="2" height="14" rx="1" fill={showAccent ? accentColor : primaryColor} />
          <Rect x="36" y="45" width="2" height="8" rx="1" fill={primaryColor} />
          <Rect x="40" y="43" width="2" height="12" rx="1" fill={showAccent ? accentColor : primaryColor} />
          <Rect x="44" y="46" width="2" height="6" rx="1" fill={primaryColor} />
          <Rect x="48" y="44" width="2" height="10" rx="1" fill={primaryColor} opacity={0.8} />
          <Rect x="52" y="46" width="2" height="6" rx="1" fill={primaryColor} opacity={0.7} />
        </Svg>
      </View>
    </View>
  );
}
