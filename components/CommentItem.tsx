import { View, Text, Image, Pressable } from 'react-native';
import { Comment, CommentWithUser, ReportReason } from '~/types/supabaseTypes';
import { UserRound, AlertTriangle, Heart, MoreHorizontal } from 'lucide-react-native';
import { getPublicUrl } from '~/utils/storageUrl';
import { useTheme } from '~/hooks/useTheme';
import ItemOptions from './ItemOptions';
import { useState } from 'react';
import { useComments } from '~/store/commentStore';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import CommentEditModal from './CommentEditModal';
import ReportModal from './ReportModal';
import { haptics } from '~/utils/haptics';
import DeleteItemModal from './DeleteItemModal';

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

export default function CommentItem({ comment, isUser }: CommentItemProps) {
  const uri = comment.owner.avatar_url ? getPublicUrl(comment.owner.avatar_url) : null;
  const { toggleLikeComment, deleteComment, updateComment, reportComment } = useComments();
  const hasAvatar = uri && uri.length > 0;
  const theme = useTheme();
  const isReply = comment.parent_comment_id !== null;
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [deleteItemModalVisible, setDeleteItemModalVisible] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const router = useRouter();

  const handleCommentLike = async () => {
    setLikeLoading(true);

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

  const handleCommentDelete = async () => {
    const result = await deleteComment(comment.id, {
      mediaId: comment.media_id,
      seasonNumber: comment.season_number ?? undefined,
      episodeNumber: comment.episode_number ?? undefined,
    });
    if (!result.success) {
      haptics.error();

      Toast.show({
        type: 'error',
        text1: result.error || 'Failed to delete the comment.',
        visibilityTime: 4000,
        autoHide: true,
      });
    }
  };

  const handleCommentUpdate = async (content: string, timestamp: number) => {
    const updates: Partial<Pick<Comment, 'timestamp_seconds' | 'content'>> = {};

    if (timestamp !== comment.timestamp_seconds) updates.timestamp_seconds = timestamp;
    if (content !== comment.content) updates.content = content;
    if (Object.keys(updates).length === 0) return;

    const result = await updateComment({
      commentId: comment.id,
      contextKey: {
        mediaId: comment.media_id,
        seasonNumber: comment.season_number ?? undefined,
        episodeNumber: comment.episode_number ?? undefined,
      },
      updates,
    });
    setEditModalVisible(false);
    if (!result.success) {
      haptics.error();

      Toast.show({
        type: 'error',
        text1: result.error || 'Failed to update your comment.',
        visibilityTime: 4000,
        autoHide: true,
      });
    }
  };

  const handleCommentReport = async (reason: ReportReason, details?: string) => {
    const result = await reportComment(comment.id, reason, details);
    setReportModalVisible(false);
    if (!result.success) {
      haptics.error();

      Toast.show({
        type: 'error',
        text1: result.error || 'Failed to report the comment.',
        visibilityTime: 4000,
        autoHide: true,
      });
    } else {
      haptics.success();

      Toast.show({
        type: 'success',
        text1: 'Report submitted!',
        visibilityTime: 4000,
        autoHide: true,
      });
    }
  };
  return (
    <>
      <View className={isReply ? 'pl-10' : ''}>
        <View className="mx-2 my-1 rounded-2xl bg-primary-100/30 px-6 py-3 dark:bg-primary-950/30">
          <View className="flex-row items-start gap-3">
            {/* Avatar */}
            <Pressable
              disabled={isUser}
              onPress={() =>
                router.push({ pathname: '/profile/[id]', params: { id: comment.user_id } })
              }
              hitSlop={8}>
              {hasAvatar ? (
                <Image source={{ uri }} className="mt-0.5 h-9 w-9 rounded-full bg-primary-300" />
              ) : (
                <View className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-primary-300 bg-primary-200 dark:border-primary-700 dark:bg-primary-600">
                  <UserRound size={20} color={theme.primary[700]} />
                </View>
              )}
            </Pressable>

            {/* Content */}
            <View className="flex-1">
              {/* Header */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Pressable
                    disabled={isUser}
                    onPress={() =>
                      router.push({ pathname: '/profile/[id]', params: { id: comment.user_id } })
                    }
                    hitSlop={8}>
                    <Text className="text-sm font-semibold text-primary-950 dark:text-primary-50">
                      {comment.owner.display_name}
                    </Text>
                  </Pressable>

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

                {/* ✅ 3-dot menu */}
                <Pressable
                  className="pl-4"
                  onPress={() => {
                    haptics.action();
                    setOptionsVisible(true);
                  }}
                  hitSlop={8}>
                  <MoreHorizontal size={18} color={theme.primary[500]} />
                </Pressable>
              </View>

              {/* Body */}
              <View className="mt-1">
                <Text className="font-SpaceGrotesk-Light text-sm leading-5 text-primary-800 dark:text-primary-200">
                  {comment.timestamp_seconds !== null && (
                    <Text className="font-SpaceGrotesk-Bold text-primary-950 dark:text-primary-50">
                      {`${formatTimestamp(comment.timestamp_seconds)} — `}
                    </Text>
                  )}

                  {comment.content ?? (
                    <Text className="text-primary-500 dark:text-primary-400">No content</Text>
                  )}
                </Text>
              </View>

              {/* ✅ Footer (date + like) */}
              <View className="mt-2 flex-row items-center justify-between">
                {/* Date */}
                <Text className="font-SpaceGrotesk-Light text-xs text-primary-600 dark:text-primary-400">
                  {formatRelativeTime(comment.created_at)}
                </Text>

                {/* Like */}
                {!isUser && (
                  <Pressable
                    disabled={likeLoading}
                    onPress={() => {
                      haptics.action();
                      handleCommentLike();
                    }}
                    hitSlop={8}>
                    <View className="flex-row items-center gap-x-[4px]">
                      {comment.like_count > 0 && (
                        <Text className="font-SpaceGrotesk-Light text-sm text-primary-500 dark:text-primary-400">
                          {comment.like_count}
                        </Text>
                      )}
                      <Heart
                        size={16}
                        strokeWidth={1.5}
                        color={comment.is_liked ? '#e11d48' : theme.primary[400]}
                        fill={comment.is_liked ? '#e11d48' : 'transparent'}
                      />
                    </View>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
      <ItemOptions
        visible={optionsVisible}
        item={{ type: 'comment', data: comment }}
        isOwner={!!isUser}
        onClose={() => setOptionsVisible(false)}
        onDelete={() => {
          setOptionsVisible(false);
          setDeleteItemModalVisible(true);
        }}
        onEdit={() => {
          setOptionsVisible(false);
          setEditModalVisible(true);
        }}
        onReport={() => {
          setOptionsVisible(false);
          setReportModalVisible(true);
        }}
      />
      <CommentEditModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        mediaId={comment.media_id}
        mediaType={comment.season_number ? 'tv' : 'movie'} // ✅ dercive
        initialTimestamp={comment.timestamp_seconds ?? 0}
        season={comment.season_number ?? 1}
        episode={comment.episode_number ?? 1}
        commentFormProps={{
          mode: 'edit',
          initialContent: comment.content,
          onSubmit: async () => {},
          showAvatar: false,
          timestamp: comment.timestamp_seconds ?? 0,
        }}
        onSubmit={handleCommentUpdate}
      />
      <ReportModal
        type="comment"
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSubmit={handleCommentReport}
      />
      <DeleteItemModal
        item="comment"
        visible={deleteItemModalVisible}
        onClose={(deleteItem: boolean) => {
          setDeleteItemModalVisible(false);
          if (deleteItem) handleCommentDelete();
        }}
      />
    </>
  );
}
