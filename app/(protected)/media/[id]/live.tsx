import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MessageSquareText, Settings } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import CommentForm from '~/components/CommentForm';
import LiveCommentItem from '~/components/LiveCommentItem';
import LiveSettingsModal, {
  DEFAULT_LIVE_SETTINGS,
  LiveSettings,
} from '~/components/LiveSettingsModal';
import TimestampPicker from '~/components/TimestampPicker';
import { useAuth } from '~/context/AuthContext';
import { useTheme } from '~/hooks/useTheme';
import { useComment } from '~/store/commentStore';
import { useMedia } from '~/store/mediaStore';
import { useProfile } from '~/store/profileStore';
import { CommentWithUser } from '~/types/supabaseTypes';
import { haptics } from '~/utils/haptics';

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
  const { fetchedComments, fetchCommentsForMedia, postComment } = useComment();
  const { adjustProfileStats } = useProfile();
  const { user } = useAuth();

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
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [liveSettings, setLiveSettings] = useState<LiveSettings>(DEFAULT_LIVE_SETTINGS);
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef<FlatList<CommentWithUser>>(null);
  const isAutoScrollEnabled = useRef(true);
  const prevVisibleCountRef = useRef(0);

  const contextKey =
    mediaType === 'movie'
      ? `media-${mediaId}`
      : `media-${mediaId}-s${selectedSeason}-e${selectedEpisode}`;
  const mediaComments = fetchedComments[contextKey];
  const comments = useMemo(() => mediaComments?.comments ?? [], [mediaComments]);
  const commentsLoading = mediaComments?.isLoading ?? false;

  const visibleComments = useMemo(
    () =>
      comments.filter(
        (c) => c.timestamp_seconds === null || c.timestamp_seconds <= selectedTimestamp
      ),
    [comments, selectedTimestamp]
  );

  useEffect(() => {
    if (!Number.isFinite(mediaId)) return;
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
        seasonNumber: selectedSeason,
        episodeNumber: selectedEpisode,
      });
    }
  }, [mediaId, mediaType, selectedEpisode, selectedSeason, fetchCommentsForMedia]);

  useEffect(() => {
    if (liveSettings.autoScroll) {
      isAutoScrollEnabled.current = true;
    }
  }, [liveSettings.autoScroll]);

  useEffect(() => {
    const current = visibleComments.length;
    const prev = prevVisibleCountRef.current;
    if (current > prev && liveSettings.autoScroll && isAutoScrollEnabled.current) {
      const t = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
      prevVisibleCountRef.current = current;
      return () => clearTimeout(t);
    }
    prevVisibleCountRef.current = current;
  }, [visibleComments.length, liveSettings.autoScroll]);

  const handleScrollBeginDrag = useCallback(() => {
    isAutoScrollEnabled.current = false;
  }, []);

  const checkIfAtBottom = useCallback(
    ({ nativeEvent }: any) => {
      if (!liveSettings.autoScroll) return;
      const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
      if (contentSize.height - layoutMeasurement.height - contentOffset.y <= 40) {
        isAutoScrollEnabled.current = true;
      }
    },
    [liveSettings.autoScroll]
  );

  const handleSubmitComment = async (content: string) => {
    const postedTimestamp = Math.max(0, selectedTimestamp - liveSettings.typingDelaySeconds);
    const result = await postComment({
      content,
      media_id: mediaId,
      timestamp_seconds: postedTimestamp,
      season_number: parsedMediaType === 'movie' ? null : (selectedSeason ?? null),
      episode_number: parsedMediaType === 'movie' ? null : (selectedEpisode ?? null),
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

  const TimestampSkeleton = () => (
    <View className="py-2">
      <View className="mb-2 h-9 animate-pulse rounded-lg bg-primary-200 dark:bg-primary-700" />
      <View className="h-6 animate-pulse rounded-lg bg-primary-200 dark:bg-primary-700" />
    </View>
  );

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-primary-50 dark:bg-primary-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
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
          <TouchableOpacity
            onPress={() => setSettingsVisible(true)}
            className="rounded-md bg-primary-100 p-1 dark:bg-primary-900">
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
            externalPaused={liveSettings.pauseWhileTyping && isTyping}
          />
        )}
      </View>

      <View className="mx-4 mt-4 flex-1 overflow-hidden">
        {commentsLoading ? (
          <ActivityIndicator className="flex-1" color={theme.primary[500]} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={visibleComments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <LiveCommentItem comment={item} isUser={item.user_id === user?.id} />
            )}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center px-6 py-16">
                <MessageSquareText size={36} color={theme.primary[400]} />
                <Text className="mt-4 text-center font-SpaceGrotesk-Medium text-primary-500 dark:text-primary-400">
                  No comments at this moment yet.{'\n'}Be the first to react!
                </Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onScrollBeginDrag={handleScrollBeginDrag}
            onScrollEndDrag={checkIfAtBottom}
            onMomentumScrollEnd={checkIfAtBottom}
            contentContainerStyle={
              visibleComments.length === 0 ? { flex: 1 } : { paddingBottom: 8 }
            }
            ItemSeparatorComponent={() => (
              <View className="my-1.5 h-px bg-primary-100/50 dark:bg-primary-900/50" />
            )}
          />
        )}
      </View>

      <View
        style={{ marginBottom: insets.bottom * 0.3 }}
        className="overflow-hidden border-t border-primary-200 bg-primary-50 px-3 py-4 dark:border-primary-800 dark:bg-primary-950">
        <CommentForm
          mode="create"
          timestamp={selectedTimestamp}
          onSubmit={handleSubmitComment}
          onFocus={() => setIsTyping(true)}
          onBlur={() => setIsTyping(false)}
        />
      </View>
      </KeyboardAvoidingView>

      <LiveSettingsModal
        isVisible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        settings={liveSettings}
        onApply={(s) => {
          setLiveSettings(s);
          setSettingsVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
