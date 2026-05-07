import { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  AlignJustify,
  ArrowDown,
  ArrowUp,
  CaseUpper,
  Calendar,
  Film,
  Layers,
  Star,
  Tv,
} from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import BottomSheet from './BottomSheet';
import { haptics } from '~/utils/haptics';
import {
  DEFAULT_MEDIA_FILTERS,
  MediaFilters,
  MediaSortType,
  SortOrder,
} from '~/types/sortFilterTypes';

interface MediaSortAndFilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  sort: MediaSortType;
  order: SortOrder;
  filters: MediaFilters;
  onApply: (sort: MediaSortType, order: SortOrder, filters: MediaFilters) => void;
}

const SORT_OPTIONS: { value: MediaSortType; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Rating' },
  { value: 'release_date', label: 'Release Date' },
  { value: 'title', label: 'Title' },
];

const ORDER_HINTS: Record<MediaSortType, { ascending: string; descending: string }> = {
  relevance: { ascending: '—', descending: '—' },
  rating: { ascending: 'Low → High', descending: 'High → Low' },
  release_date: { ascending: 'Oldest → Newest', descending: 'Newest → Oldest' },
  title: { ascending: 'A → Z', descending: 'Z → A' },
};

const SORT_ICONS = {
  relevance: AlignJustify,
  rating: Star,
  release_date: Calendar,
  title: CaseUpper,
} as const;

