import { View, Text, Image } from 'react-native';
import { CommentWithUser } from '~/types/supabaseTypes';
import { UserRound, AlertTriangle } from 'lucide-react-native';
import { getPublicUrl } from '~/utils/storageUrl';
import { useTheme } from '~/hooks/useTheme';

interface CommentItemProps {
  comment: CommentWithUser;
  isUser?: boolean;
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

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function CommentItem({ comment, isUser }: CommentItemProps) {
  const uri = comment.owner.avatar_url ? getPublicUrl(comment.owner.avatar_url) : null;
  const hasAvatar = uri && uri.length > 0;
  const theme = useTheme();
  const isReply = comment.parent_comment_id !== null;

  return (
    <>
      {/* Indent replies */}
      <View className={isReply ? 'pl-10' : ''}>
        <View className="mx-2 my-1 rounded-2xl bg-primary-100/30 dark:bg-primary-950/30  px-6 py-3">
          <View className="flex-row items-start gap-3">
            {/* Avatar */}
            {hasAvatar ? (
              <Image source={{ uri }} className="mt-0.5 h-9 w-9 rounded-full bg-primary-300" />
            ) : (
              <View className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-primary-300 bg-primary-200 dark:border-primary-700 dark:bg-primary-600">
                <UserRound size={20} color={theme.primary[700]} />
              </View>
            )}

            {/* Comment content */}
            <View className="flex-1">
              {/* Header row */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-semibold text-primary-950 dark:text-primary-50">
                    {comment.owner.display_name}
                  </Text>
                  {isUser && (
                    <View className="rounded-full bg-primary-600/20 px-2 py-0.5">
                      <Text className="font-SpaceGrotesk-Bold text-[9px] tracking-wide text-primary-700 dark:text-primary-300">
                        YOU
                      </Text>
                    </View>
                  )}
                  {comment.is_spoiler && (
                    <View className="flex-row items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5">
                      <AlertTriangle size={9} color={theme.isDark ? '#fbbf24' : '#d97706'} />
                      <Text className="font-SpaceGrotesk-Bold text-[9px] tracking-wide text-amber-600 dark:text-amber-400">
                        SPOILER
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="font-SpaceGrotesk-Light text-xs text-primary-600 dark:text-primary-400">
                  {formatRelativeTime(comment.created_at)}
                </Text>
              </View>

              {/* Comment body with optional inline timestamp prefix */}
              {comment.is_deleted ? (
                <Text className="mt-1 font-SpaceGrotesk-Light text-sm italic text-primary-400 dark:text-primary-500">
                  This comment has been deleted.
                </Text>
              ) : (
                <Text className="mt-1 font-SpaceGrotesk-Light text-sm leading-5 text-primary-800 dark:text-primary-200">
                  {comment.timestamp_seconds !== null && (
                    <Text className="font-SpaceGrotesk-Bold text-primary-950 dark:text-primary-50">
                      {`${formatTimestamp(comment.timestamp_seconds)} — `}
                    </Text>
                  )}
                  {comment.content ?? (
                    <Text className="text-primary-500 dark:text-primary-400">No content</Text>
                  )}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
