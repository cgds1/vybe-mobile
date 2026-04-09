import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamilies, fontSizes, radius, spacing } from '@/theme';
import type { Message } from '../store/chatStore';

interface Props {
  message: Message;
  isOwn: boolean;
}

function StatusIcon({ status }: { status: Message['status'] }) {
  if (status === 'sending') {
    return <Text style={styles.statusIcon}>○</Text>;
  }
  return <Text style={styles.statusIcon}>✓</Text>;
}

export function MessageBubble({ message, isOwn }: Props) {
  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.text, isOwn ? styles.textOwn : styles.textOther]}>
          {message.content}
        </Text>
        {isOwn && (
          <View style={styles.statusRow}>
            <StatusIcon status={message.status} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
  },
  rowOwn: {
    alignItems: 'flex-end',
  },
  rowOther: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.lg,
  },
  bubbleOwn: {
    backgroundColor: colors.coral,
    borderBottomRightRadius: radius.sm,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.sm,
  },
  text: {
    fontFamily: fontFamilies.body.regular,
    fontSize: fontSizes.md,
    lineHeight: 20,
  },
  textOwn: {
    color: colors.offWhite,
  },
  textOther: {
    color: colors.text.primary,
  },
  statusRow: {
    alignItems: 'flex-end',
    marginTop: 2,
  },
  statusIcon: {
    fontSize: 10,
    color: 'rgba(245, 240, 234, 0.7)',
  },
});
