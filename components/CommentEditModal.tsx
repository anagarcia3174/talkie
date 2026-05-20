import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CommentForm, { CommentFormProps } from './CommentForm';
import TimestampPicker from './TimestampPicker';
import { useMedia } from '~/store/mediaStore';
import BottomSheet from './BottomSheet';
import { X } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';

interface CommentEditModalProps {
  visible: boolean;
  onClose: () => void;
  commentFormProps: CommentFormProps;
  initialTimestamp: number;
  mediaType: 'movie' | 'tv';
  mediaId: number;
  season?: number;
  episode?: number;
  onSubmit: (content: string, timestamp: number) => Promise<void>;
}

export default function CommentEditModal({
  visible,
  onClose,
  commentFormProps,
  initialTimestamp,
  mediaType,
  mediaId,
  season = 1,
  episode = 1,
  onSubmit,
}: CommentEditModalProps) {
  const { mediaDetails } = useMedia();
  const theme = useTheme();
  const mediaState = mediaDetails[mediaId];
  const details = mediaState?.details ?? null;
  const isLoading = mediaState?.isLoading ?? false;
  const error = mediaState?.error ?? null;
  const [timestamp, setTimestamp] = useState(initialTimestamp);
  const canEdit = !error && !!details;

  const handleTimestampChange = (newTimestamp: number) => {
    setTimestamp(newTimestamp);
  };
  const TimestampSkeleton = () => (
    <>
      <View className="h-9 animate-pulse rounded-lg bg-primary-200 dark:bg-primary-700" />
    </>
  );

  return (
    <BottomSheet isVisible={visible} onClose={onClose}>
      <View className="flex-row items-center justify-between">
        <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
          Edit Comment
        </Text>
        <TouchableOpacity
          onPress={onClose}
          className="rounded-lg bg-primary-200 p-1 dark:bg-primary-800">
          <X size={20} color={theme.primary[950]} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Timestamp picker — season/episode are fixed (no-ops) since those aren't editable */}
      {isLoading ? (
        <TimestampSkeleton />
      ) : error ? (
        <View>
          <Text className="text-sm text-red-500">Failed to load media details.</Text>
        </View>
      ) : details ? (
        <View className="mb-4">
          <View className="-mx-4">
            <TimestampPicker
              mediaId={mediaId}
              mediaType={mediaType}
              details={details}
              selectedTimestamp={timestamp}
              selectedSeason={season}
              selectedEpisode={episode}
              onTimestampChange={handleTimestampChange}
              onSeasonChange={() => {}}
              onEpisodeChange={() => {}}
              pickersDisabled
            />
          </View>
          <CommentForm
            {...commentFormProps}
            timestamp={timestamp}
            onSubmit={async (content: string) => {
              if (!canEdit) return;
              await onSubmit(content, timestamp);
            }}
          />
        </View>
      ) : null}
    </BottomSheet>
  );
}
