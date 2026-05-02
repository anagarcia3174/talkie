import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, Image } from 'react-native';
import { Star, SendHorizonal, Check, UserRound } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useProfile } from '~/store/profileStore';
import Toast from 'react-native-toast-message';
import { haptics } from '~/utils/haptics';
import { useUI } from '~/store/uiStore';

export interface ReviewFormProps {
  mode?: 'create' | 'edit';
  initialRating?: number;
  initialContent?: string;
  onSubmit: (rating: number, content: string) => Promise<void>;
  showAvatar?: boolean;
  disabled?: boolean;
  disabledReason?: string | null;
}

export default function ReviewForm({
  mode = 'create',
  initialRating = 0,
  initialContent = '',
  onSubmit,
  showAvatar = true,
  disabled = false,
  disabledReason = null,
}: ReviewFormProps) {
  const { profile } = useProfile();
  const theme = useTheme();
  const { setOverviewExpanded } = useUI();

  const [rating, setRating] = useState(initialRating);
  const [reviewText, setReviewText] = useState(initialContent);
  const [loading, setLoading] = useState(false);

  const handleSetRating = (value: number) => {
    setRating(value === rating ? 0 : value);
  };

  const handleSubmit = async () => {
    if (!reviewText.trim() || reviewText.trim().length < 15) {
      haptics.error();
      Toast.show({
        type: 'error',
        text1: 'Review must be at least 15 characters long.',
      });
      return;
    }

    try {
      setLoading(true);
      await onSubmit(rating, reviewText.trim());

      if (mode === 'create') {
        setRating(0);
        setReviewText('');
      }
    } finally {
      setLoading(false);
    }
  };

  const isDirty = rating !== initialRating || reviewText.trim() !== initialContent;

  return (
    <View >
      {/* ⭐ Stars (top row) */}
      <View className="mb-4 flex-row justify-between">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => {
              haptics.action();
              handleSetRating(star);
            }}
            className="items-center">
            <View className="relative items-center justify-center">
              <Star
                size={30}
                strokeWidth={1.5}
                color={star <= rating ? (theme.isDark ? 'gold' : 'goldenrod') : theme.primary[500]}
                fill={star <= rating ? (theme.isDark ? 'gold' : 'goldenrod') : 'transparent'}
              />
              {star <= rating && (
                <Text className="absolute font-SpaceGrotesk-SemiBold text-[10px] text-primary-950">
                  {star}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ✍️ Bottom row */}
      <View className="flex-row items-center gap-2">
        {showAvatar &&
          (profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} className="h-10 w-10 rounded-full" />
          ) : (
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-300 dark:bg-primary-700">
              <UserRound size={18} color={theme.primary[600]} />
            </View>
          ))}
        <View className="flex-1 flex-row items-center gap-2 rounded-full border border-primary-200 bg-primary-100 px-3 py-2 dark:border-primary-800 dark:bg-primary-900">
          <TextInput
            placeholder={disabledReason ? disabledReason : 'Write your review...'}
            value={reviewText}
            onChangeText={setReviewText}
            className="text-md flex-1 font-SpaceGrotesk-Regular text-primary-950 dark:text-primary-50"
            cursorColor={theme.primary[700]}
            selectionColor={theme.primary[700]}
            placeholderTextColor={theme.primary[500]}
            maxLength={1000}
            editable={!disabled}
            onFocus={() => setOverviewExpanded(false)}
          />
        </View>
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
            <ActivityIndicator size="small" color={theme.primary[950]} />
          ) : mode === 'edit' ? (
            <Check size={20} strokeWidth={2} color={theme.primary[950]} />
          ) : (
            <SendHorizonal size={20} strokeWidth={2} color={theme.primary[950]} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
