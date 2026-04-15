import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { MovieDetails, TVDetails, TVEpisode } from '~/types/supabaseTypes';
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
  pickersDisabled?: boolean;
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
  pickersDisabled = false,
}: TimestampPickerProps) {
  const theme = useTheme();
  const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  const tvDetails = mediaType === 'tv' ? (details as TVDetails) : null;

  const availableEpisodes = useMemo((): TVEpisode[] => {
    if (!tvDetails || selectedSeason === undefined) {
      return [];
    }

    return (tvDetails.episodes?.[selectedSeason] ?? []).filter(
      (episode) => episode.air_date !== null && episode.air_date <= today
    );
  }, [tvDetails, selectedSeason, today]);

  // --------------------------------------------------
  // Duration Calculation
  // --------------------------------------------------

  const durationSeconds = useMemo(() => {
    if (mediaType === 'movie') {
      const movie = details as MovieDetails;
      return (movie.runtime_minutes ?? 0) * 60;
    }

    if (mediaType === 'tv' && selectedEpisode !== undefined) {
      const episode = availableEpisodes.find((ep) => ep.episode_number === selectedEpisode);

      return (episode?.runtime_minutes ?? 0) * 60;
    }

    return 0;
  }, [mediaType, details, selectedEpisode, availableEpisodes]);

  const formatTime = (seconds: number) => {
    if (seconds >= 3600) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isDisabled = durationSeconds === 0;

  return (
    <View className="">
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
            disabled={pickersDisabled}
          />
          {selectedSeason !== undefined && availableEpisodes.length > 0 && (
            <CompactDropdown
              label="Episode"
              items={availableEpisodes}
              selectedValue={selectedEpisode}
              getLabel={(ep) => `Episode ${ep.episode_number}`}
              getValue={(ep) => ep.episode_number}
              onSelect={(val) => {
                onEpisodeChange?.(val);
                onTimestampChange(0);
              }}
              disabled={pickersDisabled}
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
