import { UserRound, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Text, View, TouchableOpacity, Image } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { useAuth } from '~/context/AuthContext';
import { useTheme } from '~/hooks/useTheme';
import { useBlock } from '~/store/blockStore';
import { haptics } from '~/utils/haptics';
import { getPublicUrl } from '~/utils/storageUrl';
import BottomSheet from './BottomSheet';

interface BlockedUsersModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function BlockedUsersModal({ visible, onClose }: BlockedUsersModalProps) {
  const { blockedIds, blockedUsers, getBlockedUsers, unblock } = useBlock();
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlockedUsers = async () => {
      if (!visible || !user) return;

      if (blockedIds.size === blockedUsers.length) return;

      setLoading(true);
      setError(null);

      await getBlockedUsers();

      setLoading(false);
    };

    loadBlockedUsers();
  }, [visible, user, blockedIds, blockedUsers.length, getBlockedUsers]);

  const handleUnblock = async (targetUserId: string) => {
    if (!user) return;
    const result = await unblock(user.id, targetUserId);
    onClose();
    if (!result.success) {
      haptics.error();
      Toast.show({
        type: 'error',
        text1: result.error || 'Failed to unblock the user.',
        visibilityTime: 3000,
        autoHide: true,
      });
    } else {
      haptics.success();
      Toast.show({
        type: 'success',
        text1: 'User was unblocked.',
        visibilityTime: 3000,
        autoHide: true,
      });
    }
  };

  return (
    <BottomSheet isVisible={visible} onClose={onClose}>
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
          Blocked Users
        </Text>
        <TouchableOpacity
          onPress={onClose}
          className="rounded-lg bg-primary-200 p-1 dark:bg-primary-800">
          <X size={20} color={theme.primary[950]} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {loading && blockedUsers.length === 0 && (
        <Text className="font-SpaceGrotesk-Regular text-base text-neutral-500 dark:text-neutral-400">
          Loading blocked users...
        </Text>
      )}

      {error && blockedUsers.length === 0 && (
        <Text className="mb-2 font-SpaceGrotesk-Regular text-base text-red-500">{error}</Text>
      )}

      {/* Empty State */}
      {blockedUsers.length === 0 && (
        <Text className="font-SpaceGrotesk-Regular text-base text-neutral-500 dark:text-neutral-400">
          You haven’t blocked anyone.
        </Text>
      )}
      <View className="max-h-[55vh]">
        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="mb-2 flex-row items-center justify-between rounded-xl bg-primary-200 p-3 dark:bg-primary-800">
              <View className="flex-row items-center">
                {item.avatar_url ? (
                  <Image
                    source={{ uri: getPublicUrl(item.avatar_url) }}
                    className="mr-3 h-12 w-12 rounded-full bg-neutral-200"
                  />
                ) : (
                  <View className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
                    <UserRound size={12} color={theme.primary[900]} />
                  </View>
                )}
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className="font-SpaceGrotesk-Regular text-lg text-primary-900 dark:text-primary-100">
                  {item.display_name}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  haptics.action();
                  handleUnblock(item.id);
                }}
                className="rounded-lg px-4 py-2 bg-primary-300 dark:bg-primary-700">
                <Text className="font-SpaceGrotesk-Medium text-sm text-primary-700 dark:text-primary-300">
                  Unblock
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </BottomSheet>
  );
}
