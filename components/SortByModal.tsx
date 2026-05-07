import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SortOrder, SortType } from './ListContent';
import { haptics } from '~/utils/haptics';
import BottomSheet from './BottomSheet';
import { useTheme } from '~/hooks/useTheme';
import { ArrowDown, ArrowUp, Calendar, CaseUpper, Clock, X } from 'lucide-react-native';

interface SortByModalPropsModal {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (option: SortType, order: SortOrder) => void;
}

const SORT_ICONS = {
  alpha: CaseUpper,
  release: Calendar,
  added: Clock,
} as const;

export default function SortByModal({ isVisible, onClose, onSelect }: SortByModalPropsModal) {
  const theme = useTheme();
  const SORT_OPTIONS: { label: string; value: SortType }[] = [
    { label: 'Alphabetical', value: 'alpha' },
    { label: 'Release Date', value: 'release' },
    { label: 'Date Added', value: 'added' },
  ];
  const ORDER_OPTIONS: { label: string; value: SortOrder }[] = [
    { label: 'Ascending', value: 'asc' },
    { label: 'Descending', value: 'desc' },
  ];

  const ORDER_HINTS: Record<SortType, { ascending: string; descending: string }> = {
    alpha: { ascending: 'A → Z', descending: 'Z → A' },
    release: { ascending: 'Oldest → Newest', descending: 'Newest → Oldest' },
    added: { ascending: 'Oldest → Newest', descending: 'Newest → Oldest' },
  };

  const [selectedSort, setSelectedSort] = useState<SortType>('added');
  const [selectedOrder, setSelectedOrder] = useState<SortOrder>('asc');

  function apply() {
    onSelect(selectedSort, selectedOrder);
    onClose();
  }

  return (
    <BottomSheet isVisible={isVisible} onClose={onClose}>
      <View className="flex-row items-center justify-between">
        <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-950 dark:text-primary-50">
          Sort List Items
        </Text>
        <TouchableOpacity
          onPress={onClose}
          className="rounded-lg bg-primary-200 p-1  dark:bg-primary-800">
          <X size={20} color={theme.primary[950]} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View>
        <Text className="font-SpaceGrotesk-Bold text-base text-primary-950 dark:text-primary-50">
          Sort By
        </Text>
        <View className="flex-row gap-x-2">
          {SORT_OPTIONS.map((opt) => {
            const active = selectedSort === opt.value;
            const SortIcon = SORT_ICONS[opt.value];
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  haptics.action();
                  setSelectedSort(opt.value);
                }}
                className={`flex-1 gap-y-3 rounded-xl p-4 ${active ? 'bg-primary-900 dark:bg-primary-100' : 'bg-primary-200 dark:bg-primary-800'}`}>
                <SortIcon size={18} color={active ? theme.primary[100] : theme.primary[500]} />
                <Text
                  className={`font-SpaceGrotesk-Medium text-sm ${active ? 'text-primary-100 dark:text-primary-900' : 'text-primary-500'}`}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View>
        {/* Sort Options */}
        <Text className="font-SpaceGrotesk-Bold text-base text-primary-950 dark:text-primary-50">
          Sort Order
        </Text>

        {/* Order Options */}
        <View className="flex-row gap-x-2">
          {ORDER_OPTIONS.map((opt) => {
            const active = selectedOrder === opt.value;
            const OrderIcon = opt.value === 'asc' ? ArrowUp : ArrowDown;
            const hint =
              ORDER_HINTS[selectedSort][opt.value === 'asc' ? 'ascending' : 'descending'];

            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  haptics.action();
                  setSelectedOrder(opt.value);
                }}
                className={`flex-1 gap-y-1 rounded-xl px-4 py-4 ${active ? 'bg-primary-900 dark:bg-primary-100' : 'bg-primary-200 dark:bg-primary-800'}`}>
                <View className="flex-row items-center gap-x-2">
                  <OrderIcon size={16} color={active ? theme.primary[100] : theme.primary[500]} />
                  <Text
                    className={`font-SpaceGrotesk-Medium text-sm ${active ? 'text-primary-100 dark:text-primary-900' : 'text-primary-500'}`}>
                    {opt.value === 'asc' ? 'Ascending' : 'Descending'}
                  </Text>
                </View>
                {hint !== '—' && (
                  <Text className="font-SpaceGrotesk-Light text-xs text-primary-500">{hint}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row items-center gap-x-2 pt-2">
        <TouchableOpacity
          onPress={onClose}
          className="flex-1 items-center rounded-xl border border-primary-300 py-2.5 dark:border-primary-700">
          <Text className="font-SpaceGrotesk-Medium text-sm text-primary-700 dark:text-primary-300">
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={apply}
          className="flex-[2] items-center rounded-xl bg-primary-900 py-3 dark:bg-primary-100">
          <Text className="font-SpaceGrotesk-SemiBold text-sm text-primary-50 dark:text-primary-950">
            Apply
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}
