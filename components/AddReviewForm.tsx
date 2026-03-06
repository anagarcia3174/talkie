import { useProfile } from '~/store/profileStore';
import { useState } from 'react';
import { View, Image, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { SendHorizonal, Star } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useUI } from '~/store/uiStore';
import { BlurView } from 'expo-blur';
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
  <View
    className="px-4"
    style={{
      paddingBottom: insets.bottom * 0.2,
    }}>
    <BlurView
      intensity={40}
      tint={theme.isDark ? 'systemThickMaterialDark' : 'systemThickMaterialLight'}
      className="overflow-hidden rounded-3xl border border-white/15"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 10,
      }}>
      <View className="px-4 py-4">
        {/* Star Rating */}
        <View className="mb-3 flex-row justify-between px-1">
          {[1,2,3,4,5,6,7,8,9,10].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => handleSetRating(star === rating ? 0 : star)}
              activeOpacity={0.7}
              className="items-center">

              <View className="relative items-center justify-center">
                <Star
                  strokeWidth={1.2}
                  size={30}
                  color={
                    star <= rating
                      ? theme.isDark
                        ? 'gold'
                        : 'gold'
                      : theme.primary[500]
                  }
                  fill={
                    star <= rating
                      ? theme.isDark
                        ? 'gold'
                        : 'gold'
                      : 'transparent'
                  }
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
          <View className='h-[1px] mb-2 bg-primary-400/50 dark:bg-primary-800'></View>
        {/* Input Row */}
        <View className="flex-row items-end">
          {/* Avatar */}
          <Image
            source={{ uri: profile.avatar_url || 'https://via.placeholder.com/50' }}
            className="h-11 w-11 rounded-full"
          />

          {/* Input */}
          <TextInput
            placeholder="Leave a review..."
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            className="mx-4 max-h-28 flex-1 py-3 font-SpaceGrotesk-Light text-[15px] text-primary-950 dark:text-primary-200"
            cursorColor={theme.primary[700]}
            selectionColor={theme.primary[700]}
            placeholderTextColor={theme.primary[500]}
            returnKeyType="done"
            submitBehavior="blurAndSubmit"
            maxLength={1000}
            onFocus={() => setOverviewExpanded(false)}
            numberOfLines={2}
          />

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="h-11 w-11 items-center justify-center rounded-full ">
            {loading ? (
              <ActivityIndicator
                size="small"
              color={theme.primary[950]}
              />
            ) : (
              <SendHorizonal
                size={20}
                strokeWidth={2}
              color={theme.primary[950]}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </BlurView>
  </View>
);
}
