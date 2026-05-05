import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AlignJustify,
  ArrowDown,
  ArrowUp,
  BookOpen,
  CaseUpper,
  Heart,
  LayoutGrid,
  List,
  Star,
  ThumbsUp,
} from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { haptics } from '~/utils/haptics';
import {
  DEFAULT_LIST_FILTERS,
  ListFilters,
  ListSortType,
  SortOrder,
} from '~/types/sortFilterTypes';

interface ListSortAndFilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  sort: ListSortType;
  order: SortOrder;
  filters: ListFilters;
  onApply: (sort: ListSortType, order: SortOrder, filters: ListFilters) => void;
}

const SORT_OPTIONS: { value: ListSortType; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'likes', label: 'Likes' },
  { value: 'name', label: 'Name' },
];

const ORDER_HINTS: Record<ListSortType, { ascending: string; descending: string }> = {
  relevance: { ascending: '—', descending: '—' },
  likes: { ascending: 'Least → Most', descending: 'Most → Least' },
  name: { ascending: 'A → Z', descending: 'Z → A' },
};

const LIST_TYPE_OPTIONS: { value: 'library' | 'favorites' | 'custom' | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'library', label: 'Library' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'custom', label: 'Custom' },
];

const SORT_ICONS = {
  relevance: AlignJustify,
  likes: ThumbsUp,
  name: CaseUpper,
} as const;

