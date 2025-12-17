import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Check, Eye, Clock } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { LibraryStatus } from '~/types/supabaseTypes';

interface StatusPickerModalProps {
  visible: boolean;
  currentStatus: LibraryStatus;
  onConfirm: (status: LibraryStatus) => void;
  onClose: () => void;
}

const OPTIONS: {
  status: LibraryStatus;
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
}: StatusPickerModalProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable className="flex-1 items-center justify-center bg-black/40" onPress={onClose}>
        {/* Card */}
        <Pressable
          onPress={() => {}}
          className="w-[85%] max-w-sm rounded-2xl bg-primary-50 p-2 shadow-2xl dark:bg-primary-900">
          <Text className="mb-2 text-center font-SpaceGrotesk-SemiBold text-lg text-primary-950 dark:text-primary-50">
            Change Status
          </Text>

          {OPTIONS.map(({ status, label, Icon }) => {
            const isSelected = status === currentStatus;

            return (
              <TouchableOpacity
                key={status}
                onPress={() => onConfirm(status)}
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}
