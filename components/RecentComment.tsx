import { Heart, UserRound } from 'lucide-react-native';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { CommentWithUserAndMedia } from '~/types/supabaseTypes';
import { getPublicUrl } from '~/utils/storageUrl';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

interface RecentCommentProps {
  comment: CommentWithUserAndMedia;
}

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
}

export default function RecentComment({ comment }: RecentCommentProps) {
  const { media, owner } = comment;
  const theme = useTheme();
  const router = useRouter();
  const poster = media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : null;

  const backdrop = media.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${media.backdrop_path}`
    : null;

  const image = backdrop || poster;

  const year = media.release_date ? new Date(media.release_date).getFullYear() : null;

  const episodeLabel =
    media.media_type === 'tv' && comment.season_number && comment.episode_number
      ? `S${comment.season_number} · E${comment.episode_number}`
      : year;

  return (
    <TouchableOpacity
    activeOpacity={0.7}

      onPress={() => {
        router.push({
          pathname: '/media/[id]',
          params: {
            id: media.id.toString(),
            mediaData: JSON.stringify(media),
          },
        });
      }}
      className="mr-4 w-80 overflow-hidden rounded-2xl  bg-primary-100 dark:bg-primary-900">
      {/* Hero Strip */}
      <View className="relative h-24 w-full overflow-hidden">
        {image && (
          <Image
            source={{ uri: image }}
            className="absolute inset-0 h-full w-full"
            resizeMode="cover"
          />
        )}

        {/* Blur layer */}
        {image && (
          <BlurView
            intensity={70}
            tint={theme.isDark ? 'dark' : 'light'}
            className="absolute inset-0"
          />
        )}

        {/* Content */}
        <View className="flex-1 px-3 justify-center gap-y-0.5">
          <Text className="font-SpaceGrotesk-Bold text-sm text-primary-50" numberOfLines={1}>
            {media.title}
          </Text>

          {episodeLabel && (
            <View className="self-start rounded-full bg-primary-400/20 px-2 py-0.5">
              <Text className="font-SpaceGrotesk-Medium text-xs text-primary-50">
                {episodeLabel}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 p-3">
        {/* User Row */}
        <View className="mb-2 flex-row items-center">
          {owner.avatar_url && getPublicUrl ? (
            <Image
              source={{ uri: getPublicUrl(owner.avatar_url) }}
              className="mr-2 h-8 w-8 rounded-full"
            />
          ) : (
            <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-primary-600 dark:bg-primary-300">
              <UserRound size={18} strokeWidth={3} color={theme.primary[50]} />
            </View>
          )}

          <View className="flex-1 flex-col gap-0">
            <Text
              className="font-SpaceGrotesk-Medium text-sm leading-tight text-primary-950 dark:text-primary-50"
              numberOfLines={1}>
              {owner.display_name}
            </Text>
            <Text className="-mt-0.5 text-xs leading-tight text-primary-500 dark:text-primary-400">
              {formatRelativeTime(comment.created_at)}
            </Text>
          </View>
        </View>

        {/* Comment Body */}
        <Text
          className="text-sm leading-normal text-primary-700 dark:text-primary-300"
          numberOfLines={3}>
          {comment.timestamp_seconds !== null && (
            <Text className="font-SpaceGrotesk-Bold text-primary-900 dark:text-primary-50">
              {`${formatTimestamp(comment.timestamp_seconds)} — `}
            </Text>
          )}
          {comment.content}
        </Text>
      </View>

      {/* Footer */}
      <View className="flex-row items-end justify-end border-t border-primary-200 px-3 py-2 dark:border-primary-800">
        <View className="flex-row items-center gap-1">
          <Heart
            size={12}
            strokeWidth={3}
            color={comment.is_liked ? '#e11d48' : theme.primary[400]}
            fill={comment.is_liked ? '#e11d48' : 'transparent'}
          />
          <Text className="text-xs text-primary-600 dark:text-primary-400">
            {comment.like_count}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
