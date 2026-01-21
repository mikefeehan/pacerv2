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
          {/* Running shoe - sleek modern silhouette */}
          <Path
            d="M8 42
               C8 42 10 38 14 36
               L18 35
               C20 34 22 33 24 33
               L28 33
               C30 32 34 30 38 30
               L44 30
               C48 30 52 32 54 34
               L56 36
               C58 38 58 40 56 42
               L54 44
               C52 46 48 47 44 47
               L20 47
               C14 47 10 46 8 44
               L8 42Z"
            fill={primaryColor}
          />
          {/* Shoe detail - swoosh line */}
          <Path
            d="M16 40 Q28 36 42 38"
            stroke="#0A0A0B"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          {/* Motion lines trailing behind */}
          <Path
            d="M4 38 L10 38"
            stroke={primaryColor}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.6}
          />
          <Path
            d="M2 42 L8 42"
            stroke={primaryColor}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.4}
          />

          {/* Audio waveform above shoe */}
          <Rect x="20" y="18" width="2.5" height="8" rx="1" fill={primaryColor} />
          <Rect x="26" y="14" width="2.5" height="12" rx="1" fill={showAccent ? accentColor : primaryColor} />
          <Rect x="32" y="16" width="2.5" height="10" rx="1" fill={primaryColor} />
          <Rect x="38" y="12" width="2.5" height="14" rx="1" fill={showAccent ? accentColor : primaryColor} />
          <Rect x="44" y="17" width="2.5" height="9" rx="1" fill={primaryColor} />
        </Svg>
      </View>
    </View>
  );
}