export default function MediaSortAndFilterModal({
  isVisible,
  onClose,
  sort,
  order,
  filters,
  onApply,
}: MediaSortAndFilterModalProps) {
  const theme = useTheme();
  const [selected, setSelected] = useState(0);
  const [localSort, setLocalSort] = useState<MediaSortType>(sort);
  const [localOrder, setLocalOrder] = useState<SortOrder>(order);
  const [localFilters, setLocalFilters] = useState<MediaFilters>(filters);

  const [yearMinText, setYearMinText] = useState(filters.releaseYearMin?.toString() ?? '');
  const [yearMaxText, setYearMaxText] = useState(filters.releaseYearMax?.toString() ?? '');
  const [ratingMinText, setRatingMinText] = useState(filters.ratingMin?.toString() ?? '');
  const [ratingMaxText, setRatingMaxText] = useState(filters.ratingMax?.toString() ?? '');

  useEffect(() => {
    if (isVisible) {
      setLocalSort(sort);
      setLocalOrder(order);
      setLocalFilters(filters);
      setYearMinText(filters.releaseYearMin?.toString() ?? '');
      setYearMaxText(filters.releaseYearMax?.toString() ?? '');
      setRatingMinText(filters.ratingMin?.toString() ?? '');
      setRatingMaxText(filters.ratingMax?.toString() ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const orderDisabled = localSort === 'relevance';

  const buildFilters = (): MediaFilters => {
    const yearMin = yearMinText.length === 4 ? parseInt(yearMinText, 10) : null;
    const yearMax = yearMaxText.length === 4 ? parseInt(yearMaxText, 10) : null;
    const ratingMin = ratingMinText !== '' ? parseFloat(ratingMinText) : null;
    const ratingMax = ratingMaxText !== '' ? parseFloat(ratingMaxText) : null;
    return {
      mediaType: localFilters.mediaType,
      releaseYearMin: yearMin,
      releaseYearMax: yearMax !== null && yearMin !== null && yearMax < yearMin ? yearMin : yearMax,
      ratingMin:
        ratingMin !== null && !isNaN(ratingMin) ? Math.min(10, Math.max(0, ratingMin)) : null,
      ratingMax:
        ratingMax !== null && !isNaN(ratingMax) ? Math.min(10, Math.max(0, ratingMax)) : null,
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
    setLocalFilters(DEFAULT_MEDIA_FILTERS);
    setYearMinText('');
    setYearMaxText('');
    setRatingMinText('');
    setRatingMaxText('');
  };

  return (
    <BottomSheet isVisible={isVisible} onClose={onClose}>
          {/* Sort By */}
          <View className="flex-row items-center justify-between">
            <Text className="font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
              Sort & Filter
            </Text>
            <TouchableOpacity onPress={handleReset} className="p-2">
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
                className={`text-md ${selected === 0 ? 'font-SpaceGrotesk-SemiBold text-primary-950 dark:text-primary-50' : 'font-SpaceGrotesk-Light text-primary-600 dark:text-primary-400'}  `}>
                Sort
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelected(1)}
              className={`flex-1 items-center rounded-lg ${selected === 1 ? 'bg-primary-100 dark:bg-primary-900' : ''} py-2`}>
              <Text
                className={`text-md ${selected === 1 ? 'font-SpaceGrotesk-SemiBold text-primary-950 dark:text-primary-50' : 'font-SpaceGrotesk-Light text-primary-600 dark:text-primary-400'}  `}>
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
                {[SORT_OPTIONS.slice(0, 2), SORT_OPTIONS.slice(2, 4)].map((row, rowIndex) => (
                  <View key={rowIndex} className="flex-row gap-x-2">
                    {row.map((opt) => {
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
                ))}
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
                  Media Type
                </Text>
                <View className="flex-row gap-x-2">
                  {([null, 'movie', 'tv'] as (null | 'movie' | 'tv')[]).map((type) => {
                    const active = localFilters.mediaType === type;
                    const label = type === null ? 'All' : type === 'movie' ? 'Movie' : 'TV Show';
                    const MediaIcon = type === null ? Layers : type === 'movie' ? Film : Tv;
                    return (
                      <TouchableOpacity
                        key={String(type)}
                        onPress={() => {
                          haptics.action();
                          setLocalFilters((f) => ({ ...f, mediaType: type }));
                        }}
                        className={`flex-1 gap-y-3 rounded-xl p-4 ${active ? 'bg-primary-900 dark:bg-primary-100' : 'bg-primary-200 dark:bg-primary-800'}`}>
                        <MediaIcon
                          size={18}
                          color={active ? theme.primary[100] : theme.primary[500]}
                        />
                        <Text
                          className={`font-SpaceGrotesk-Medium text-sm ${active ? 'text-primary-100 dark:text-primary-900' : 'text-primary-500'}`}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View className="gap-y-2">
                <Text className="font-SpaceGrotesk-Bold text-base text-primary-950 dark:text-primary-50">
                  Release Year
                </Text>
                <View className="flex-row gap-x-2">
                  <View className="flex-1 gap-y-1 rounded-xl bg-primary-200 px-3 py-3 dark:bg-primary-800">
                    <Text className="font-SpaceGrotesk-Light text-xs text-primary-500">From</Text>
                    <TextInput
                      value={yearMinText}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9]/g, '');
                        setYearMinText(cleaned);
                      }}
                      placeholder="e.g. 2000"
                      placeholderTextColor={theme.primary[500]}
                      cursorColor={theme.primary[700]}
                      selectionColor={theme.primary[700]}
                      keyboardType="number-pad"
                      maxLength={4}
                      className="font-SpaceGrotesk-Regular text-sm text-primary-950 dark:text-primary-50"
                    />
                  </View>
                  <View className="flex-1 gap-y-1 rounded-xl bg-primary-200 px-3 py-3 dark:bg-primary-800">
                    <Text className="font-SpaceGrotesk-Light text-xs text-primary-500">To</Text>
                    <TextInput
                      value={yearMaxText}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9]/g, '');
                        setYearMaxText(cleaned);
                      }}
                      placeholder="e.g. 2024"
                      placeholderTextColor={theme.primary[500]}
                      keyboardType="number-pad"
                      maxLength={4}
                      cursorColor={theme.primary[700]}
                      selectionColor={theme.primary[700]}
                      className="font-SpaceGrotesk-Regular text-sm text-primary-950 dark:text-primary-50"
                    />
                  </View>
                </View>
              </View>

              <View className="gap-y-2">
                <Text className="font-SpaceGrotesk-Bold text-base text-primary-950 dark:text-primary-50">
                  Rating (0–10)
                </Text>
                <View className="flex-row gap-x-2">
                  <View className="flex-1 gap-y-1 rounded-xl bg-primary-200 px-3 py-3 dark:bg-primary-800">
                    <Text className="font-SpaceGrotesk-Light text-xs text-primary-500">Min</Text>
                    <TextInput
                      value={ratingMinText}
                      onChangeText={(text) => {
                        const cleaned = text
                          .replace(/[^0-9.]/g, '') // allow digits + dot
                          .replace(/(\..*)\./g, '$1'); // only one decimal point
                        const value = parseFloat(cleaned);
                        if (!isNaN(value)) {
                          setRatingMinText(String(Math.min(10, Math.max(0, value))));
                        } else {
                          setRatingMinText(cleaned);
                        }
                      }}
                      placeholder="e.g. 6.0"
                      cursorColor={theme.primary[700]}
                      selectionColor={theme.primary[700]}
                      placeholderTextColor={theme.primary[500]}
                      keyboardType="decimal-pad"
                      maxLength={4}
                      className="font-SpaceGrotesk-Regular text-sm text-primary-950 dark:text-primary-50"
                    />
                  </View>
                  <View className="flex-1 gap-y-1 rounded-xl bg-primary-200 px-3 py-3 dark:bg-primary-800">
                    <Text className="font-SpaceGrotesk-Light text-xs text-primary-500">Max</Text>
                    <TextInput
                      value={ratingMaxText}
                      onChangeText={(text) => {
                        const cleaned = text
                          .replace(/[^0-9.]/g, '') // allow digits + dot
                          .replace(/(\..*)\./g, '$1'); // only one decimal point

                        const value = parseFloat(cleaned);
                        if (!isNaN(value)) {
                          setRatingMaxText(String(Math.min(10, Math.max(0, value))));
                        } else {
                          setRatingMaxText(cleaned);
                        }
                      }}
                      placeholder="e.g. 10"
                      placeholderTextColor={theme.primary[500]}
                      keyboardType="decimal-pad"
                      cursorColor={theme.primary[700]}
                      selectionColor={theme.primary[700]}
                      maxLength={4}
                      className="font-SpaceGrotesk-Regular text-sm text-primary-950 dark:text-primary-50"
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Actions */}
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
              className="flex-[2] items-center rounded-xl bg-primary-900 py-3 dark:bg-primary-50">
              <Text className="font-SpaceGrotesk-SemiBold text-sm text-primary-50 dark:text-primary-950">
                Apply
              </Text>
            </TouchableOpacity>
          </View>
    </BottomSheet>
  );
}
