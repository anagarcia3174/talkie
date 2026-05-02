import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, TextInput, TouchableOpacity, Image, FlatList } from 'react-native';
import {
  ArrowDownUp,
  Bookmark,
  ChevronLeft,
  Globe,
  Heart,
  Lock,
  SquarePen,
  UserRound,
} from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useState } from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useRouter } from 'expo-router';
import SortByModal from '~/components/SortByModal';
import { ListItemWithMedia, List, Status, ListWithMeta } from '~/types/supabaseTypes';
import StatusPickerModal from './StatusPickerModal';
import ListInfoModal from './ListInfoModal';
import { getPublicUrl } from '~/utils/storageUrl';
import { ScrollView } from 'react-native-gesture-handler';

import { haptics } from '~/utils/haptics';
import DeleteItemModal from './DeleteItemModal';

interface ListActions {
  updateItemStatus: (item: ListItemWithMedia, status: Status) => Promise<void>;
  deleteItem: (item: ListItemWithMedia) => Promise<boolean>;
  updateList: (updates: Partial<List>) => Promise<boolean>;
  deleteList: () => Promise<void>;
  like: () => Promise<boolean>;
  unlike: () => Promise<boolean>;
}

interface ListContentProps {
  list: ListWithMeta;
  listItems: ListItemWithMedia[];
  actions: ListActions;
  isOwner: boolean;
}

const FILTERS = ['All', 'Watching', 'Watched', 'Pending'];
const ROW_GAP = 16;
type FilterIndex = 0 | 1 | 2 | 3;
export type SortType = 'alpha' | 'release' | 'added';
export type SortOrder = 'asc' | 'desc';

