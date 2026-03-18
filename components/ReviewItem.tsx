import { View, Text, Image } from 'react-native';
import { ReviewWithUser } from '~/types/supabaseTypes';
import { Star, UserRound } from 'lucide-react-native';
import { getPublicUrl } from '~/utils/storageUrl';
import { useTheme } from '~/hooks/useTheme';

interface ReviewItemProps {
  review: ReviewWithUser;
  isUser?: boolean;
  isLast?: boolean;
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function ReviewItem({ review, isUser, isLast }: ReviewItemProps) {
  const uri = getPublicUrl(review.avatar_url);
  const hasAvatar = uri && uri.length > 0;
  const theme = useTheme();

  return (
    <>
      <View className="px-6 py-3 mx-2 my-1 rounded-2xl bg-primary-100/30 dark:bg-primary-950/30 ">
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
            {/* Header row */}
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

              {/* created_at now top-right */}
              <Text className="font-SpaceGrotesk-Light text-xs text-primary-600 dark:text-primary-400">
                {formatRelativeTime(review.created_at)}
              </Text>
            </View>

            {/* Review body */}
            <Text className="mt-1 font-SpaceGrotesk-Light text-sm leading-5 text-primary-800 dark:text-primary-200">
              {/* rating prefix like timestamp */}
              <Text className="font-SpaceGrotesk-Bold text-primary-950 dark:text-primary-50">
                {review.rating}/10{' '}
              </Text>

              <Star
                strokeWidth={1.5}
                size={12}
                color={theme.isDark ? 'gold' : 'yellow'}
                fill={theme.isDark ? 'gold' : 'yellow'}
              />

              <Text> — </Text>

              {review.content ?? (
                <Text className="text-primary-500 dark:text-primary-400">No written review</Text>
              )}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}
