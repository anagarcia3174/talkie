import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { ArrowDownUp, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useState } from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { FlatList } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import SortByModal from '~/components/SortByModal';
import { ListItemWithMedia, LibraryStatus, List, ListItem } from '~/types/supabaseTypes';
import StatusPickerModal from './StatusPickerModal';

interface ListContentProps {
  list: List; // your list type
  listItems: ListItemWithMedia[];
  onBack?: () => void;
  onUpdateStatus: (item: ListItemWithMedia, status: LibraryStatus) => void;
}

const FILTERS = ['All', 'Watching', 'Watched', 'Pending'];
const ROW_GAP = 16;
type FilterIndex = 0 | 1 | 2 | 3;
export type SortType = 'alpha' | 'release' | 'added';
export type SortOrder = 'asc' | 'desc';

export default function ListContent({ list, listItems, onBack, onUpdateStatus }: ListContentProps) {
  const theme = useTheme();
  const [selected, setSelected] = useState<FilterIndex>(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('added');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [modalVisible, setModalVisible] = useState(false);
  const [statusPickerModalVisible, setStatusPickerModalVisible] = useState(false);
  const [activeItem, setActiveItem] = useState<ListItem | null>(null);
  const router = useRouter();

  const statusMap: Record<FilterIndex, LibraryStatus | null> = {
    0: null,
    1: 'watching',
    2: 'watched',
    3: 'pending',
  } as const;

  const filtered =
    listItems.filter((item) => {
      const selectedStatus = statusMap[selected];
      const matchesStatus = selectedStatus ? item.status === selectedStatus : true;
      const matchesSearch = item.media?.title?.toLowerCase()?.includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    }) ?? [];

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'alpha': {
        comparison = a.media?.title?.localeCompare(b.media?.title ?? '') ?? 0;
        break;
      }
      case 'release': {
        const aDate = new Date(a.media?.release_date ?? 0).getTime();
        const bDate = new Date(b.media?.release_date ?? 0).getTime();
        comparison = aDate - bDate;
        break;
      }
      case 'added': {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        comparison = aTime - bTime;
        break;
      }
    }

    return sortOrder === 'asc' ? comparison : comparison * -1;
  });

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      {/* Header */}
      <View className="mb-2 flex-row items-center justify-start px-4">
        <TouchableOpacity className="p-2" onPress={onBack}>
          <ArrowLeft color={theme.primary[950]} size={24} />
        </TouchableOpacity>
        <Text className="font-SpaceGrotesk-Bold text-3xl text-primary-950 dark:text-primary-50">
          {list.name}
        </Text>
      </View>

      {/* Search + Sort */}
      <View className="flex-row items-center justify-between gap-x-2 px-4 py-2">
        <TextInput
          value={search}
          onChangeText={setSearch}
          className="text-md flex-1 rounded-xl border border-primary-700 py-3 px-4 font-SpaceGrotesk-Light text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-400 dark:text-primary-200 focus:dark:border-primary-50"
          cursorColor={theme.primary[700]}
          selectionColor={theme.primary[700]}
          placeholder={`Search through ${list.name}`}
          placeholderTextColor={theme.primary[500]}
        />
        <ArrowDownUp onPress={() => setModalVisible(true)} color={theme.primary[950]} />
      </View>
      {/* Filter Slider */}
      
      <View className="mt-1 px-4">
        <SegmentedControl
          values={FILTERS}
          selectedIndex={selected}
          onChange={(event) => {
            setSelected(event.nativeEvent.selectedSegmentIndex as FilterIndex);
          }}
          tintColor={theme.primaryOpacity[950]}
          fontStyle={{
            color: theme.primary[600],
            fontSize: 15,
            fontFamily: 'SpaceGrotesk-Light',
          }}
          activeFontStyle={{
            color: theme.primary[950],
            fontSize: 15,
            fontFamily: 'SpaceGrotesk-Medium',
          }}
        />
      </View>
      {listItems.length === 0 && (
        <View className="mt-20 items-center px-4">
          <Text className="font-SpaceGrotesk-Medium text-primary-600 dark:text-primary-400">
            This list is empty.
          </Text>
        </View>
      )}
      {listItems.length > 0 && sorted.length === 0 && (
         <View className="mt-20 items-center px-4">
          <Text className="font-SpaceGrotesk-Medium text-primary-600 dark:text-primary-400">
            No items match your search/filter.
          </Text>
        </View>
      )}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          paddingHorizontal: 16,
        }}
        contentContainerStyle={{
          paddingTop: 16,
          gap: ROW_GAP,
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: '/media/[id]',
                  params: {
                    id: item.media_id.toString(),
                    mediaData: JSON.stringify(item.media),
                  },
                });
              }}
              onLongPress={() => {
                setActiveItem(item);
                setStatusPickerModalVisible(true);
              }}
              delayLongPress={300}
              activeOpacity={0.85}
              style={{ flex: 1, maxWidth: '31%' }}>
              <View className="relative w-full overflow-hidden rounded-xl">
                {/* Poster */}
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w342${item.media?.poster_path}` }}
                  className="h-56 w-full"
                  resizeMode="cover"
                />
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <SortByModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={(option, order) => {
          setSortBy(option);
          setSortOrder(order);
        }}
      />
      {activeItem && (
        <StatusPickerModal
          visible={statusPickerModalVisible}
          currentStatus={activeItem.status ?? 'pending'}
          onClose={() => setStatusPickerModalVisible(false)}
          onConfirm={(newStatus) => {
            setStatusPickerModalVisible(false);
            onUpdateStatus(activeItem, newStatus);
          }}
        />
      )}
    </SafeAreaView>
  );
}
