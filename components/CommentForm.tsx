import { Check, SendHorizonal, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function CommentForm({
  mode = 'create',
  timestamp,
  initialContent = '',
  onSubmit,
  showAvatar = true,
  disabled = false,
  disabledReason = null,
  onFocus,
  onBlur,
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
    <View className="flex-row items-center gap-2">
      {/* Avatar */}
      {showAvatar &&
        (profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} className="h-10 w-10 rounded-full" />
        ) : (
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-300 dark:bg-primary-700">
            <UserRound size={18} color={theme.primary[600]} />
          </View>
        ))}

      {/* Pill input */}
      <View className="flex-1 flex-row items-center gap-2 rounded-full border border-primary-200 bg-primary-100 px-3 py-2 dark:border-primary-800 dark:bg-primary-900">
        {/* Timestamp badge */}
        <View
          className={`rounded-full px-2 py-0.5 ${disabled ? 'border-primary-400 dark:border-primary-600' : ' bg-primary-200 dark:bg-primary-800'}`}>
          <Text
            className={`font-SpaceGrotesk-Bold text-[11px] ${disabled ? 'text-primary-400 dark:text-primary-600' : 'text-primary-950 dark:text-primary-50'}`}>
            {formatTime(timestamp)}
          </Text>
        </View>

        <TextInput
          placeholder={disabledReason ?? 'Add a comment...'}
          value={commentText}
          onChangeText={setCommentText}
          className="text-md flex-1 font-SpaceGrotesk-Regular text-primary-950 dark:text-primary-50"
          cursorColor={theme.primary[700]}
          selectionColor={theme.primary[700]}
          placeholderTextColor={theme.primary[500]}
          maxLength={1000}
          returnKeyType="done"
          submitBehavior="blurAndSubmit"
          onFocus={() => { setOverviewExpanded(false); onFocus?.(); }}
          onBlur={onBlur}
          editable={!disabled}
        />
      </View>

      {/* Send button */}
      <TouchableOpacity
        onPress={() => {
          if (!disabled) {
            haptics.action();
            handleSubmit();
          }
        }}
        disabled={loading || (mode === 'edit' && !isDirty) || disabled}
        className="h-10 w-10 items-center justify-center "
        hitSlop={4}>
        {loading ? (
          <ActivityIndicator size="small" color={theme.primary[700]} />
        ) : mode === 'edit' ? (
          <Check size={20} strokeWidth={2} color={theme.primary[950]} />
        ) : (
          <SendHorizonal
            size={20}
            strokeWidth={2}
            color={disabled ? theme.primary[400] : theme.primary[950]}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}
