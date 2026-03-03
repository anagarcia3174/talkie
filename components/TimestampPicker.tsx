import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { MovieDetails, TVDetails } from '~/types/supabaseTypes';
import { useTheme } from '~/hooks/useTheme';
import CompactDropdown from './CompactDropdown';

interface TimestampPickerProps {
  mediaType: 'movie' | 'tv';
  details: MovieDetails | TVDetails;

  selectedTimestamp: number;
  selectedSeason?: number;
  selectedEpisode?: number;

  onTimestampChange: (seconds: number) => void;
  onSeasonChange?: (season: number) => void;
  onEpisodeChange?: (episode: number) => void;
}

export default function TimestampPicker({
  mediaType,
  details,
  selectedTimestamp,
  selectedSeason,
  selectedEpisode,
  onTimestampChange,
  onSeasonChange,
  onEpisodeChange,
}: TimestampPickerProps) {
  const theme = useTheme();

  // --------------------------------------------------
  // Duration Calculation
  // --------------------------------------------------

  const durationSeconds = useMemo(() => {
    if (mediaType === 'movie') {
      const movie = details as MovieDetails;
      return (movie.runtime_minutes ?? 0) * 60;
    }

    if (mediaType === 'tv' && selectedSeason !== undefined && selectedEpisode !== undefined) {
      const tv = details as TVDetails;

      const seasonEpisodes = tv.episodes?.[selectedSeason];
      const episode = seasonEpisodes?.find((ep) => ep.episode_number === selectedEpisode);

      return (episode?.runtime_minutes ?? 0) * 60;
    }

    return 0;
  }, [mediaType, details, selectedSeason, selectedEpisode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isDisabled = durationSeconds === 0;

  const tvDetails = mediaType === 'tv' ? (details as TVDetails) : null;

  return (
    <View className="px-4">
      {/* ---------------- TV PICKERS ---------------- */}
      {mediaType === 'tv' && tvDetails && (
        <View className="mb-3 flex-row gap-1">
          <CompactDropdown
            label="Season"
            items={tvDetails.seasons}
            selectedValue={selectedSeason}
            getLabel={(s) => `Season ${s.season_number}`}
            getValue={(s) => s.season_number}
            onSelect={(val) => {
              onSeasonChange?.(val);
              onTimestampChange(0);
            }}
          />
          {selectedSeason && tvDetails.episodes?.[selectedSeason] && (
            <CompactDropdown
              label="Episode"
              items={tvDetails.episodes[selectedSeason]}
              selectedValue={selectedEpisode}
              getLabel={(ep) => `Episode ${ep.episode_number}`}
              getValue={(ep) => ep.episode_number}
              onSelect={(val) => {
                onEpisodeChange?.(val);
                onTimestampChange(0);
              }}
            />
          )}
        </View>
      )}

      {/* ---------------- SLIDER ---------------- */}
      <View className="flex-row items-center gap-x-2">
        <Text className="text-center font-SpaceGrotesk-Regular text-sm text-primary-700 dark:text-primary-400">
          {formatTime(selectedTimestamp)}
        </Text>

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={durationSeconds}
          step={1}
          value={selectedTimestamp}
          onValueChange={onTimestampChange}
          disabled={isDisabled}
          minimumTrackTintColor={theme.primary[700]}
          maximumTrackTintColor={theme.primaryOpacity[700]}
          thumbTintColor={theme.primary[700]}
        />

        <Text className="text-center font-SpaceGrotesk-Regular text-sm text-primary-700 dark:text-primary-400">
          {formatTime(durationSeconds)}
        </Text>
      </View>
    </View>
  );
}

// --------------------------------------------------
// Styles
// --------------------------------------------------

const styles = StyleSheet.create({
  pickerWrapper: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  slider: {
    flex: 1,
  },
});
