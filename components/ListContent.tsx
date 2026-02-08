import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, TextInput, TouchableOpacity, Image, Animated } from 'react-native';
import {
  ArrowDownUp,
  Bookmark,
  ChevronLeft,
  Globe,
  Lock,
  UserRound,
  Users,
} from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useRef, useState } from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useRouter } from 'expo-router';
import SortByModal from '~/components/SortByModal';
import {
  ListItemWithMedia,
  LibraryStatus,
  List,
  ListItem,
  ListOwnerInfo,
} from '~/types/supabaseTypes';
import StatusPickerModal from './StatusPickerModal';
import ListInfoModal from './ListInfoModal';
import { getPublicUrl } from '~/utils/storageUrl';

interface ListActions {
  updateItemStatus: (item: ListItemWithMedia, status: LibraryStatus) => void;
  deleteItem: (item: ListItemWithMedia) => void;
  updateList: (updates: Partial<List>) => void;
  deleteList: () => void;
  like: () => void;
  unlike: () => void;
}

interface ListContentProps {
  list: List;
  listItems: ListItemWithMedia[];
  actions: ListActions;
  isOwner: boolean;
  owner?: ListOwnerInfo;
}

const FILTERS = ['All', 'Watching', 'Watched', 'Pending'];
const ROW_GAP = 16;
type FilterIndex = 0 | 1 | 2 | 3;
export type SortType = 'alpha' | 'release' | 'added';
export type SortOrder = 'asc' | 'desc';

