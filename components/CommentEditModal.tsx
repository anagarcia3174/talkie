import { useState } from 'react';
import { Modal, Pressable, View, Text } from 'react-native';
import CommentForm, { CommentFormProps } from './CommentForm';
import TimestampPicker from './TimestampPicker';
import { useMedia } from '~/store/mediaStore';

interface CommentEditModalProps {
  visible: boolean;
  onClose: () => void;
  commentFormProps: CommentFormProps;
  initialTimestamp: number;
  mediaType: 'movie' | 'tv';
  mediaId: number; // ✅ ADD THIS
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
    <View className="px-4 py-2">
      <View className="mb-2 h-9 animate-pulse rounded-lg bg-primary-200 dark:bg-primary-700" />
      <View className="h-6 animate-pulse rounded-lg bg-primary-200 dark:bg-primary-700" />
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable className="flex-1 items-center justify-center bg-black/60 dark:bg-black/70 px-6" onPress={onClose}>
        {/* Card — stop propagation so tapping inside doesn't close the modal */}
        <Pressable className="w-full" onPress={(e) => e.stopPropagation()}>
          <View className="w-full rounded-2xl bg-primary-100 p-4 shadow-2xl dark:bg-primary-900">
            <Text className="mb-4 font-SpaceGrotesk-SemiBold text-lg text-primary-950 dark:text-primary-50">
              Edit Comment
            </Text>

            {/* Timestamp picker — season/episode are fixed (no-ops) since those aren't editable */}
            {isLoading ? (
              <TimestampSkeleton />
            ) : error ? (
              <View className="mb-4">
                <Text className="text-sm text-red-500">Failed to load media details.</Text>
              </View>
            ) : details ? (
              <View className="mb-4">
                <TimestampPicker
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
            ) : null}

            {/* Comment text editor */}
            <View className="rounded-xl border border-primary-300 bg-primary-200 dark:border-primary-900 dark:bg-primary-800">
              <CommentForm
                {...commentFormProps}
                timestamp={timestamp}
                onSubmit={async (content: string) => {
                  if (!canEdit) return;
                  await onSubmit(content, timestamp);
                }}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
