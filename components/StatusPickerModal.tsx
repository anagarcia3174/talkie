import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Check, Eye, Clock, Trash2 } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { Status } from '~/types/supabaseTypes';
import { useEffect, useState } from 'react';
import { haptics } from '~/utils/haptics';

interface StatusPickerModalProps {
  visible: boolean;
  currentStatus: Status;
  onConfirm: (status: Status) => void;
  onDelete: () => void;
  onClose: () => void;
}

const OPTIONS: {
  status: Status;
  label: string;
  Icon: any;
}[] = [
  { status: 'watched', label: 'Watched', Icon: Check },
  { status: 'watching', label: 'Watching', Icon: Eye },
  { status: 'pending', label: 'Pending', Icon: Clock },
];

export default function StatusPickerModal({
  visible,
  currentStatus,
  onConfirm,
  onClose,
  onDelete,
}: StatusPickerModalProps) {
  const theme = useTheme();
  const [selectedStatus, setSelectedStatus] = useState<Status>(currentStatus);

  useEffect(() => {
    if (visible) {
      setSelectedStatus(currentStatus);
    }
  }, [visible, currentStatus]);

  const handleSelect = (status: Status) => {
    setSelectedStatus(status);

    setTimeout(() => {
      onConfirm(status);
    }, 100);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable className="flex-1 items-center justify-center bg-black/60 dark:bg-black/70" onPress={onClose}>
        {/* Card */}
        <Pressable
          onPress={() => {}}
          className="w-[85%] max-w-sm rounded-2xl bg-primary-100 p-2 shadow-2xl dark:bg-primary-900">
          <Text className="mb-2 text-center font-SpaceGrotesk-SemiBold text-lg text-primary-950 dark:text-primary-50">
            Change Status
          </Text>

          {OPTIONS.map(({ status, label, Icon }) => {
            const isSelected = status === selectedStatus;

            return (
              <TouchableOpacity
                key={status}
                onPress={() => {
                  haptics.action();
                  handleSelect(status);
                }}
                className={`flex-row items-center gap-4 rounded-xl p-4 ${
                  isSelected
                    ? 'bg-primary-200 dark:bg-primary-800'
                    : 'active:bg-primary-100 dark:active:bg-primary-800'
                }`}>
                <Icon size={20} color={isSelected ? theme.primary[950] : theme.primary[600]} />

                <Text
                  className={`flex-1 font-SpaceGrotesk-Medium ${
                    isSelected
                      ? 'text-primary-950 dark:text-primary-50'
                      : 'text-primary-700 dark:text-primary-300'
                  }`}>
                  {label}
                </Text>

                {isSelected && <Check size={18} color={theme.primary[950]} />}
              </TouchableOpacity>
            );
          })}

          {/* Divider */}
          <View className="my-2 h-px bg-primary-200 dark:bg-primary-800" />

          {/* Delete action */}
          <TouchableOpacity
            onPress={() => {
              haptics.warning();
              onDelete();
            }}
            className="flex-row items-center gap-4 rounded-xl p-4 active:bg-red-50 dark:active:bg-red-900/20">
            <Trash2 size={20} color="#dc2626" />

            <Text className="flex-1 font-SpaceGrotesk-Medium text-red-600 dark:text-red-500">
              Remove from list
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