export default function ListContent({ list, listItems, actions, isOwner }: ListContentProps) {
  const theme = useTheme();
  const [selected, setSelected] = useState<FilterIndex>(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('added');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [statusPickerModalVisible, setStatusPickerModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeItem, setActiveItem] = useState<ListItemWithMedia | null>(null);
  const [listInfoModalVisible, setListInfoModalVisible] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [deleteItemModalVisible, setDeleteItemModalVisible] = useState(false);
  const [deleteListModalVisible, setDeleteListModalVisible] = useState(false);
  const router = useRouter();

  const statusMap: Record<FilterIndex, Status | null> = {
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

  const getIsPrivateIcon = () => {
    switch (list.is_private) {
      case true:
        return <Lock size={14} color={theme.primary[950]} strokeWidth={2.5} />;
      case false:
        return <Globe size={14} color={theme.primary[950]} strokeWidth={2.5} />;
      default:
        return null;
    }
  };

  const handleItemDelete = async () => {
    if (!activeItem || loadingAction === `delete-item-${activeItem.id}`) return;

    try {
      setLoadingAction(`delete-item-${activeItem.id}`);
      await actions.deleteItem(activeItem);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteList = async () => {
    if (loadingAction) return;

    try {
      setLoadingAction('delete-list');
      await actions.deleteList();
    } finally {
      setLoadingAction(null);
    }
  };

  const DotSeparator = () => <Text className="mx-1 text-primary-400 dark:text-primary-600">•</Text>;

  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950" edges={['top']}>
      {/* Collapsing Header */}
      <View className="flex-row items-center justify-between px-4 mb-2">
        <TouchableOpacity onPress={() => router.back()} className="rounded-md   bg-primary-100 p-1  dark:bg-primary-900">
          <ChevronLeft color={theme.primary[950]} size={20} strokeWidth={2}/>
        </TouchableOpacity>
        <Text className="font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
          List
        </Text>
        {isOwner ? (
          <TouchableOpacity
            className="rounded-md   bg-primary-100 p-1  dark:bg-primary-900"
            disabled={!isOwner}
            onPress={() => isOwner && setListInfoModalVisible(true)}>
            <SquarePen color={isOwner ? theme.primary[950] : theme.primary[50]} size={20} strokeWidth={2}/>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="rounded-md   bg-primary-100 p-1  dark:bg-primary-900"
            disabled={isOwner || loadingAction === 'like-toggle'}
            onPress={async () => {
              if (isOwner || loadingAction === 'like-toggle') return;
              haptics.action();
              try {
                setLoadingAction('like-toggle');

                if (list.is_liked) {
                  await actions.unlike();
                } else {
                  await actions.like();
                }
              } finally {
                setLoadingAction(null);
              }
            }}>
            <Heart
              color={list.is_liked ? '#e11d48' : theme.primary[950]}
              fill={list.is_liked ? '#e11d48' : 'transparent'}
              fillOpacity={list.is_liked ? 1 : 0}
              size={20}
            />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView stickyHeaderIndices={[1]}>
        <View>
          <View className="px-4 pb-3">
            <View className="overflow-hidden rounded-2xl border border-primary-200 bg-primary-100 dark:border-primary-800 dark:bg-primary-900">
              {/* Title + owner + description */}
              <View className="p-4">
                <Text className="font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
                  {list.name}
                </Text>

                {!isOwner && list.owner && (
                  <TouchableOpacity
                    disabled={list.owner.is_private}
                    onPress={() => {
                      haptics.action();
                      if (list.owner && !list.owner.is_private) {
                        router.push({
                          pathname: '/profile/[id]',
                          params: { id: list.owner.id },
                        });
                      }
                    }}
                    activeOpacity={0.85}
                    className="mt-1 flex-row items-center gap-2">
                    {list.owner.avatar_url ? (
                      <Image
                        source={{ uri: getPublicUrl(list.owner.avatar_url) }}
                        className="h-5 w-5 rounded-full"
                      />
                    ) : (
                      <UserRound size={14} color={theme.primary[600]} />
                    )}
                    <Text className="text-sm text-primary-600 dark:text-primary-400">
                      {list.owner.display_name}
                    </Text>
                  </TouchableOpacity>
                )}

                {list.description && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setDescExpanded((prev) => !prev)}
                    className="">
                    <Text
                      numberOfLines={descExpanded ? undefined : 2}
                      className="text-sm text-primary-700 dark:text-primary-300">
                      {list.description}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Divider */}
              <View className="mx-2 border-t border-primary-200 dark:border-primary-800" />

              {/* Stats row */}
              <View className="flex-row">
                <View className="flex-1 items-center p-3">
                  <Text className="font-SpaceGrotesk-Bold text-lg text-primary-900 dark:text-primary-100">
                    {list.item_count}
                  </Text>
                  <Text className="text-xs text-primary-600 dark:text-primary-400">items</Text>
                </View>

                <View className="my-2 border-l border-primary-200 dark:border-primary-800" />

                <View className="flex-1 items-center p-3">
                  <Text className="font-SpaceGrotesk-Bold text-lg text-primary-900 dark:text-primary-100">
                    {list.like_count}
                  </Text>
                  <Text className="text-xs text-primary-600 dark:text-primary-400">likes</Text>
                </View>

                <View className="my-2 border-l border-primary-200 dark:border-primary-800" />

                <View className="flex-1 items-center p-3">
                  <View className=" py-1.5">{getIsPrivateIcon()}</View>
                  <Text className="text-xs text-primary-600 dark:text-primary-400">
                    {list.is_private ? 'Private' : 'Public'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View className="px-4 pb-3 pt-1">
          <View className="rounded-2xl border border-primary-200 bg-primary-100 p-3 dark:border-primary-800 dark:bg-primary-900">
            {/* Search + sort */}
            <View className="flex-row items-center gap-2">
              <TextInput
                value={search}
                cursorColor={theme.primary[700]}
                selectionColor={theme.primary[700]}
                onChangeText={setSearch}
                placeholder={`Search ${list.name}`}
                placeholderTextColor={theme.primary[500]}
                className="flex-1 rounded-xl bg-primary-50 px-4 py-2 text-primary-950 dark:bg-primary-800 dark:text-primary-200"
              />

              <TouchableOpacity
                onPress={() => {
                  haptics.action();
                  setModalVisible(true);
                }}>
                <ArrowDownUp size={20} color={theme.primary[700]} />
              </TouchableOpacity>
            </View>

            {/* Filter chips */}
            {isOwner && (
              <View className="mt-3 flex-row gap-2">
                {FILTERS.map((filter, index) => {
                  const active = selected === index;
                  return (
                    <TouchableOpacity
                      key={filter}
                      onPress={() => {
                        haptics.action();
                        setSelected(index as FilterIndex);
                      }}
                      className={`flex-1 items-center rounded-full py-1.5 ${
                        active
                          ? 'bg-primary-900 dark:bg-primary-100'
                          : 'bg-primary-200 dark:bg-primary-800'
                      }`}>
                      <Text
                        className={`text-sm ${
                          active
                            ? 'text-primary-50 dark:text-primary-900'
                            : 'text-primary-700 dark:text-primary-300'
                        }`}>
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
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
          scrollEnabled={false}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            paddingHorizontal: 16,
          }}
          contentContainerStyle={{
            paddingBottom: 24,
            gap: ROW_GAP,
          }}
          renderItem={({ item }) => {
            const statusBadgeClass =
              item.status === 'watching'
                ? 'bg-amber-400'
                : item.status === 'watched'
                  ? 'bg-green-400'
                  : 'bg-red-400';
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
                    haptics.action();
                    setActiveItem(item);
                    setStatusPickerModalVisible(true);
                  }
                }}
                delayLongPress={300}
                style={{ flex: 1, maxWidth: '31%' }}>
                <View className="overflow-hidden rounded-2xl bg-primary-100 p-1 dark:bg-primary-900">
                  {isOwner && item.status && (
                    <View className={`absolute right-0 top-0 h-5 w-5 ${statusBadgeClass}`} />
                  )}
                  <View className="overflow-hidden rounded-xl bg-primary-200 dark:bg-primary-800">
                    <Image
                      source={{ uri: `https://image.tmdb.org/t/p/w342${item.media?.poster_path}` }}
                      style={{ width: '100%', aspectRatio: 2 / 3 }}
                      resizeMode="cover"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </ScrollView>

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
          onConfirm={async (newStatus) => {
            if (!activeItem || loadingAction === `update-status-${activeItem.id}`) return;

            try {
              setLoadingAction(`update-status-${activeItem.id}`);
              await actions.updateItemStatus(activeItem, newStatus);
              setStatusPickerModalVisible(false);
            } finally {
              setLoadingAction(null);
            }
          }}
          onDelete={() => {
            setStatusPickerModalVisible(false);
            setDeleteItemModalVisible(true);
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
          setDeleteListModalVisible(true);
        }}
      />
      <DeleteItemModal
        item={activeItem?.media.media_type}
        visible={deleteItemModalVisible}
        onClose={(deleteItem: boolean) => {
          setDeleteItemModalVisible(false);
          if (deleteItem) handleItemDelete();
        }}
      />
      <DeleteItemModal
        item="list"
        visible={deleteListModalVisible}
        onClose={(deleteItem: boolean) => {
          setDeleteListModalVisible(false);
          if (deleteItem) handleDeleteList();
        }}
      />
    </SafeAreaView>
  );
}
