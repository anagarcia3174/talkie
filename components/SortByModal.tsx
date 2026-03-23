import { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { SortOrder, SortType } from './ListContent';

interface SortByModalPropsModal {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (option: SortType, order: SortOrder) => void;
}

export default function SortByModal({ isVisible, onClose, onSelect }: SortByModalPropsModal) {
  const SORT_OPTIONS: { label: string; value: SortType }[] = [
    { label: 'Alphabetical', value: 'alpha' },
    { label: 'Release Date', value: 'release' },
    { label: 'Date Added', value: 'added' },
  ];
  const ORDER_OPTIONS: { label: string; value: SortOrder }[] = [
    { label: 'Ascending', value: 'asc' },
    { label: 'Descending', value: 'desc' },
  ];

  const [selectedSort, setSelectedSort] = useState<SortType>('added');
  const [selectedOrder, setSelectedOrder] = useState<SortOrder>('asc');

  function apply() {
    onSelect(selectedSort, selectedOrder);
    onClose();
  }

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Background Overlay */}
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 bg-primary-950/60" />

      {/* Bottom Sheet */}
      <View className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-primary-100 p-6 pb-8 shadow-2xl dark:bg-primary-900">
        <Text className="mb-4 font-SpaceGrotesk-Bold text-xl text-primary-900 dark:text-primary-100">
          Sort By
        </Text>

        {/* Sort Options */}
        <View className="mb-6">
          {SORT_OPTIONS.map((opt) => {
            const active = selectedSort === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setSelectedSort(opt.value)}
                className={`mb-3 flex-row items-center justify-between rounded-lg px-3 py-3 ${
                  active ? 'bg-primary-300 dark:bg-primary-800' : 'bg-transparent'
                }`}>
                <Text
                  className={`text-lg  ${
                    active
                      ? 'font-SpaceGrotesk-Medium text-primary-950 dark:text-primary-50'
                      : 'font-SpaceGrotesk-Light text-primary-900 dark:text-primary-200'
                  }`}>
                  {opt.label}
                </Text>
                {active && (
                  <View className="h-3 w-3 rounded-full bg-primary-950 dark:bg-primary-50" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="mb-4 font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
          Sort Order
        </Text>

        {/* Order Options */}
        <View className="mb-6">
          {ORDER_OPTIONS.map((opt) => {
            const active = selectedOrder === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setSelectedOrder(opt.value)}
                className={`mb-3 flex-row items-center justify-between rounded-lg px-3 py-3 ${
                  active ? 'bg-primary-300 dark:bg-primary-800' : 'bg-transparent'
                }`}>
                <Text
                  className={`text-lg ${
                    active
                      ? 'font-SpaceGrotesk-Medium text-primary-950 dark:text-primary-50'
                      : 'font-SpaceGrotesk-Light text-primary-900 dark:text-primary-200'
                  }`}>
                  {opt.label}
                </Text>
                {active && (
                  <View className="h-3 w-3 rounded-full bg-primary-950 dark:bg-primary-50" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-end gap-3">
          <TouchableOpacity onPress={onClose} className="rounded-lg px-4 py-2">
            <Text className="font-SpaceGrotesk-Light text-lg text-primary-700 dark:text-primary-300">
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={apply}
            className="rounded-lg bg-primary-900 px-4 py-2 dark:bg-primary-200">
            <Text className="font-SpaceGrotesk-Medium text-lg text-primary-50 dark:text-primary-950">
              Apply
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