export default function ListSortAndFilterModal({
  isVisible,
  onClose,
  sort,
  order,
  filters,
  onApply,
}: ListSortAndFilterModalProps) {
  const theme = useTheme();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  const [localSort, setLocalSort] = useState<ListSortType>(sort);
  const [localOrder, setLocalOrder] = useState<SortOrder>(order);
  const [localFilters, setLocalFilters] = useState<ListFilters>(filters);

  const [likesMinText, setLikesMinText] = useState(filters.likesMin?.toString() ?? '');
  const [likesMaxText, setLikesMaxText] = useState(filters.likesMax?.toString() ?? '');
  const [itemsMinText, setItemsMinText] = useState(filters.itemsMin?.toString() ?? '');
  const [itemsMaxText, setItemsMaxText] = useState(filters.itemsMax?.toString() ?? '');

  useEffect(() => {
    if (isVisible) {
      setLocalSort(sort);
      setLocalOrder(order);
      setLocalFilters(filters);
      setLikesMinText(filters.likesMin?.toString() ?? '');
      setLikesMaxText(filters.likesMax?.toString() ?? '');
      setItemsMinText(filters.itemsMin?.toString() ?? '');
      setItemsMaxText(filters.itemsMax?.toString() ?? '');
    }
  }, [isVisible]);

  const orderDisabled = localSort === 'relevance';

  const buildFilters = (): ListFilters => {
    const likesMin = likesMinText !== '' ? parseInt(likesMinText, 10) : null;
    const likesMax = likesMaxText !== '' ? parseInt(likesMaxText, 10) : null;
    const itemsMin = itemsMinText !== '' ? parseInt(itemsMinText, 10) : null;
    const itemsMax = itemsMaxText !== '' ? parseInt(itemsMaxText, 10) : null;
    return {
      listType: localFilters.listType,
      likesMin: likesMin !== null && !isNaN(likesMin) ? Math.max(0, likesMin) : null,
      likesMax: likesMax !== null && !isNaN(likesMax) ? Math.max(0, likesMax) : null,
      itemsMin: itemsMin !== null && !isNaN(itemsMin) ? Math.max(0, itemsMin) : null,
      itemsMax: itemsMax !== null && !isNaN(itemsMax) ? Math.max(0, itemsMax) : null,
    };
  };

  const handleApply = () => {
    haptics.success();
    onApply(localSort, localOrder, buildFilters());
  };

  const handleReset = () => {
    haptics.action();
    setLocalSort('relevance');
    setLocalOrder('descending');
    setLocalFilters(DEFAULT_LIST_FILTERS);
    setLikesMinText('');
    setLikesMaxText('');
    setItemsMinText('');
    setItemsMaxText('');
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => (keyboardVisible ? Keyboard.dismiss() : onClose())}
        className="absolute inset-0 bg-black/60 dark:bg-black/70"
      />
      <KeyboardAvoidingView
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="gap-y-2 rounded-t-2xl bg-primary-100 px-4 pb-8 pt-2 dark:bg-primary-900">
          <View className="flex-row items-center justify-between">
            <Text className="font-SpaceGrotesk-Bold text-2xl text-primary-950 dark:text-primary-50">
              Sort & Filter
            </Text>
            <TouchableOpacity onPress={handleReset} className="px-2 py-2.5">
              <Text className="font-SpaceGrotesk-Medium text-sm text-primary-500 dark:text-primary-400">
                Reset
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-0.5 rounded-xl bg-primary-200 p-1.5 dark:bg-primary-950">
            <TouchableOpacity
              onPress={() => setSelected(0)}
              className={`flex-1 items-center rounded-lg ${selected === 0 ? 'bg-primary-100 dark:bg-primary-900' : ''} py-2`}>
              <Text
                className={`text-md ${selected === 0 ? 'font-SpaceGrotesk-SemiBold text-primary-950 dark:text-primary-50' : 'font-SpaceGrotesk-Light text-primary-600 dark:text-primary-400'}`}>
                Sort
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelected(1)}
              className={`flex-1 items-center rounded-lg ${selected === 1 ? 'bg-primary-100 dark:bg-primary-900' : ''} py-2`}>
              <Text
                className={`text-md ${selected === 1 ? 'font-SpaceGrotesk-SemiBold text-primary-950 dark:text-primary-50' : 'font-SpaceGrotesk-Light text-primary-600 dark:text-primary-400'}`}>
                Filter
              </Text>
            </TouchableOpacity>
          </View>

          {selected === 0 && (
            <View className="gap-y-5">
              <View className="gap-y-2">
                <Text className="font-SpaceGrotesk-Bold text-base text-primary-950 dark:text-primary-50">
                  Sort By
                </Text>
                <View className="flex-row gap-x-2">
                  {SORT_OPTIONS.map((opt) => {
                    const active = localSort === opt.value;
                    const SortIcon = SORT_ICONS[opt.value];
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => {
                          haptics.action();
                          setLocalSort(opt.value);
                          if (opt.value === 'relevance') setLocalOrder('descending');
                        }}
                        className={`flex-1 gap-y-3 rounded-xl p-4 ${active ? 'bg-primary-900 dark:bg-primary-100' : 'bg-primary-200 dark:bg-primary-800'}`}>
                        <SortIcon
                          size={18}
                          color={active ? theme.primary[100] : theme.primary[500]}
                        />
                        <Text
                          className={`font-SpaceGrotesk-Medium text-sm ${active ? 'text-primary-100 dark:text-primary-900' : 'text-primary-500'}`}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View
                className={`gap-y-2 ${orderDisabled ? 'opacity-40' : ''}`}
                pointerEvents={orderDisabled ? 'none' : 'auto'}>
                <Text className="font-SpaceGrotesk-Bold text-base text-primary-950 dark:text-primary-50">
                  Order
                </Text>
                <View className="flex-row gap-x-2">
                  {(['ascending', 'descending'] as SortOrder[]).map((o) => {
                    const active = localOrder === o;
                    const OrderIcon = o === 'ascending' ? ArrowUp : ArrowDown;
                    const hint = ORDER_HINTS[localSort][o];
                    return (
                      <TouchableOpacity
                        key={o}
                        onPress={() => {
                          haptics.action();
                          setLocalOrder(o);
                        }}
                        className={`flex-1 gap-y-1 rounded-xl px-4 py-4 ${active ? 'bg-primary-900 dark:bg-primary-100' : 'bg-primary-200 dark:bg-primary-800'}`}>
                        <View className="flex-row items-center gap-x-2">
                          <OrderIcon
                            size={16}
                            color={active ? theme.primary[100] : theme.primary[500]}
                          />
                          <Text
                            className={`font-SpaceGrotesk-Medium text-sm ${active ? 'text-primary-100 dark:text-primary-900' : 'text-primary-500'}`}>
                            {o === 'ascending' ? 'Ascending' : 'Descending'}
                          </Text>
                        </View>
                        {hint !== '—' && (
                          <Text className="font-SpaceGrotesk-Light text-xs text-primary-500">
                            {hint}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {selected === 1 && (
            <View className="gap-y-5">
              <View className="gap-y-2">
                <Text className="font-SpaceGrotesk-Bold text-base text-primary-950 dark:text-primary-50">
                  List Type
                </Text>
                <View className="gap-y-2">
                  {[LIST_TYPE_OPTIONS.slice(0, 2), LIST_TYPE_OPTIONS.slice(2, 4)].map(
                    (row, rowIndex) => (
                      <View key={rowIndex} className="flex-row gap-x-2">
                        {row.map((opt) => {
                          const active = localFilters.listType === opt.value;
                          const TypeIcon =
                            opt.value === null
                              ? LayoutGrid
                              : opt.value === 'library'
                                ? BookOpen
                                : opt.value === 'favorites'
                                  ? Heart
                                  : List;
                          return (
                            <TouchableOpacity
                              key={String(opt.value)}
                              onPress={() => {
                                haptics.action();
                                setLocalFilters((f) => ({ ...f, listType: opt.value }));
                              }}
                              className={`flex-1 gap-y-3 rounded-xl p-4 ${active ? 'bg-primary-900 dark:bg-primary-100' : 'bg-primary-200 dark:bg-primary-800'}`}>
                              <TypeIcon
                                size={18}
                                color={active ? theme.primary[100] : theme.primary[500]}
                              />
                              <Text
                                className={`font-SpaceGrotesk-Medium text-sm ${active ? 'text-primary-100 dark:text-primary-900' : 'text-primary-500'}`}>
                                {opt.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )
                  )}
                </View>
              </View>

              <View className="gap-y-2">
                <Text className="font-SpaceGrotesk-Bold text-base text-primary-950 dark:text-primary-50">
                  Likes
                </Text>
                <View className="flex-row gap-x-2">
                  <View className="flex-1 gap-y-1 rounded-xl bg-primary-200 px-3 py-3 dark:bg-primary-800">
                    <Text className="font-SpaceGrotesk-Light text-xs text-primary-500">Min</Text>
                    <TextInput
                      value={likesMinText}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9]/g, '');
                        setLikesMinText(cleaned);
                      }}
                      placeholder="e.g. 10"
                      placeholderTextColor={theme.primary[500]}
                      keyboardType="number-pad"
                      maxLength={6}
                      className="font-SpaceGrotesk-Regular text-sm text-primary-950 dark:text-primary-50"
                      cursorColor={theme.primary[700]}
                      selectionColor={theme.primary[700]}
                    />
                  </View>
                  <View className="flex-1 gap-y-1 rounded-xl bg-primary-200 px-3 py-3 dark:bg-primary-800">
                    <Text className="font-SpaceGrotesk-Light text-xs text-primary-500">Max</Text>
                    <TextInput
                      value={likesMaxText}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9]/g, '');
                        setLikesMaxText(cleaned);
                      }}
                      placeholder="e.g. 500"
                      placeholderTextColor={theme.primary[500]}
                      keyboardType="number-pad"
                      maxLength={6}
                      className="font-SpaceGrotesk-Regular text-sm text-primary-950 dark:text-primary-50"
                      cursorColor={theme.primary[700]}
                      selectionColor={theme.primary[700]}
                    />
                  </View>
                </View>
              </View>

              <View className="gap-y-2">
                <Text className="font-SpaceGrotesk-Bold text-base text-primary-950 dark:text-primary-50">
                  Items
                </Text>
                <View className="flex-row gap-x-2">
                  <View className="flex-1 gap-y-1 rounded-xl bg-primary-200 px-3 py-3 dark:bg-primary-800">
                    <Text className="font-SpaceGrotesk-Light text-xs text-primary-500">Min</Text>
                    <TextInput
                      value={itemsMinText}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9]/g, '');
                        setItemsMinText(cleaned);
                      }}
                      placeholder="e.g. 5"
                      placeholderTextColor={theme.primary[500]}
                      keyboardType="number-pad"
                      maxLength={5}
                      className="font-SpaceGrotesk-Regular text-sm text-primary-950 dark:text-primary-50"
                    />
                  </View>
                  <View className="flex-1 gap-y-1 rounded-xl bg-primary-200 px-3 py-3 dark:bg-primary-800">
                    <Text className="font-SpaceGrotesk-Light text-xs text-primary-500">Max</Text>
                    <TextInput
                      value={itemsMaxText}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9]/g, '');
                        setItemsMaxText(cleaned);
                      }}
                      placeholder="e.g. 100"
                      placeholderTextColor={theme.primary[500]}
                      keyboardType="number-pad"
                      maxLength={5}
                      className="font-SpaceGrotesk-Regular text-sm text-primary-950 dark:text-primary-50"
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          <View className="flex-row items-center gap-x-2 pt-2">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 items-center rounded-xl border border-primary-300 py-2.5 dark:border-primary-700">
              <Text className="font-SpaceGrotesk-Medium text-sm text-primary-700 dark:text-primary-300">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              className="flex-[2] items-center rounded-xl bg-primary-900 py-3 dark:bg-primary-100">
              <Text className="font-SpaceGrotesk-SemiBold text-sm text-primary-50 dark:text-primary-950">
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
