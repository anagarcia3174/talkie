import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Settings } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CommentForm from '~/components/CommentForm';
import TimestampPicker from '~/components/TimestampPicker';
import { useTheme } from '~/hooks/useTheme';
import { useMedia } from '~/store/mediaStore';

export default function LiveScreen() {
  const {
    id,
    mediaType,
    season,
    episode,
    timestamp: initialTimestamp,
    mediaTitle,
  } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const mediaId = Number(id);
  const parsedMediaType = (mediaType as 'movie' | 'tv') ?? 'movie';

  const { mediaDetails, fetchMediaDetails } = useMedia();
  const mediaState = mediaDetails[mediaId];
  const details = mediaState?.details ?? null;
  const detailsLoading = mediaState?.isLoading ?? false;
  const hasFetchedDetails = mediaState?.hasFetched ?? false;

  const [selectedTimestamp, setSelectedTimestamp] = useState(Number(initialTimestamp ?? 0));
  const [selectedSeason, setSelectedSeason] = useState(season ? Number(season) : undefined);
  const [selectedEpisode, setSelectedEpisode] = useState(episode ? Number(episode) : undefined);

  useEffect(() => {
    if (!Number.isFinite(mediaId)) return;
    if (!hasFetchedDetails) {
      fetchMediaDetails(mediaId);
    }
  }, [mediaId, hasFetchedDetails, fetchMediaDetails]);

  const TimestampSkeleton = () => (
    <View className="py-2">
      <View className="mb-2 h-9 animate-pulse rounded-lg bg-primary-200 dark:bg-primary-700" />
      <View className="h-6 animate-pulse rounded-lg bg-primary-200 dark:bg-primary-700" />
    </View>
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-primary-50 dark:bg-primary-950">
      <View className="px-4 pb-3 pt-2">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="rounded-md bg-primary-100 p-1 dark:bg-primary-900">
            <ChevronLeft color={theme.primary[950]} size={20} strokeWidth={2} />
          </TouchableOpacity>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="max-w-[80%] font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
            {mediaTitle}
          </Text>
          <TouchableOpacity className="rounded-md bg-primary-100 p-1 dark:bg-primary-900">
            <Settings color={theme.primary[950]} size={20} />
          </TouchableOpacity>
        </View>
      </View>
      <View className="px-4">
        {!details || detailsLoading ? (
          <TimestampSkeleton />
        ) : (
          <TimestampPicker
            mediaType={parsedMediaType}
            details={details}
            selectedTimestamp={selectedTimestamp}
            selectedSeason={selectedSeason}
            selectedEpisode={selectedEpisode}
            onTimestampChange={setSelectedTimestamp}
            onSeasonChange={setSelectedSeason}
            onEpisodeChange={setSelectedEpisode}
          />
        )}
      </View>

      <View className="flex-1" />

      <View
        style={{ marginBottom: insets.bottom * 0.3 }}
        className="overflow-hidden border-t border-primary-200 bg-primary-50 px-3 py-4 dark:border-primary-800 dark:bg-primary-950">
        <CommentForm mode="create" timestamp={selectedTimestamp} onSubmit={async () => {}} />
      </View>
    </SafeAreaView>
  );
}
