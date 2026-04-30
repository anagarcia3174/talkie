import { Check, SendHorizonal, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Image, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from '~/hooks/useTheme';
import { useProfile } from '~/store/profileStore';
import { useUI } from '~/store/uiStore';
import { haptics } from '~/utils/haptics';

export interface CommentFormProps {
  mode?: 'create' | 'edit';
  initialContent?: string;
  timestamp: number;
  onSubmit: (content: string) => Promise<void>;
  showAvatar?: boolean;
  disabled?: boolean;
  disabledReason?: string | null;
}

export default function CommentForm({
  mode = 'create',
  timestamp,
  initialContent = '',
  onSubmit,
  showAvatar = true,
  disabled = false,
  disabledReason = null,
}: CommentFormProps) {
  const { profile } = useProfile();
  const [commentText, setCommentText] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { setOverviewExpanded } = useUI();

  const handleSubmit = async () => {
    if (!commentText.trim() || commentText.trim().length < 15) {
      haptics.error();
      Toast.show({
        type: 'error',
        text1: 'Comment text must be at least 15 characters long.',
        visibilityTime: 4000,
        autoHide: true,
      });
      return;
    } else if (commentText.trim().length > 1000) {
      haptics.error();
      Toast.show({
        type: 'error',
        text1: 'Comment text must be at most 1000 characters long.',
        visibilityTime: 4000,
        autoHide: true,
      });
    }
    try {
      setLoading(true);
      await onSubmit(commentText.trim());

      if (mode === 'create') {
        setCommentText('');
      }
    } finally {
      setLoading(false);
    }
  };

  const isDirty = commentText.trim() !== initialContent;

  const formatTime = (seconds: number) => {
    if (seconds >= 3600) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="flex-row items-end">
      {/* Avatar */}
      {showAvatar &&
        (profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} className="h-11 w-11 rounded-full" />
        ) : (
          <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
            <UserRound size={16} color={theme.primary[900]} />
          </View>
        ))}

      {/* Input */}
      <TextInput
        placeholder={
          disabledReason ? disabledReason : `Leave a comment at ${formatTime(timestamp)}...`
        }
        value={commentText}
        onChangeText={setCommentText}
        multiline
        className="mx-4 max-h-28 flex-1 py-3 font-SpaceGrotesk-Regular text-[16px] text-primary-950 dark:text-primary-50"
        cursorColor={theme.primary[700]}
        selectionColor={theme.primary[700]}
        placeholderTextColor={theme.primary[500]}
        maxLength={1000}
        returnKeyType="done"
        submitBehavior="blurAndSubmit"
        onFocus={() => setOverviewExpanded(false)}
        numberOfLines={2}
        editable={!disabled}
      />

      {/* Send Button */}
      <TouchableOpacity
        onPress={() => {
          if (!disabled) {
            haptics.action();
            handleSubmit();
          }
        }}
        disabled={loading || (mode === 'edit' && !isDirty) || disabled}
        className="h-11 w-11 items-center justify-center rounded-full">
        {loading ? (
          <ActivityIndicator size="small" color={theme.primary[950]} />
        ) : mode === 'edit' ? (
          <Check size={20} strokeWidth={3} color={theme.primary[950]} />
        ) : (
          <SendHorizonal size={20} strokeWidth={3} color={theme.primary[950]} />
        )}
      </TouchableOpacity>
    </View>
  );
}
