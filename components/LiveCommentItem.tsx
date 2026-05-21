import { Image, Pressable, Text, View } from 'react-native';
import { Heart, UserRound } from 'lucide-react-native';
import { CommentWithUser } from '~/types/supabaseTypes';
import { useTheme } from '~/hooks/useTheme';
import { getPublicUrl } from '~/utils/storageUrl';
import { useState } from 'react';
import { useComment } from '~/store/commentStore';
import { haptics } from '~/utils/haptics';
import Toast from 'react-native-toast-message';

interface LiveCommentItemProps {
  comment: CommentWithUser;
  isUser?: boolean;
}

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function LiveCommentItem({ comment, isUser }: LiveCommentItemProps) {
  const theme = useTheme();
  const { toggleLikeComment } = useComment();
  const uri = comment.owner.avatar_url ? getPublicUrl(comment.owner.avatar_url) : null;
  const [likeLoading, setLikeLoading] = useState(false);

  const handleCommentLike = async () => {
    setLikeLoading(true);
    haptics.action();
    const result = await toggleLikeComment(comment.id, {
      mediaId: comment.media_id,
      seasonNumber: comment.season_number ?? undefined,
      episodeNumber: comment.episode_number ?? undefined,
    });

    if (!result.success) {
      haptics.error();
      Toast.show({
        type: 'error',
        text1: result.error || 'Failed to like the comment.',
        visibilityTime: 4000,
        autoHide: true,
      });
    }
    setLikeLoading(false);
  };

  return (
    <View className="mb-2 flex-row items-center gap-2 px-3 py-2">
      {uri ? (
        <Image source={{ uri }} className="h-10 w-10 rounded-full bg-primary-300" />
      ) : (
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-700">
          <UserRound size={12} color={theme.primary[500]} />
        </View>
      )}

      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text className={`text-md font-SpaceGrotesk-Bold text-primary-950 dark:text-primary-50`}>
            {comment.owner.display_name}
          </Text>
          {comment.timestamp_seconds !== null && (
            <View className="rounded-full bg-primary-200 px-1.5 py-0.5 dark:bg-primary-700">
              <Text className="font-SpaceGrotesk-Medium text-[10px] text-primary-600 dark:text-primary-300">
                {formatTimestamp(comment.timestamp_seconds)}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-md font-SpaceGrotesk-Regular leading-5 text-primary-700 dark:text-primary-300">
          {comment.content}
        </Text>
      </View>

      {!isUser && (
        <Pressable disabled={likeLoading} onPress={handleCommentLike} hitSlop={8}>
          <View className="flex-row items-end gap-x-1">
            {comment.like_count > 0 && (
              <Text className="font-SpaceGrotesk-Light text-xs text-primary-500 dark:text-primary-400">
                {comment.like_count}
              </Text>
            )}
            <Heart
              size={16}
              strokeWidth={2}
              color={comment.is_liked ? '#e11d48' : theme.primary[400]}
              fill={comment.is_liked ? '#e11d48' : 'transparent'}
            />
          </View>
        </Pressable>
      )}
    </View>
  );
}
