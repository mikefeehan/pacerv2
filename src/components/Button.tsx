import React from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className,
  fullWidth = false,
}: ButtonProps) {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const baseClasses = 'flex-row items-center justify-center rounded-xl';

  const variantClasses = {
    primary: 'bg-pacer-accent active:bg-pacer-accentLight',
    secondary: 'bg-pacer-surface border border-pacer-border active:bg-pacer-border',
    outline: 'bg-transparent border border-pacer-accent active:bg-pacer-accent/10',
    ghost: 'bg-transparent active:bg-pacer-surface',
  };

  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  const textVariantClasses = {
    primary: 'text-white font-semibold',
    secondary: 'text-pacer-white font-medium',
    outline: 'text-pacer-accent font-medium',
    ghost: 'text-pacer-muted font-medium',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const disabledClasses = disabled || loading ? 'opacity-50' : '';

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabledClasses,
        fullWidth && 'w-full',
        className
      )}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : '#FF6B35'}
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text
            className={cn(
              textVariantClasses[variant],
              textSizeClasses[size]
            )}
          >
            {children}
          </Text>
        </>
      )}
    </Pressable>
  );
}
