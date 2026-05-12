import { UserRound, X } from 'lucide-react-native';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { getPublicUrl } from '~/utils/storageUrl';
import BottomSheet from './BottomSheet';
import FollowButton from './FollowButton';
import { useTheme } from '~/hooks/useTheme';
import { useFollow } from '~/store/followStore';
import { useEffect, useState } from 'react';
import { useAuth } from '~/context/AuthContext';
import { useRouter } from 'expo-router';

interface FollowsModalProps {
  checking: 'followers' | 'following';
  visible: boolean;
  onClose: () => void;
}

export default function FollowsModal({ checking, visible, onClose }: FollowsModalProps) {
  const { followerIds, followingIds, followers, following, fetchFollowers, fetchFollowing } =
    useFollow();
  const theme = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFollows = async () => {
      if (!visible || !user) return;

      setError(null);

      if (checking === 'followers') {
        const profileIds = new Set(followers.map((u) => u.id));

        const isOutOfSync =
          followerIds.size !== profileIds.size ||
          [...followerIds].some((id) => !profileIds.has(id));

        if (!isOutOfSync) return;

        setLoading(true);
        const result = await fetchFollowers(user.id);

        if (!result.success) {
          setError(result.error);
        }
        setLoading(false);
      }

      if (checking === 'following') {
        const profileIds = new Set(following.map((u) => u.id));

        const isOutOfSync =
          followingIds.size !== profileIds.size ||
          [...followingIds].some((id) => !profileIds.has(id));

        if (!isOutOfSync) return;

        setLoading(true);
        const result = await fetchFollowing(user.id);

        if (!result.success) {
          setError(result.error);
        }
        setLoading(false);
      }
    };

    loadFollows();
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
          className="rounded-lg bg-primary-200 p-1 dark:bg-primary-800">
          <X size={20} color={theme.primary[950]} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {loading &&
        ((checking === 'followers' && followers.length === 0) ||
          (checking === 'following' && following.length === 0)) && (
          <Text className="text-base text-neutral-500 dark:text-neutral-400">Loading...</Text>
        )}

      {error &&
        ((checking === 'followers' && followers.length === 0) ||
          (checking === 'following' && following.length === 0)) && (
          <View>
            <Text className="mb-2 text-base text-red-500">{error}</Text>
            <TouchableOpacity
              onPress={() => {
                if (!user) return;
                if (checking === 'followers') {
                  fetchFollowers(user.id);
                } else {
                  fetchFollowing(user.id);
                }
              }}>
              <Text className="text-primary-600">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

      {!loading && !error && checking === 'followers' && followers.length === 0 && (
        <Text className="text-base text-neutral-500 dark:text-neutral-400">No followers yet.</Text>
      )}

      {!loading && !error && checking === 'following' && following.length === 0 && (
        <Text className="text-base text-neutral-500 dark:text-neutral-400">
          You&apos;re not following anyone yet.
        </Text>
      )}

      <View className="max-h-[55vh]">
        <FlatList
          data={checking === 'followers' ? followers : following}
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
          {checking === 'followers' ? followers.length : following.length} total
        </Text>
      </View>
    </BottomSheet>
  );
}
