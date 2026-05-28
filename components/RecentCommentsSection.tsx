import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import RecentComment from '~/components/RecentComment';
import { useComment } from '~/store/commentStore';

export default function RecentCommentsSection() {
  const recentComments = useComment((s) => s.recentCommentsFeed.recentComments);
  const isLoading = useComment((s) => s.recentCommentsFeed.isLoading);
  const hasFetched = useComment((s) => s.recentCommentsFeed.hasFetched);
  const error = useComment((s) => s.recentCommentsFeed.error);
  const fetchRecentCommentsFeed = useComment((s) => s.fetchRecentCommentsFeed);

  useEffect(() => {
    void fetchRecentCommentsFeed();
  }, [fetchRecentCommentsFeed]);

  if (isLoading && recentComments.length === 0) {
    return (
      <View className="mt-3 items-center justify-center py-4">
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (error && recentComments.length === 0) {
    return (
      <View className="px-4 py-3">
        <Text className="mb-2 font-SpaceGrotesk-SemiBold text-sm uppercase tracking-wide text-primary-500 dark:text-primary-400">
          Recent Comments
        </Text>
        <View className="flex-row items-center gap-3">
          <Text className="font-SpaceGrotesk-Regular text-sm text-red-500">{error}</Text>
          <TouchableOpacity onPress={() => fetchRecentCommentsFeed(true)}>
            <Text className="font-SpaceGrotesk-Medium text-sm text-primary-500 dark:text-primary-400">
              Try again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!hasFetched || recentComments.length === 0) {
    return null;
  }

  return (
    <View className="px-4">
      <Text className="mb-2 font-SpaceGrotesk-SemiBold text-sm uppercase tracking-wide text-primary-500 dark:text-primary-400">
        Recent Comments
      </Text>
      <FlatList
        data={recentComments}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 8 }}
        renderItem={({ item }) => <RecentComment comment={item} />}
      />
    </View>
  );
}
