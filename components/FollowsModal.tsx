import { UserRound, X } from 'lucide-react-native';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getPublicUrl } from '~/utils/storageUrl';
import BottomSheet from './BottomSheet';
import FollowButton from './FollowButton';
import { useTheme } from '~/hooks/useTheme';
import { useFollow } from '~/store/followStore';
import { useEffect } from 'react';
import { useAuth } from '~/context/AuthContext';
import { useRouter } from 'expo-router';

interface FollowsModalProps {
  checking: 'followers' | 'following';
  visible: boolean;
  onClose: () => void;
}

export default function FollowsModal({ checking, visible, onClose }: FollowsModalProps) {
  const {
    followerIds,
    followingIds,
    followers,
    following,
    isLoadingFollowers,
    isLoadingFollowing,
    followersError,
    followingError,
    fetchFollowers,
    fetchFollowing,
  } = useFollow();
  const theme = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const isLoading = checking === 'followers' ? isLoadingFollowers : isLoadingFollowing;
  const error = checking === 'followers' ? followersError : followingError;
  const list = checking === 'followers' ? followers : following;

  useEffect(() => {
    if (!visible || !user) return;

    if (checking === 'followers') {
      const profileIds = new Set(followers.map((u) => u.id));
      const isOutOfSync =
        followerIds.size !== profileIds.size ||
        [...followerIds].some((id) => !profileIds.has(id));
      if (isOutOfSync) fetchFollowers();
    } else {
      const profileIds = new Set(following.map((u) => u.id));
      const isOutOfSync =
        followingIds.size !== profileIds.size ||
        [...followingIds].some((id) => !profileIds.has(id));
      if (isOutOfSync) fetchFollowing();
    }
  }, [
    visible,
    user,
    checking,
    followerIds,
    followingIds,
    followers,
    following,
    fetchFollowers,
    fetchFollowing,
  ]);

  return (
    <BottomSheet isVisible={visible} onClose={onClose}>
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
          {checking === 'followers' ? 'Followers' : 'Following'}
        </Text>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={8}
          className="rounded-lg bg-primary-200 p-1 dark:bg-primary-800">
          <X size={20} color={theme.primary[950]} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {isLoading && list.length === 0 && (
        <View className="items-center py-6">
          <ActivityIndicator color={theme.primary[500]} />
        </View>
      )}

      {error && !isLoading && (
        <View className="items-center gap-3 py-6">
          <Text className="font-SpaceGrotesk-Regular text-base text-red-500">{error}</Text>
          <TouchableOpacity
            onPress={() => (checking === 'followers' ? fetchFollowers() : fetchFollowing())}
            className="rounded-lg bg-primary-200 px-4 py-2 dark:bg-primary-800">
            <Text className="font-SpaceGrotesk-Medium text-sm text-primary-700 dark:text-primary-300">
              Try again
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !error && checking === 'followers' && followers.length === 0 && (
        <Text className="font-SpaceGrotesk-Regular text-base text-neutral-500 dark:text-neutral-400">
          No followers yet.
        </Text>
      )}

      {!isLoading && !error && checking === 'following' && following.length === 0 && (
        <Text className="font-SpaceGrotesk-Regular text-base text-neutral-500 dark:text-neutral-400">
          You&apos;re not following anyone yet.
        </Text>
      )}

      <View className="max-h-[55vh]">
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="mb-2 flex-row items-center justify-between rounded-xl bg-primary-200 p-3 dark:bg-primary-800">
              <TouchableOpacity
                disabled={item.is_private || item.is_deleted}
                className="flex-1 flex-row items-center"
                onPress={() => {
                  if (!item.is_private) {
                    onClose();
                    router.push({ pathname: '/profile/[id]', params: { id: item.id } });
                  }
                }}>
                {item.avatar_url ? (
                  <Image
                    source={{ uri: getPublicUrl(item.avatar_url) }}
                    className="mr-3 h-12 w-12 rounded-full bg-neutral-200"
                  />
                ) : (
                  <View className="mr-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
                    <UserRound size={12} color={theme.primary[900]} />
                  </View>
                )}
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className="flex-1 font-SpaceGrotesk-Regular text-lg text-primary-900 dark:text-primary-100">
                  {item.display_name}
                </Text>
              </TouchableOpacity>
              <FollowButton targetUserId={item.id} targetProfile={item} isSmall />
            </View>
          )}
        />
      </View>
      <View className="items-center">
        <Text className="font-SpaceGrotesk-Regular text-sm text-primary-400 dark:text-primary-600">
          {list.length} total
        </Text>
      </View>
    </BottomSheet>
  );
}
