import { Image, Pressable, Text, View } from 'react-native';
import { Heart, UserRound } from 'lucide-react-native';
import { CommentWithUser } from '~/types/supabaseTypes';
import { useTheme } from '~/hooks/useTheme';
import { getPublicUrl } from '~/utils/storageUrl';

interface LiveCommentItemProps {
  comment: CommentWithUser;
  isUser?: boolean;
  onLike?: () => void;
}

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function LiveCommentItem({ comment, isUser, onLike }: LiveCommentItemProps) {
  const theme = useTheme();
  const uri = comment.owner.avatar_url ? getPublicUrl(comment.owner.avatar_url) : null;

  return (
    <View className="flex-row items-center gap-2 px-3 py-2 mb-2">
      {uri ? (
        <Image source={{ uri }} className="h-10 w-10 rounded-full bg-primary-300" />
      ) : (
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-700">
          <UserRound size={12} color={theme.primary[500]} />
        </View>
      )}

      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text
            className={`font-SpaceGrotesk-Bold text-md text-primary-950 dark:text-primary-50`}>
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
        <Text className="font-SpaceGrotesk-Regular text-md leading-5 text-primary-700 dark:text-primary-300">
          {comment.content}
        </Text>
      </View>

      {!isUser && (
        <Pressable onPress={onLike} hitSlop={8}>
          <Heart
            size={16}
            strokeWidth={2}
            color={comment.is_liked ? '#e11d48' : theme.primary[400]}
            fill={comment.is_liked ? '#e11d48' : 'transparent'}
          />
        </Pressable>
      )}
    </View>
  );
}
