import { View, Text, Image } from 'react-native';
import { ReviewWithUser } from '~/types/supabaseTypes';
import { Star, Trash2, UserRound } from 'lucide-react-native';
import { getPublicUrl } from '~/utils/storageUrl';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface ReviewItemProps {
  review: ReviewWithUser;
  isUser?: boolean;
  isLast?: boolean; // hide divider on last item
}

export default function ReviewItem({ review, isUser, isLast }: ReviewItemProps) {
  const uri = getPublicUrl(review.avatar_url);
  const hasAvatar = uri && uri.length > 0;
  const theme = useTheme();

  const renderRightActions = (prog: SharedValue<number>, drag: SharedValue<number>) => {
    if (!isUser) return null;

    const styleAnim = useAnimatedStyle(() => {
      const scale = interpolate(drag.value, [-80, -40, 0], [1, 0.85, 0.7], Extrapolation.CLAMP);
      const opacity = interpolate(drag.value, [-60, -20], [1, 0], Extrapolation.CLAMP);
      return { transform: [{ scale }], opacity };
    });

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        className="my-1 mr-3 w-16 items-center justify-center rounded-r-lg ">
        <Animated.View style={styleAnim} className="items-center gap-1">
          <Trash2 size={18} color={theme.primary[950]} strokeWidth={2} />
          <Text className="text-[10px] font-semibold tracking-wide text-primary-950 dark:text-primary-50">Delete</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <ReanimatedSwipeable
      enabled={isUser}
      rightThreshold={60}
      renderRightActions={renderRightActions}
      friction={2}
      overshootRight={false}>
      <View className="px-6 py-3">
        <View className="flex-row items-start gap-3">
          {/* Avatar */}
          {hasAvatar ? (
            <Image source={{ uri }} className="mt-0.5 h-9 w-9 rounded-full bg-primary-300" />
          ) : (
            <View className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-primary-300 bg-primary-200 dark:border-primary-700 dark:bg-primary-600">
              <UserRound size={20} color={theme.primary[700]} />
            </View>
          )}

          {/* Review content */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="text-sm font-semibold text-primary-950 dark:text-primary-50">
                  {review.display_name}
                </Text>
                {isUser && (
                  <View className="rounded-full bg-primary-600/20 px-2 py-0.5">
                    <Text className="font-SpaceGrotesk-Bold text-[9px] tracking-wide text-primary-700 dark:text-primary-300">
                      YOU
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center gap-x-1">
                <Text className="font-SpaceGrotesk-SemiBold text-xs text-primary-950 dark:text-primary-100">
                  {review.rating}/10
                </Text>
                <Star
                  strokeWidth={1.5}
                  size={12}
                  color={theme.isDark ? 'gold' : 'yellow'}
                  fill={theme.isDark ? 'gold' : 'yellow'}
                />
              </View>
            </View>

            {review.content ? (
              <Text className="mt-1 font-SpaceGrotesk-Light text-sm leading-5 text-primary-800 dark:text-primary-200">
                {review.content}
              </Text>
            ) : (
              <Text className="mt-1 font-SpaceGrotesk-Light text-sm text-primary-500 dark:text-primary-400">
                No written review
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Inset divider — skipped on last item */}
      {!isLast && <View className="mx-6 h-px bg-primary-300 dark:bg-primary-700" />}
    </ReanimatedSwipeable>
  );
}
