import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { MovieDetails, TVDetails } from '~/types/supabaseTypes';
import TimestampPicker from './TimestampPicker';
import PostCommentForm from './PostCommentForm';

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
  const [timestamp, setTimestamp] = useState(0);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

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
