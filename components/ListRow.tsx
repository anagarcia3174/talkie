import { ChevronRight, Trash2, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useTheme } from '~/hooks/useTheme';
import { ListWithMeta } from '~/types/supabaseTypes';
import { haptics } from '~/utils/haptics';
import { getPublicUrl } from '~/utils/storageUrl';

interface ListRowProps {
  list: ListWithMeta;
  onPress: () => void;
  deletable?: boolean;
  onDelete?: () => void;
}

export default function ListRow({ list, onPress, deletable = false, onDelete }: ListRowProps) {
  const theme = useTheme();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [input, setInput] = useState('');

  const isMatch = input.trim() === list.name;

  const handleConfirmDelete = () => {
    if (!isMatch) return;
    haptics.action();
    setConfirmVisible(false);
    setInput('');
    onDelete?.();
  };

  const RowContent = (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="min-h-16 flex-col justify-center  rounded-lg bg-primary-100 px-4 py-4 dark:bg-primary-900">
      {/* Top row: name + item count + chevron */}
      <View className="flex-row items-center">
        <View className="flex-1">
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            className="font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
            {list.name}
          </Text>
          {list.item_count != null && (
            <Text className="mt-0.5 font-SpaceGrotesk-Regular text-sm text-primary-500">
              {list.item_count} items
            </Text>
          )}
        </View>
        <ChevronRight size={18} color={theme.primary[800]} />
      </View>

      {/* Divider + Owner row */}
      {list.is_liked && list.owner ? (
        <>
          <View className="my-3 h-px bg-primary-200 dark:bg-primary-800" />
          <View className="flex-row items-center gap-2">
            {list.owner.avatar_url ? (
              <Image
                source={{ uri: getPublicUrl(list.owner.avatar_url) }}
                className="h-7 w-7 rounded-full"
              />
            ) : (
              <View className="h-7 w-7 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
                <UserRound size={14} color={theme.primary[900]} />
              </View>
            )}
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="text-md flex-1 font-SpaceGrotesk-Regular text-primary-700 dark:text-primary-300">
              {list.owner.display_name}
            </Text>
          </View>
        </>
      ) : null}
    </TouchableOpacity>
  );

  const renderRightActions = () => (
    <TouchableOpacity
      onPress={() => {
        haptics.warning();
        setConfirmVisible(true);
      }}
      activeOpacity={0.8}
      className="ml-2 w-16 items-center justify-center rounded-2xl bg-red-500">
      <Trash2 size={20} color="white" />
    </TouchableOpacity>
  );

  return (
    <>
      <View className="mb-3">
        {deletable ? (
          <ReanimatedSwipeable
            rightThreshold={60}
            friction={2}
            renderRightActions={renderRightActions}
            overshootRight={false}>
            {RowContent}
          </ReanimatedSwipeable>
        ) : (
          RowContent
        )}
      </View>

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/70 px-6">
          <View className="w-full rounded-2xl border border-primary-800 bg-primary-900 p-5">
            <Text className="mb-2 font-SpaceGrotesk-Bold text-xl text-primary-50">
              Delete list?
            </Text>
            <Text className="mb-4 font-SpaceGrotesk-Regular text-sm text-primary-500">
              Type <Text className="font-SpaceGrotesk-Bold text-primary-300">{list.name}</Text> to
              confirm. This action cannot be undone.
            </Text>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={list.name}
              placeholderTextColor={theme.primary[600]}
              cursorColor={theme.primary[300]}
              selectionColor={theme.primary[700]}
              className="mb-4 rounded-xl border border-primary-800 bg-primary-950 px-4 py-3 font-SpaceGrotesk-Regular text-primary-50 focus:border-primary-600"
            />
            <View className="flex-row justify-end gap-x-3">
              <TouchableOpacity
                onPress={() => {
                  setConfirmVisible(false);
                  setInput('');
                }}
                className="rounded-xl px-4 py-2">
                <Text className="font-SpaceGrotesk-Medium text-primary-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!isMatch}
                onPress={handleConfirmDelete}
                className={`rounded-xl px-4 py-2 ${isMatch ? 'bg-red-500' : 'bg-red-500/30'}`}>
                <Text className="font-SpaceGrotesk-Bold text-white">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
