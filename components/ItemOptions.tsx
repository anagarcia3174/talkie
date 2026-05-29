import { Text, TouchableOpacity, View } from 'react-native';
import { X, Pencil, Trash2, UserCircle, Flag } from 'lucide-react-native';
import { CommentWithUser, ReviewWithUser } from '~/types/supabaseTypes';
import { useTheme } from '~/hooks/useTheme';
import { useRouter } from 'expo-router';
import { haptics } from '~/utils/haptics';
import BottomSheet from './BottomSheet';

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
    <BottomSheet isVisible={visible} onClose={onClose}>
      <View className="flex-row items-center justify-between">
        <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
          Options
        </Text>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={8}
          className="rounded-lg bg-primary-200 p-1 dark:bg-primary-800">
          <X size={20} color={theme.primary[950]} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center gap-3 rounded-2xl bg-primary-200 px-4 py-3 dark:bg-primary-800">
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

      <View className="flex-row gap-x-2">
        {isOwner ? (
          <>
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                className="flex-1 gap-y-3 rounded-xl bg-primary-200 p-4 dark:bg-primary-800">
                <Pencil size={18} color={theme.primary[500]} />
                <Text className="font-SpaceGrotesk-Medium text-sm text-primary-950 dark:text-primary-50">
                  Edit {item.type === 'review' ? 'Review' : 'Comment'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                haptics.warning();
                onDelete();
              }}
              className="flex-1 gap-y-3 rounded-xl bg-red-500/50 p-4 dark:bg-red-950">
              <Trash2 size={18} color={theme.isDark ? '#ff6467' : '#c10007'} />
              <Text className="font-SpaceGrotesk-Medium text-sm text-red-700 dark:text-red-400">
                Delete {item.type === 'review' ? 'Review' : 'Comment'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => {
                onClose();
                router.push({ pathname: '/profile/[id]', params: { id: userId } });
              }}
              className="flex-1 gap-y-3 rounded-xl bg-primary-200 p-4 dark:bg-primary-800">
              <UserCircle size={18} color={theme.primary[500]} />
              <Text className="font-SpaceGrotesk-Medium text-sm text-primary-950 dark:text-primary-50">
                View Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                haptics.warning();
                onReport();
              }}
              className="flex-1 gap-y-3 rounded-xl bg-red-500/50 p-4 dark:bg-red-950">
              <Flag size={18} color={theme.isDark ? '#ff6467' : '#c10007'} />
              <Text className="font-SpaceGrotesk-Medium text-sm text-red-700 dark:text-red-400">
                Report {item.type === 'review' ? 'Review' : 'Comment'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </BottomSheet>
  );
}
