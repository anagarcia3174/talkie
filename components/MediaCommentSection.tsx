import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { MovieDetails, TVDetails } from '~/types/supabaseTypes';
import TimestampPicker from './TimestampPicker';
import PostCommentForm from './PostCommentForm';
import { useComments } from '~/store/commentStore';
import { useTheme } from '~/hooks/useTheme';
import { FlatList } from 'react-native-gesture-handler';

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1">
      <View className="flex-1 justify-between">
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
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={({ item }) => (
              <View className="bg-primary-50 px-4 py-2">
                <Text className="text-xl text-primary-950">{item.content}</Text>
              </View>
            )}
          />
        )}

        <PostCommentForm
          mediaId={mediaId}
          timestamp={timestamp}
          season={mediaType === 'tv' ? season : null}
          episode={mediaType === 'tv' ? episode : null}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
