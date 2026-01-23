import { useMemo, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { SearchSortType, SortOrder } from '~/app/(protected)/(tabs)/Search';

interface SearchSortModalProps {
  isVisible: boolean;
  context: 'media' | 'lists';
  onClose: () => void;
  onSelect: (sort: SearchSortType, order: SortOrder) => void;
}

export default function SearchSortModal({
  isVisible,
  context,
  onClose,
  onSelect,
}: SearchSortModalProps) {
  const SORT_OPTIONS: { label: string; value: SearchSortType }[] = useMemo(() => {
    if (context === 'media') {
      return [
        { label: 'Relevance', value: 'relevance' },
        { label: 'Alphabetical', value: 'alpha' },
        { label: 'Release Date', value: 'release' },
        { label: 'Rating', value: 'rating' },
      ];
    }

    return [
      { label: 'Alphabetical', value: 'alpha' },
      { label: 'Item Count', value: 'item_count' },
    ];
  }, [context]);

  const ORDER_OPTIONS: { label: string; value: SortOrder }[] = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
  ];

  const SORT_ORDER_HINTS: Record<SearchSortType, { asc: string; desc: string }> = {
    relevance: {
      asc: 'Less relevant → More relevant',
      desc: 'More relevant → Less relevant',
    },
    alpha: {
      asc: 'A → Z',
      desc: 'Z → A',
    },
    release: {
      asc: 'Oldest → Newest',
      desc: 'Newest → Oldest',
    },
    rating: {
      asc: 'Lowest → Highest',
      desc: 'Highest → Lowest',
    },
    item_count: {
      asc: 'Fewest → Most',
      desc: 'Most → Fewest',
    },
  };

  const [selectedSort, setSelectedSort] = useState<SearchSortType>(
    context === 'media' ? 'relevance' : 'alpha'
  );
  const [selectedOrder, setSelectedOrder] = useState<SortOrder>(
    context === 'media' ? 'desc' : 'asc'
  );
  const isOrderDisabled = selectedSort === 'relevance';


  function apply() {
    onSelect(selectedSort, selectedOrder);
    onClose();
  }

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Overlay */}
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 bg-primary-950/60" />

      {/* Bottom Sheet */}
      <View className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-primary-100 p-6 pb-8 dark:bg-primary-900">
        <Text className="mb-4 font-SpaceGrotesk-Bold text-xl text-primary-900 dark:text-primary-100">
          Sort Results
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
                  active ? 'bg-primary-300 dark:bg-primary-800' : ''
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

        {/* Order */}
        <Text className="mb-4 font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
          Sort Order
        </Text>

        <View className="mb-6">
          {ORDER_OPTIONS.map((opt) => {
            const active = selectedOrder === opt.value;
            const hint = SORT_ORDER_HINTS[selectedSort]?.[opt.value];

            return (
              <TouchableOpacity
                key={opt.value}
                disabled={isOrderDisabled}
  onPress={() => setSelectedOrder(opt.value)}
  className={`mb-3 flex-row items-center justify-between rounded-lg px-3 py-3 ${
    active ? 'bg-primary-300 dark:bg-primary-800' : ''
  } ${isOrderDisabled ? 'opacity-40' : ''}`}>
                <View>
                  <Text
                    className={`text-lg ${
                      active
                        ? 'font-SpaceGrotesk-Medium text-primary-950 dark:text-primary-50'
                        : 'font-SpaceGrotesk-Light text-primary-900 dark:text-primary-200'
                    }`}>
                    {opt.label}
                  </Text>

                  <Text className="text-xs text-primary-600 dark:text-primary-400">
                    {hint}
                  </Text>
                </View>

                {active && (
                  <View className="h-3 w-3 rounded-full bg-primary-950 dark:bg-primary-50" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Actions */}
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
