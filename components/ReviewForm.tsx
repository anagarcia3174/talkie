import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, Image } from 'react-native';
import { Star, SendHorizonal, Check, UserRound } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useProfile } from '~/store/profileStore';
import Toast from 'react-native-toast-message';
import { haptics } from '~/utils/haptics';

export interface ReviewFormProps {
  mode?: 'create' | 'edit';
  initialRating?: number;
  initialContent?: string;
  onSubmit: (rating: number, content: string) => Promise<void>;
  showAvatar?: boolean;
}

export default function ReviewForm({
  mode = 'create',
  initialRating = 0,
  initialContent = '',
  onSubmit,
  showAvatar = true,
}: ReviewFormProps) {
  const { profile } = useProfile();
  const theme = useTheme();

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
    <View>
      {/* ⭐ Stars (top row) */}
      <View className="mb-3 flex-row justify-between">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => {
              haptics.action();
              handleSetRating(star)}}
            className="items-center">
            <View className="relative items-center justify-center">
              <Star
                size={30}
                strokeWidth={1.2}
                color={star <= rating ? 'gold' : theme.primary[500]}
                fill={star <= rating ? 'gold' : 'transparent'}
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

      <View className="mb-2 h-[1px] bg-primary-400/50 dark:bg-primary-800" />

      {/* ✍️ Bottom row */}
      <View className="flex-row items-end">
        {showAvatar &&
          (profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url || 'https://via.placeholder.com/50' }}
              className="mr-3 h-11 w-11 rounded-full"
            />
          ) : (
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
              <UserRound size={16} color={theme.primary[900]} />
            </View>
          ))}

        <TextInput
          placeholder="Write your review..."
          value={reviewText}
          onChangeText={setReviewText}
          multiline
          className="flex-1 py-3 font-SpaceGrotesk-Light text-[15px] text-primary-950 dark:text-primary-200"
          cursorColor={theme.primary[700]}
          selectionColor={theme.primary[700]}
          placeholderTextColor={theme.primary[500]}
          maxLength={1000}
        />

        <TouchableOpacity
          onPress={() => {
            haptics.action();
            handleSubmit();
          }}
          disabled={loading || (mode === 'edit' && !isDirty)}
          className="ml-2 h-11 w-11 items-center justify-center rounded-full">
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
