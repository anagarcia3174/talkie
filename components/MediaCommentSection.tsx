import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, View, FlatList } from 'react-native';
import TimestampPicker from './TimestampPicker';
import { useComment } from '~/store/commentStore';
import { useTheme } from '~/hooks/useTheme';
import CommentItem from './CommentItem';
import { useAuth } from '~/context/AuthContext';
import ErrorScreen from './ErrorScreen';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CommentForm from './CommentForm';
import { useMedia } from '~/store/mediaStore';
import { haptics } from '~/utils/haptics';
import { CommentWithUser, MovieDetails, TVDetails } from '~/types/supabaseTypes';
import { useProfile } from '~/store/profileStore';
import { useRouter } from 'expo-router';

interface MediaCommentSectionProps {
  mediaType: 'movie' | 'tv';
  mediaId: number;
  releaseDate?: string | null;
  mediaTitle: string;
}

const hasDatePassed = (dateString?: string | null) => {
  if (!dateString) return false;

  const now = new Date();
  const date = new Date(dateString + 'T00:00:00'); // 👈 normalize

  return date <= now;
};

export default function MediaCommentSection({
  mediaType,
  mediaId,
  releaseDate,
  mediaTitle,
}: MediaCommentSectionProps) {
  const { fetchedComments, fetchCommentsForMedia, postComment } = useComment();
  const { adjustProfileStats } = useProfile();
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
  const comments = useMemo(() => mediaComments?.comments ?? [], [mediaComments]);
  const isLoading = mediaComments?.isLoading ?? false;
  const error = mediaComments?.error ?? null;
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<CommentWithUser>>(null);
  const [highlightedCommentId, setHighlightedCommentId] = useState<number | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  useEffect(() => {
    if (!details) return;

    // MOVIE
    if (mediaType === 'movie') {
      const runtime = (details as MovieDetails).runtime_minutes;

      if (runtime == null) {
        if (timestamp !== 0) setTimestamp(0);
        return;
      }

      const maxSeconds = runtime * 60;
      if (timestamp > maxSeconds) {
        setTimestamp(maxSeconds); // or maxSeconds if you prefer clamping
      }

      return;
    }

    // TV
    const tvDetails = details as TVDetails;
    const episodeList = tvDetails.episodes?.[season];
    const selectedEpisode = episodeList?.find((ep) => ep.episode_number === episode);

    if (!selectedEpisode || selectedEpisode.runtime_minutes == null) {
      if (timestamp !== 0) setTimestamp(0);
      return;
    }

    const maxSeconds = selectedEpisode.runtime_minutes * 60;

    if (timestamp > maxSeconds) {
      setTimestamp(maxSeconds); // or maxSeconds
    }
  }, [details, mediaType, season, episode, timestamp]);

  useEffect(() => {
    if (!hasFetchedDetails) {
      fetchMediaDetails(mediaId);
    }
  }, [mediaId, hasFetchedDetails, fetchMediaDetails]);

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
  }, [mediaId, mediaType, season, episode, fetchCommentsForMedia]);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    };
  }, []);

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
      haptics.success();
      Toast.show({
        type: 'success',
        text1: 'Comment Posted!',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        onPress: () => Toast.hide(),
      });
      adjustProfileStats({ comments: 1 });
    } else {
      haptics.error();
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

  const handleSlidingComplete = useCallback(
    (seconds: number) => {
      let bestIndex = -1;
      let bestDiff = Infinity;

      comments.forEach((comment, index) => {
        if (comment.timestamp_seconds === null) return;
        const diff = Math.abs(comment.timestamp_seconds - seconds);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestIndex = index;
        }
      });

      if (bestIndex === -1) return;

      flatListRef.current?.scrollToIndex({ index: bestIndex, animated: true, viewPosition: 0.3 });

      const target = comments[bestIndex];
      setHighlightedCommentId(target.id);

      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = setTimeout(() => setHighlightedCommentId(null), 1500);
    },
    [comments]
  );

  const TimestampSkeleton = () => (
    <View className="py-2">
      <View className="mb-2 h-9 animate-pulse rounded-lg bg-primary-200 dark:bg-primary-700" />
      <View className="h-6 animate-pulse rounded-lg bg-primary-200 dark:bg-primary-700" />
    </View>
  );

  const disabledReason = useMemo(() => {
    if (!details) return 'Loading...';

    // 🎬 MOVIE
    if (mediaType === 'movie') {
      const movieDetails = details as MovieDetails;

      if (movieDetails.runtime_minutes == null) {
        return 'Runtime not available yet';
      }

      if (!hasDatePassed(releaseDate)) {
        return 'Movie not released yet';
      }

      return null;
    }

    // 📺 TV
    const tvDetails = details as TVDetails;
    const episodeList = tvDetails.episodes?.[season];
    const selectedEpisode = episodeList?.find((ep) => ep.episode_number === episode);

    if (!selectedEpisode) return 'Episode not available';

    if (selectedEpisode.runtime_minutes == null) {
      return 'Episode runtime not available yet';
    }

    if (!hasDatePassed(selectedEpisode.air_date)) {
      return 'Episode not aired yet';
    }

    return null;
  }, [details, mediaType, season, episode, releaseDate]);

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
            onSlidingComplete={handleSlidingComplete}
            onOpenLiveMode={() => {
              router.push({
                pathname: '/media/[id]/live',
                params: {
                  id: mediaId,
                  mediaType,
                  mediaTitle,
                  season,
                  episode,
                  timestamp,
                },
              });
            }}
          />
        ) : null}
      </View>
      {isLoading ? (
        <ActivityIndicator
          className="flex-1 items-center justify-center"
          color={theme.primary[950]}
        />
      ) : error ? (
        <ErrorScreen
          fullScreen={false}
          title="Oops!"
          message={error}
          onRetry={() =>
            mediaType === 'movie'
              ? fetchCommentsForMedia({ mediaId, force: true })
              : fetchCommentsForMedia({ mediaId, seasonNumber: season, episodeNumber: episode, force: true })
          }
        />
      ) : (
        <View
          className={`mx-4 mt-2 flex-1 overflow-hidden rounded-t-2xl ${comments.length > 0 ? 'bg-primary-100 dark:bg-primary-900' : ''}`}>
          <FlatList
            ref={flatListRef}
            style={{ flex: 1 }}
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 110 }}
            onScrollToIndexFailed={(info) => {
              flatListRef.current?.scrollToOffset({
                offset: info.index * info.averageItemLength,
                animated: true,
              });
            }}
            ItemSeparatorComponent={() => (
              <View className="mx-2 h-px bg-primary-200 dark:bg-primary-700" />
            )}
            renderItem={({ item }) => (
              <CommentItem
                comment={item}
                isUser={item.user_id === user?.id}
                highlighted={item.id === highlightedCommentId}
              />
            )}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          />
        </View>
      )}
      <View
        style={{
          marginBottom: insets.bottom * 0.3,
        }}
        className="overflow-hidden border-t border-primary-200 bg-primary-50 px-3 py-4 dark:border-primary-800 dark:bg-primary-950">
        <CommentForm
          mode="create"
          timestamp={timestamp}
          onSubmit={handleSubmitComment}
          disabled={!!disabledReason}
          disabledReason={disabledReason}
        />
      </View>
    </View>
  );
}
