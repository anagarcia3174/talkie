import { View, Text, Image } from 'react-native';
import { ReviewWithUser } from '~/types/supabaseTypes';
import { Star, Trash2, UserRound } from 'lucide-react-native';
import { getPublicUrl } from '~/utils/storageUrl';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '~/hooks/useTheme';

interface ReviewItemProps {
  review: ReviewWithUser;
  isUser?: boolean;
  isLast?: boolean; // hide divider on last item
}

export default function ReviewItem({ review, isUser, isLast }: ReviewItemProps) {
  const uri = getPublicUrl(review.avatar_url);
  const hasAvatar = uri && uri.length > 0;
  const theme = useTheme();

  const renderRightActions = () => {
    if (!isUser) return null;
    return (
      <TouchableOpacity className="h-full w-20 items-center justify-center bg-red-500">
        <Trash2 size={20} color="white" />
      </TouchableOpacity>
    );
  };

  return (
    <ReanimatedSwipeable
      enabled={isUser}
      rightThreshold={40}
      renderRightActions={renderRightActions}
      friction={3}
      overshootRight={false}>
      <View className="px-4 py-3">
        <View className="flex-row items-start gap-3">
          {/* Avatar */}
          {hasAvatar ? (
            <Image source={{ uri }} className="mt-0.5 h-9 w-9 rounded-full bg-primary-300" />
          ) : (
            <View className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-primary-300 dark:border-primary-700 bg-primary-200 dark:bg-primary-600">
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
                    <Text className="text-[9px] font-SpaceGrotesk-Bold tracking-wide text-primary-700 dark:text-primary-300">
                      YOU
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center gap-x-1">
                <Text className="text-xs font-SpaceGrotesk-SemiBold text-primary-950 dark:text-primary-100">
                  {review.rating}/10
                </Text>
                <Star strokeWidth={1.5} size={12} color={theme.isDark ? 'gold' : 'yellow'} fill={theme.isDark ? 'gold' : 'yellow'} />
              </View>
            </View>

            {review.content ? (
              <Text className="mt-1 text-sm font-SpaceGrotesk-Light leading-5 text-primary-800 dark:text-primary-200">
                {review.content}
              </Text>
            ) : (
              <Text className="mt-1 text-sm font-SpaceGrotesk-Light text-primary-500 dark:text-primary-400">
                No written review
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Inset divider — skipped on last item */}
      {!isLast && <View className="mx-4 h-px bg-primary-300 dark:bg-primary-700" />}
    </ReanimatedSwipeable>
  );
}
