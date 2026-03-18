import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { MovieDetails, TVDetails } from '~/types/supabaseTypes';
import TimestampPicker from './TimestampPicker';
import PostCommentForm from './PostCommentForm';
import { useComments } from '~/store/commentStore';
import { useTheme } from '~/hooks/useTheme';
import { FlatList } from 'react-native-gesture-handler';
import CommentItem from './CommentItem';
import { useAuth } from '~/context/AuthContext';

interface MediaCommentSectionProps {
  mediaType: 'movie' | 'tv';
  mediaId: number;
  details?: MovieDetails | TVDetails;
  detailsLoading: boolean;
}

export default function MediaCommentSection({
  mediaType,
  mediaId,
  details,
  detailsLoading,
}: MediaCommentSectionProps) {
  const { fetchedComments, fetchCommentsForMedia } = useComments();
  const theme = useTheme();
  const { user } = useAuth();
  const [timestamp, setTimestamp] = useState(0);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const contextKey =
    mediaType === 'movie' ? `media-${mediaId}` : `media-${mediaId}-s${season}-e${episode}`;
  const mediaComments = fetchedComments[contextKey];
  const comments = mediaComments?.comments ?? [];
  const isLoading = mediaComments?.isLoading ?? false;
  const error = mediaComments?.error ?? null;
  

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

  const TimestampSkeleton = () => (
    <View className="px-4 py-2">
      <View className="mb-2 h-9 animate-pulse rounded-lg bg-primary-200 dark:bg-primary-700" />
      <View className="h-6 animate-pulse rounded-lg bg-primary-200 dark:bg-primary-700" />
    </View>
  );

  return (
    <View className="flex-1">
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
      {isLoading ? (
        <ActivityIndicator
          className="flex-1 items-center justify-center"
          color={theme.primary[950]}
        />
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
            <CommentItem
              comment={item}
              isUser={item.user_id === user?.id}
            />
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
        <PostCommentForm
          mediaId={mediaId}
          timestamp={timestamp}
          season={mediaType === 'tv' ? season : null}
          episode={mediaType === 'tv' ? episode : null}
        />
      </View>
    </View>
  );
}
