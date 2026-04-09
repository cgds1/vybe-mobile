import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { colors, fontFamilies, fontSizes, radius, spacing } from '@/theme';

interface Props {
  onSend: (text: string) => void;
  onSendImage: (uri: string) => Promise<void>;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

export function ChatInput({ onSend, onSendImage, onTypingStart, onTypingStop }: Props) {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  function handleChangeText(value: string) {
    setText(value);

    if (value.length > 0 && !isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart?.();
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onTypingStop?.();
      }
    }, 2000);
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop?.();
    }

    setText('');
    onSend(trimmed);
  }

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];

    // Comprimir a 1080px máximo, 80% calidad
    const compressed = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
    );

    setIsUploading(true);
    try {
      await onSendImage(compressed.uri);
    } finally {
      setIsUploading(false);
    }
  }

  const canSend = text.trim().length > 0 && !isUploading;

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.attachBtn}
        onPress={handlePickImage}
        disabled={isUploading}
        hitSlop={8}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color={colors.coral} />
        ) : (
          <Ionicons name="image-outline" size={24} color={colors.text.secondary} />
        )}
      </Pressable>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={handleChangeText}
        placeholder="Escribe un mensaje..."
        placeholderTextColor={colors.text.disabled}
        multiline
        maxLength={1000}
        returnKeyType="default"
        editable={!isUploading}
      />

      <Pressable
        style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={!canSend}
        hitSlop={8}
      >
        <Ionicons
          name="send"
          size={20}
          color={canSend ? colors.offWhite : colors.text.disabled}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    backgroundColor: colors.midnight,
    gap: spacing[3],
  },
  attachBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.md,
    color: colors.text.primary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: colors.surface,
  },
});
