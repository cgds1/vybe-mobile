import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '@/theme';

interface AvatarWithStatusProps {
  uri: string;
  size?: number;
  isOnline?: boolean;
  showStatus?: boolean;
}

export const AvatarWithStatus = ({
  uri,
  size = 48,
  isOnline = false,
  showStatus = true,
}: AvatarWithStatusProps) => {
  const dotSize = Math.round(size * 0.28);

  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={{ uri }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
        contentFit="cover"
        transition={200}
      />
      {showStatus && (
        <View
          style={[
            styles.statusDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              bottom: 0,
              right: 0,
              backgroundColor: isOnline ? colors.status.online : colors.status.offline,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: { backgroundColor: colors.surface },
  statusDot: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.midnight,
  },
});
