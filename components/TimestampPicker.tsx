import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MovieDetails, TVDetails, TVEpisode } from '~/types/supabaseTypes';
import { useTheme } from '~/hooks/useTheme';
import CompactDropdown from './CompactDropdown';
import { haptics } from '~/utils/haptics';
import { SquareArrowOutUpRight } from 'lucide-react-native';
import TimestampSlider from './TimestampSlider';

interface TimestampPickerProps {
  mediaType: 'movie' | 'tv';
  details: MovieDetails | TVDetails;

  selectedTimestamp: number;
  selectedSeason?: number;
  selectedEpisode?: number;

  onTimestampChange: (seconds: number) => void;
  onSlidingComplete?: (seconds: number) => void;
  onSeasonChange?: (season: number) => void;
  onEpisodeChange?: (episode: number) => void;
  pickersDisabled?: boolean;
  onOpenLiveMode?: () => void;
}

export default function TimestampPicker({
  mediaType,
  details,
  selectedTimestamp,
  selectedSeason,
  selectedEpisode,
  onTimestampChange,
  onSlidingComplete,
  onSeasonChange,
  onEpisodeChange,
  pickersDisabled = false,
  onOpenLiveMode,
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

  const nudge = (delta: number) => {
    haptics.action();
    const next = Math.max(0, Math.min(durationSeconds, selectedTimestamp + delta));
    onTimestampChange(next);
    onSlidingComplete?.(next);
  };

  const nudgeButtons: { label: string; delta: number }[] = [
    { label: '−10', delta: -10 },
    { label: '−1', delta: -1 },
    { label: '+1', delta: 1 },
    { label: '+10', delta: 10 },
  ];

  return (
    <View className="gap-2 rounded-2xl bg-primary-100 p-2 dark:bg-primary-900">
      <View className="flex-row gap-x-1">
        {mediaType === 'tv' && tvDetails && (
          <CompactDropdown
            label="Season?"
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
        )}
        {mediaType === 'tv' &&
          tvDetails &&
          selectedSeason !== undefined &&
          availableEpisodes.length > 0 && (
            <CompactDropdown
              label="Episode?"
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
        <TouchableOpacity
          disabled={isDisabled}
          onPress={onOpenLiveMode}
          className="flex-1 flex-row items-center justify-center gap-x-1.5 rounded-lg bg-primary-200 px-2.5 py-1 disabled:opacity-70 dark:bg-primary-800">
          <SquareArrowOutUpRight size={14} color={theme.primary[600]} />
          <Text className="text-md font-SpaceGrotesk-Medium text-primary-900 dark:text-primary-200 ">
            Live
          </Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center gap-1">
        <Text className="font-SpaceGrotesk-Regular text-lg text-primary-600 dark:text-primary-400">
          {formatTime(selectedTimestamp)}
        </Text>
        <TimestampSlider
          minimumValue={0}
          maximumValue={durationSeconds}
          step={1}
          value={selectedTimestamp}
          onValueChange={onTimestampChange}
          onSlidingComplete={onSlidingComplete}
          disabled={isDisabled}
          minimumTrackColor={theme.primary[800]}
          maximumTrackColor={theme.primaryOpacity[800]}
          thumbColor={theme.primary[800]}
        />
        <Text className="font-SpaceGrotesk-Regular text-lg text-primary-600 dark:text-primary-400">
          {formatTime(durationSeconds)}
        </Text>
      </View>
      <View className="flex-row gap-x-1">
        {nudgeButtons.map(({ label, delta }) => (
          <TouchableOpacity
            key={label}
            onPress={() => nudge(delta)}
            disabled={isDisabled}
            style={styles.nudgeButton}
            className="flex-1 items-center justify-center rounded-lg bg-primary-200 py-0.5 dark:bg-primary-800">
            <Text className="font-SpaceGrotesk-Medium text-xs text-primary-600 dark:text-primary-400">
              {label}s
            </Text>
          </TouchableOpacity>
        ))}
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
  nudgeButton: {
    minHeight: 24,
  },
});
