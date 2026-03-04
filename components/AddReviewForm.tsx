import { useProfile } from '~/store/profileStore';
import { useState } from 'react';
import { View, Image, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { SendHorizonal, Star } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Toast from 'react-native-toast-message';
import { useUI } from '~/store/uiStore';
interface AddReviewFormProps {
  onSubmitReview: (rating: number, content: string) => Promise<void>;
}

export default function AddReviewForm({ onSubmitReview }: AddReviewFormProps) {
  const { profile } = useProfile();
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { setOverviewExpanded } = useUI();
  if (!profile) return null;

  const handleSetRating = (value: number) => setRating(value);

  const handleSubmit = async () => {
    if (!reviewText.trim() || reviewText.trim().length < 15) {
      Toast.show({
        type: 'error',
        text1: 'Review must be at least 15 characters long.',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
      return;
    }
    setLoading(true);
    await onSubmitReview(rating, reviewText.trim());

    setRating(0);
    setReviewText('');
    setLoading(false);
  };

  return (
    <BlurView
      intensity={30}
      className="overflow-hidden px-4 pt-2"
      style={{ paddingBottom: insets.bottom * 0.7 }}>
      {/* Star Rating */}
      <View className="mb-3 flex-row justify-between">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleSetRating(star === rating ? 0 : star)}
            activeOpacity={0.7}
            className="items-center">
            <View className="relative items-center justify-center">
              <Star
                strokeWidth={1.5}
                size={28}
                color={star <= rating ? 'gold' : theme.primary[500]}
                fill={star <= rating ? 'gold' : 'transparent'}
              />
              {star <= rating && (
                <Text className="absolute font-SpaceGrotesk-SemiBold text-xs text-primary-950">
                  {star}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input Row */}
      <View className="flex-row items-center">
        {/* Profile Picture */}
        <Image
          source={{ uri: profile.avatar_url || 'https://via.placeholder.com/50' }}
          className="h-10 w-10 rounded-full"
        />

        {/* Text Input */}
        <TextInput
          placeholder="Leave a review..."
          value={reviewText}
          onChangeText={setReviewText}
          multiline
          numberOfLines={2}
          className="text-md mx-3 max-h-24 flex-1 rounded-xl border border-primary-700 px-4 py-2 font-SpaceGrotesk-Light text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-400 dark:text-primary-200 focus:dark:border-primary-50"
          cursorColor={theme.primary[700]}
          selectionColor={theme.primary[700]}
          placeholderTextColor={theme.primary[500]}
          returnKeyType="done"
          submitBehavior="blurAndSubmit"
          maxLength={1000}
          onFocus={() => setOverviewExpanded(false)}
        />

        {/* Submit Button */}
        <TouchableOpacity onPress={handleSubmit} disabled={loading} className="rounded-full">
          {loading ? (
            <ActivityIndicator color={theme.primary[950]} />
          ) : (
            <SendHorizonal color={theme.primary[950]} size={24} />
          )}
        </TouchableOpacity>
      </View>
    </BlurView>
  );
}
