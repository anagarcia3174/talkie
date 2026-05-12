import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import RecentComment from '~/components/RecentComment';
import { useComments } from '~/store/commentStore';

export default function RecentCommentsSection() {
  const recentComments = useComments((s) => s.recentCommentsFeed.recentComments);
  const isLoading = useComments((s) => s.recentCommentsFeed.isLoading);
  const hasFetched = useComments((s) => s.recentCommentsFeed.hasFetched);
  const fetchRecentCommentsFeed = useComments((s) => s.fetchRecentCommentsFeed);

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
