import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Check, Clock, Trash2, X, Play } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { Status } from '~/types/supabaseTypes';
import { useEffect, useState } from 'react';
import { haptics } from '~/utils/haptics';
import BottomSheet from './BottomSheet';

interface StatusPickerModalProps {
  visible: boolean;
  currentStatus: Status;
  posterPath: string;
  title: string;
  year: string | number;
  onConfirm: (status: Status) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function StatusPickerModal({
  visible,
  currentStatus,
  posterPath,
  title,
  year,
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

  const watchingSelected = selectedStatus === 'watching';
  const pendingSelected = selectedStatus === 'pending';
  const watchedSelected = selectedStatus === 'watched';

  return (
    <BottomSheet isVisible={visible} onClose={onClose}>
      <View className="flex-row items-start gap-3">
        {posterPath ? (
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w500${posterPath}` }}
            className="h-24 w-16 rounded-lg"
          />
        ) : (
          <View className="h-24 w-16 rounded-lg bg-primary-200 dark:bg-primary-800" />
        )}
        <View className="flex-1">
          <Text
            className="font-SpaceGrotesk-SemiBold text-base text-primary-950 dark:text-primary-50"
            numberOfLines={2}>
            {title}
          </Text>
          <Text className="font-SpaceGrotesk-Regular text-sm text-primary-500 dark:text-primary-400">
            {year}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          className="rounded-lg bg-primary-200 p-1 dark:bg-primary-800">
          <X size={20} color={theme.primary[950]} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View className="gap-2">
        <Text className="font-SpaceGrotesk-Medium text-sm text-primary-700 dark:text-primary-300">
          Watch Status
        </Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => {
              haptics.action();
              handleSelect('watching');
            }}
            className={`flex-1 flex-row items-center justify-between gap-y-2 rounded-2xl p-4 ${
              watchingSelected
                ? 'bg-primary-900 dark:bg-primary-100'
                : 'bg-primary-200 dark:bg-primary-800'
            }`}>
            <View className="items-start gap-y-2">
              <Play size={18} color={watchingSelected ? theme.primary[100] : theme.primary[500]} />
              <Text
                className={`font-SpaceGrotesk-Medium text-sm ${watchingSelected ? 'text-primary-100 dark:text-primary-900' : 'text-primary-500'}`}>
                Watching
              </Text>
            </View>
            {watchingSelected && (
              <View className="m-1 h-1.5 w-1.5 rounded-full bg-primary-100 p-1 dark:bg-primary-900" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              haptics.action();
              handleSelect('pending');
            }}
            className={`flex-1 flex-row items-center justify-between gap-y-2 rounded-2xl p-4 ${
              pendingSelected
                ? 'bg-primary-900 dark:bg-primary-100'
                : 'bg-primary-200 dark:bg-primary-800'
            }`}>
            <View className="items-start gap-y-2">
              <Clock size={18} color={pendingSelected ? theme.primary[100] : theme.primary[500]} />
              <Text
                className={`font-SpaceGrotesk-Medium text-sm ${pendingSelected ? 'text-primary-100 dark:text-primary-900' : 'text-primary-500'}`}>
                Pending
              </Text>
            </View>
            {pendingSelected && (
              <View className="m-1 h-1.5 w-1.5 rounded-full bg-primary-100 p-1 dark:bg-primary-900" />
            )}
          </TouchableOpacity>
        </View>

        {/* Watched — full-width tile */}
        <TouchableOpacity
          onPress={() => {
            haptics.action();
            handleSelect('watched');
          }}
          className={`flex-row items-center justify-between rounded-2xl p-4 ${
            watchedSelected
              ? 'bg-primary-900 dark:bg-primary-100'
              : 'bg-primary-200 dark:bg-primary-800'
          }`}>
          <View className="flex-row items-start gap-x-2">
            <Check size={18} color={watchedSelected ? theme.primary[100] : theme.primary[500]} />
            <Text
              className={`font-SpaceGrotesk-Medium text-sm ${watchedSelected ? 'text-primary-100 dark:text-primary-900' : 'text-primary-500'}`}>
              Watched
            </Text>
          </View>
          {watchedSelected && (
            <View className="m-1 h-1.5 w-1.5 rounded-full bg-primary-100 p-1 dark:bg-primary-900" />
          )}
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View className="my-2 h-px bg-primary-200 dark:bg-primary-800" />

      {/* Delete action */}
      <TouchableOpacity
        onPress={() => {
          haptics.warning();
          onDelete();
        }}
        className="flex-row items-center gap-4 rounded-xl bg-red-500/50 p-4 p-4 dark:bg-red-950">
        <Trash2 size={20} color={theme.isDark ? '#ff6467' : '#c10007'} />
        <Text className="font-SpaceGrotesk-Medium text-red-700 dark:text-red-400">
          Remove from list
        </Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}
