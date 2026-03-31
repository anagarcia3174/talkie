import { UserRound } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Modal, Text, View, TouchableOpacity, Image } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { useAuth } from '~/context/AuthContext';
import { useTheme } from '~/hooks/useTheme';
import { useBlock } from '~/store/blockStore';
import { haptics } from '~/utils/haptics';
import { getPublicUrl } from '~/utils/storageUrl';

interface BlockedUsersModal {
  visible: boolean;
  onClose: () => void;
}

export default function BlockedUsersModal({ visible, onClose }: BlockedUsersModal) {
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
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <TouchableOpacity activeOpacity={1} onPress={onClose} className="absolute inset-0" />
        <View className="max-h-[70%] w-full rounded-3xl bg-white p-6 dark:bg-neutral-900">
          {/* Header */}
          <Text className="mb-5 font-SpaceGrotesk-Medium text-xl text-primary-900 dark:text-primary-100">
            Blocked Users
          </Text>

          {loading && blockedUsers.length === 0 && (
            <Text className="text-base text-neutral-500 dark:text-neutral-400">
              Loading blocked users...
            </Text>
          )}

          {error && blockedUsers.length === 0 && (
            <Text className="mb-2 text-base text-red-500">{error}</Text>
          )}

          {/* Empty State */}
          {blockedUsers.length === 0 && (
            <Text className="text-base text-neutral-500 dark:text-neutral-400">
              You haven’t blocked anyone.
            </Text>
          )}

          <FlatList
            data={blockedUsers}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 10 }}
            renderItem={({ item }) => (
              <View className="flex-row items-center justify-between border-b border-neutral-200 py-4 dark:border-neutral-800">
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
                  <Text className="font-SpaceGrotesk-Regular text-lg text-primary-900 dark:text-primary-100">
                    {item.display_name}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    haptics.action();
                    handleUnblock(item.id);
                  }}
                  className="rounded-full border border-neutral-300 px-4 py-2 dark:border-neutral-700">
                  <Text className="font-SpaceGrotesk-Medium text-sm text-primary-900 dark:text-primary-100">
                    Unblock
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}