export default function ListContent({
  list,
  listItems,
  actions,
  isOwner,
  owner,
}: ListContentProps) {
  const theme = useTheme();
  const [selected, setSelected] = useState<FilterIndex>(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('added');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [statusPickerModalVisible, setStatusPickerModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeItem, setActiveItem] = useState<ListItem | null>(null);
  const [listInfoModalVisible, setListInfoModalVisible] = useState(false);
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_MAX_HEIGHT = list.description ? 110 : 60;
  const HEADER_MIN_HEIGHT = 0;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT;

  // Animated header height - collapses to 0
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  // Fade out entire header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerNameOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

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

  const getVisibilityIcon = () => {
    switch (list.visibility) {
      case 'private':
        return <Lock size={14} color={theme.primary[600]} />;
      case 'public':
        return <Globe size={14} color={theme.primary[600]} />;
      case 'followers':
        return <Users size={14} color={theme.primary[600]} />;
      default:
        return null;
    }
  };

  const DotSeparator = () => <Text className="mx-1 text-primary-400 dark:text-primary-600">•</Text>;

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      {/* Collapsing Header */}
      <View className="flex-row items-center justify-between p-4 ">
        <TouchableOpacity className="mr-4" onPress={() => router.back()}>
          <ChevronLeft color={theme.primary[950]} size={24} />
        </TouchableOpacity>
        <Animated.View style={{ opacity: headerNameOpacity }}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="font-SpaceGrotesk-Medium text-2xl text-primary-900 dark:text-primary-50">
            {list.name}
          </Text>
        </Animated.View>
        <TouchableOpacity
          disabled={isOwner}
          onPress={async () => {
            if (!actions) return;
            try {
              if (list.is_liked) {
                await actions.unlike();
              } else {
                await actions.like();
              }
            } catch (err) {
              console.error('Failed to toggle like:', err);
            }
          }}>
          <Bookmark
            color={isOwner ? theme.primary[50] : theme.primary[950]}
            fill={isOwner ? theme.primary[50] : theme.primary[950]}
            fillOpacity={list.is_liked ? 1 : 0}
            size={22}
          />
        </TouchableOpacity>
      </View>
      <Animated.View
        style={{
          height: headerHeight,
          opacity: headerOpacity,
          overflow: 'hidden',
          paddingHorizontal: 16,
        }}>
        <TouchableOpacity
          disabled={!isOwner}
          onPress={() => {
            if (isOwner) {
              setListInfoModalVisible(true);
            }
          }}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="mb-2 font-SpaceGrotesk-Bold text-3xl text-primary-950 dark:text-primary-50">
            {list.name}
          </Text>
          {/* Metadata Row */}
          <View className="mb-2 flex-row items-center">
            {/* Owner */}
            {!isOwner && owner && (
              <>
                <View className="flex-row items-center gap-1">
                  {owner.avatar_url ? (
                    <Image
                      source={{ uri: getPublicUrl(owner.avatar_url) }}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-primary-200 dark:bg-primary-800">
                      <UserRound size={12} color={theme.primary[900]} />
                    </View>
                  )}
                  <Text className="font-SpaceGrotesk-Regular text-sm text-primary-700 dark:text-primary-300">
                    {owner.display_name}
                  </Text>
                </View>

                <DotSeparator />
              </>
            )}

            {/* Item Count */}
            <View className="flex-row items-center gap-x-1">
              <Text className="font-SpaceGrotesk-Medium text-sm text-primary-600 dark:text-primary-400">
                {list.item_count}
              </Text>
              <Text className="font-SpaceGrotesk-Light text-sm text-primary-600 dark:text-primary-400">
                {list.item_count === 1 ? 'item' : 'items'}
              </Text>
            </View>

            <DotSeparator />

            {/* Visibility */}
            <View className="flex-row items-center gap-x-1">
              {getVisibilityIcon()}
              <Text className="font-SpaceGrotesk-Light text-sm capitalize text-primary-600 dark:text-primary-400">
                {list.visibility}
              </Text>
            </View>
          </View>

          {/* Description */}
          {list.description && (
            <>
              <Text
                className="font-SpaceGrotesk-Light text-base text-primary-700 dark:text-primary-300"
                numberOfLines={2}
                ellipsizeMode="tail">
                {list.description}
              </Text>
            </>
          )}
        </TouchableOpacity>
        {/* List Title */}
      </Animated.View>

      {/* Search + Sort */}
      <View className="flex-row items-center justify-between gap-x-2 px-4 py-2">
        <TextInput
          value={search}
          onChangeText={setSearch}
          className="text-md flex-1 rounded-xl border border-primary-700 px-4 py-3 font-SpaceGrotesk-Light text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-400 dark:text-primary-200 focus:dark:border-primary-50"
          cursorColor={theme.primary[700]}
          selectionColor={theme.primary[700]}
          placeholder={`Search through ${list.name}`}
          placeholderTextColor={theme.primary[500]}
        />
        <ArrowDownUp size={22} onPress={() => setModalVisible(true)} color={theme.primary[950]} />
      </View>

      {/* Filter Slider */}
      {isOwner && (
        <View className="mt-1 px-4 pb-4">
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
      )}

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

      <Animated.FlatList
        data={sorted}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          paddingHorizontal: 16,
        }}
        contentContainerStyle={{
          gap: ROW_GAP,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
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
                if (isOwner) {
                  setActiveItem(item);
                  setStatusPickerModalVisible(true);
                }
              }}
              delayLongPress={300}
              activeOpacity={0.85}
              style={{ flex: 1, maxWidth: '31%' }}>
              <View className="relative w-full overflow-hidden rounded-xl">
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
            actions.updateItemStatus(activeItem, newStatus);
          }}
          onDelete={() => {
            setStatusPickerModalVisible(false);
            actions.deleteItem(activeItem);
          }}
        />
      )}
      <ListInfoModal
        list={list}
        visible={listInfoModalVisible}
        onClose={() => setListInfoModalVisible(false)}
        onConfirm={(updates: Partial<List>) => {
          setListInfoModalVisible(false);
          actions.updateList(updates);
        }}
        onDelete={() => {
          setListInfoModalVisible(false);
          actions.deleteList();
        }}
      />
    </SafeAreaView>
  );
}
