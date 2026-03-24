import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { MovieDetails, TVDetails } from '~/types/supabaseTypes';
import TimestampPicker from './TimestampPicker';
import { useComments } from '~/store/commentStore';
import { useTheme } from '~/hooks/useTheme';
import { FlatList } from 'react-native-gesture-handler';
import CommentItem from './CommentItem';
import { useAuth } from '~/context/AuthContext';
import ErrorScreen from './ErrorScreen';
import Toast from 'react-native-toast-message';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CommentForm from './CommentForm';
import { useMedia } from '~/store/mediaStore';

interface MediaCommentSectionProps {
  mediaType: 'movie' | 'tv';
  mediaId: number;
}

export default function MediaCommentSection({ mediaType, mediaId }: MediaCommentSectionProps) {
  const { fetchedComments, fetchCommentsForMedia, postComment } = useComments();
  const { mediaDetails, fetchMediaDetails } = useMedia();
  const { user } = useAuth();
  const theme = useTheme();

  const mediaState = mediaDetails[mediaId];
  const details = mediaState?.details ?? null;
  const detailsLoading = mediaState?.isLoading ?? false;
  const hasFetchedDetails = mediaState?.hasFetched ?? false;

  const [timestamp, setTimestamp] = useState(0);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const contextKey =
    mediaType === 'movie' ? `media-${mediaId}` : `media-${mediaId}-s${season}-e${episode}`;
  const mediaComments = fetchedComments[contextKey];
  const comments = mediaComments?.comments ?? [];
  const isLoading = mediaComments?.isLoading ?? false;
  const error = mediaComments?.error ?? null;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!hasFetchedDetails) {
      fetchMediaDetails(mediaId);
    }
  }, [mediaId, hasFetchedDetails]);

  useEffect(() => {
    if (mediaType === 'movie') {
      fetchCommentsForMedia({ mediaId });
    } else {
      fetchCommentsForMedia({
        mediaId,
        seasonNumber: season,
        episodeNumber: episode,
      });
    }
  }, [mediaId, mediaType, season, episode]);

  const handleSubmitComment = async (content: string) => {
    const result = await postComment({
      content,
      media_id: mediaId,
      timestamp_seconds: timestamp,
      season_number: mediaType === 'movie' ? null : season,
      episode_number: mediaType === 'movie' ? null : episode,
      parent_comment_id: null,
      is_spoiler: false,
    });

    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Comment Posted!',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    } else {
      Toast.show({
        type: 'error',
        text1: result.error || 'Failed to post your comment',
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
    }
  };

  const TimestampSkeleton = () => (
    <View className="py-2">
      <View className="mb-2 h-9 animate-pulse rounded-lg bg-primary-200 dark:bg-primary-700" />
      <View className="h-6 animate-pulse rounded-lg bg-primary-200 dark:bg-primary-700" />
    </View>
  );

  return (
    <View className="flex-1">
      <View className="px-4">
        {!details || detailsLoading ? (
          <TimestampSkeleton />
        ) : details ? (
          <TimestampPicker
            mediaType={mediaType}
            details={details}
            selectedTimestamp={timestamp}
            selectedSeason={season}
            selectedEpisode={episode}
            onTimestampChange={setTimestamp}
            onSeasonChange={setSeason}
            onEpisodeChange={setEpisode}
          />
        ) : null}
      </View>
      {isLoading ? (
        <ActivityIndicator
          className="flex-1 items-center justify-center"
          color={theme.primary[950]}
        />
      ) : error ? (
        <ErrorScreen fullScreen={false} title="Error!" message={error} />
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 110,
          }}
          renderItem={({ item, index }) => (
            <CommentItem comment={item} isUser={item.user_id === user?.id} />
          )}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
      <View
        style={{
          position: 'absolute',
          left: 4,
          right: 4,
          bottom: 16,
          zIndex: 1000,
          elevation: 10,
        }}>
        <View
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
            <View className="px-4 py-3">
              <CommentForm mode="create" timestamp={timestamp} onSubmit={handleSubmitComment} />
            </View>
          </BlurView>
        </View>
      </View>
    </View>
  );
}
