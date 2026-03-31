import { UserRound } from 'lucide-react-native';
import { Modal, View, TouchableOpacity, Text, FlatList, Image } from 'react-native';
import { getPublicUrl } from '~/utils/storageUrl';
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
  const { followerIds, followingIds, followers, following, getFollowers, getFollowing } =
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
        const result = await getFollowers(user.id);

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
        const result = await getFollowing(user.id);

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
    getFollowers,
    getFollowing,
  ]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <TouchableOpacity activeOpacity={1} onPress={onClose} className="absolute inset-0" />
        <View className="max-h-[70%] w-full rounded-3xl bg-white p-6 dark:bg-neutral-900">
          {/* Header */}
          <Text className="mb-5 font-SpaceGrotesk-Medium text-xl text-primary-900 dark:text-primary-100">
            {checking === 'followers' ? 'Followers' : 'Following'}
          </Text>

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
                    checking === 'followers' ? getFollowers(user.id) : getFollowing(user.id);
                  }}>
                  <Text className="text-primary-600">Retry</Text>
                </TouchableOpacity>
              </View>
            )}

          {!loading && !error && checking === 'followers' && followers.length === 0 && (
            <Text className="text-base text-neutral-500 dark:text-neutral-400">
              No followers yet.
            </Text>
          )}

          {!loading && !error && checking === 'following' && following.length === 0 && (
            <Text className="text-base text-neutral-500 dark:text-neutral-400">
              You're not following anyone yet.
            </Text>
          )}

          <FlatList
            data={checking === 'followers' ? followers : following}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 10 }}
            renderItem={({ item }) => (
              <View className="flex-row items-center justify-between border-b border-neutral-200 py-4 dark:border-neutral-800">
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
                <FollowButton targetUserId={item.id} isSmall />
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}
