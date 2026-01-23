import { ChevronRight, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useTheme } from '~/hooks/useTheme';

interface ListRowProps {
  title: string;
  items?: number;
  onPress: () => void;
  deletable?: boolean;
  onDelete?: () => void;
}

export default function ListRow({
  title,
  items,
  onPress,
  deletable = false,
  onDelete,
}: ListRowProps) {
  const theme = useTheme();
  const [rowHeight, setRowHeight] = useState(0);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [input, setInput] = useState('');

  const isMatch = input.trim() === title;

  const handleConfirmDelete = () => {
    if (!isMatch) return;
    setConfirmVisible(false);
    setInput('');
    onDelete?.();
  };

  const RowContent = (
    <TouchableOpacity
      onLayout={(e) => setRowHeight(e.nativeEvent.layout.height)}
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-row items-center justify-between bg-primary-200 p-4 dark:bg-primary-900">
      <View className="flex-1">
        <Text className="font-SpaceGrotesk-Bold text-2xl text-primary-950 dark:text-primary-50">
          {title}
        </Text>
        {items != null && (
          <Text className="font-SpaceGrotesk-Regular text-sm text-primary-600 dark:text-primary-400">
            {items} items
          </Text>
        )}
      </View>
      <ChevronRight size={20} color={theme.primary[950]} />
    </TouchableOpacity>
  );

  const renderRightActions = () => (
    <TouchableOpacity
      style={{ height: rowHeight }}
      onPress={() => setConfirmVisible(true)}
      activeOpacity={0.8}
      className="w-20 items-center justify-center bg-red-500">
      <Trash2 size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <>
      <View className="mb-3 overflow-hidden rounded-2xl">
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
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full rounded-2xl bg-primary-50 p-5 dark:bg-primary-900">
            <Text className="mb-2 font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
              Delete list?
            </Text>

            <Text className="mb-4 font-SpaceGrotesk-Regular text-sm text-primary-600 dark:text-primary-400">
              Type <Text className="font-SpaceGrotesk-Bold">{title}</Text> to confirm. This action
              cannot be undone.
            </Text>

            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={title}
              placeholderTextColor={theme.primary[500]}
              cursorColor={theme.primary[700]}
              selectionColor={theme.primary[700]}
              className="mb-4 rounded-xl border border-primary-300 bg-primary-50 px-4 py-3 font-SpaceGrotesk-Regular text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-700 dark:bg-primary-900 dark:text-primary-50 focus:dark:border-primary-50"
            />

            <View className="flex-row justify-end gap-x-3">
              <TouchableOpacity
                onPress={() => {
                  setConfirmVisible(false);
                  setInput('');
                }}
                className="rounded-xl px-4 py-2">
                <Text className="font-SpaceGrotesk-Medium text-primary-600 dark:text-primary-400">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!isMatch}
                onPress={handleConfirmDelete}
                className={`rounded-xl px-4 py-2 ${isMatch ? 'bg-red-500' : 'bg-red-300'}`}>
                <Text className="font-SpaceGrotesk-Bold text-white">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
