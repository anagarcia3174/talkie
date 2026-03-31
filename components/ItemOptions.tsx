import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { X, Pencil, Trash2, UserCircle, Flag } from 'lucide-react-native';
import { CommentWithUser, ReviewWithUser } from '~/types/supabaseTypes';
import { useTheme } from '~/hooks/useTheme';
import { useRouter } from 'expo-router';
import { haptics } from '~/utils/haptics';

type ItemWithUser =
  | { type: 'review'; data: ReviewWithUser }
  | { type: 'comment'; data: CommentWithUser };

interface ItemOptionsProps {
  visible: boolean;
  item: ItemWithUser;
  isOwner: boolean;
  onClose: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  onReport: () => void;
}

export default function ItemOptions({
  visible,
  item,
  isOwner,
  onClose,
  onDelete,
  onEdit,
  onReport,
}: ItemOptionsProps) {
  const theme = useTheme();
  const router = useRouter();

  const owner = item.data.owner;
  const userId = item.data.user_id;
  const content = item.data.content;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable className="flex-1 bg-primary-950/60" onPress={onClose} />

      {/* Bottom Sheet */}
      <View className="absolute bottom-0 w-full rounded-t-2xl bg-primary-100 pb-10 dark:bg-primary-900">
        {/* Drag Handle + Close */}
        <View className="flex-row items-center justify-between border-b border-primary-200 px-6 py-4 dark:border-primary-800">
          <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
            Options
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="rounded-full p-2 active:bg-primary-100 dark:active:bg-primary-800">
            <X size={20} color={theme.primary[950]} />
          </TouchableOpacity>
        </View>

        <View className="mx-4 my-4 flex-row items-center gap-3 rounded-2xl bg-primary-200 px-4 py-3 dark:bg-primary-800">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-800 dark:bg-primary-100">
            <Text className="font-SpaceGrotesk-SemiBold text-xs text-primary-50 dark:text-primary-950">
              {owner.display_name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-SpaceGrotesk-SemiBold text-sm text-primary-950 dark:text-primary-50">
              {owner.display_name}
            </Text>
            {content ? (
              <Text
                numberOfLines={1}
                className="font-SpaceGrotesk-Regular text-xs text-primary-500 dark:text-primary-400">
                {content}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Actions — no separation, full-bleed rows */}
        {/* Actions — spaced rows, no divider */}
        <View className="gap-1 px-2">
          {isOwner ? (
            <>
              {onEdit && (
                <TouchableOpacity
                  onPress={onEdit}
                  className="flex-row items-center gap-4 rounded-xl px-4 py-4 active:bg-primary-200 dark:active:bg-primary-800">
                  <Pencil size={22} color={theme.primary[500]} />
                  <Text className="font-SpaceGrotesk-Medium text-base text-primary-950 dark:text-primary-50">
                    Edit {item.type === 'review' ? 'Review' : 'Comment'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  haptics.warning();
                  onDelete();
                }}
                className="flex-row items-center gap-4 rounded-xl px-4 py-4 active:bg-red-500/10">
                <Trash2 size={22} color="#ef4444" />
                <Text className="font-SpaceGrotesk-Medium text-base text-red-500">
                 Delete {item.type === 'review' ? 'Review' : 'Comment'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() =>{
                  onClose();
                  router.push({ pathname: '/profile/[id]', params: { id: userId } })
                }
                }
                className="flex-row items-center gap-4 rounded-xl px-4 py-4 active:bg-primary-200 dark:active:bg-primary-800">
                <UserCircle size={22} color={theme.primary[500]} />
                <Text className="font-SpaceGrotesk-Medium text-base text-primary-950 dark:text-primary-50">
                  View Profile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  haptics.warning();
                  onReport();
                }}
                className="flex-row items-center gap-4 rounded-xl px-4 py-4 active:bg-red-500/10">
                <Flag size={22} color="#ef4444" />
                <Text className="font-SpaceGrotesk-Medium text-base text-red-500">
                  Report {item.type === 'review' ? 'Review' : 'Comment'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
