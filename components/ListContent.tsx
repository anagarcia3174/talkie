import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, TextInput, TouchableOpacity, Image, FlatList } from 'react-native';
import { ArrowDownUp, Bookmark, ChevronLeft, Globe, Lock, UserRound } from 'lucide-react-native';
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
        return <Lock size={14} color={theme.primary[600]} />;
      case false:
        return <Globe size={14} color={theme.primary[600]} />;
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
      <View className="flex-row items-center justify-between  px-2">
        <TouchableOpacity onPress={() => router.back()} className=" p-2">
          <ChevronLeft color={theme.primary[950]} size={24} />
        </TouchableOpacity>
        <Text className="font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
          List
        </Text>
        <TouchableOpacity
          className=" p-2"
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
          <Bookmark
            color={isOwner ? theme.primary[50] : theme.primary[950]}
            fill={isOwner ? theme.primary[50] : theme.primary[950]}
            fillOpacity={list.is_liked ? 1 : 0}
            size={24}
          />
        </TouchableOpacity>
      </View>
      <ScrollView stickyHeaderIndices={[1]}>
        <View>
          <View className="px-4 pb-2">
            <TouchableOpacity
              disabled={!isOwner}
              onPress={() => isOwner && setListInfoModalVisible(true)}
              activeOpacity={0.8}>
              <Text className="mb-2 font-SpaceGrotesk-Bold text-3xl text-primary-950 dark:text-primary-50">
                {list.name}
              </Text>

              {/* Stats row */}
              <View className="mb-2 flex-row flex-wrap items-center">
                <Text className="text-sm text-primary-600 dark:text-primary-400">
                  {list.item_count} {list.item_count === 1 ? 'item' : 'items'}
                </Text>

                <DotSeparator />

                <View className="flex-row items-center gap-1">
                  {getIsPrivateIcon()}
                  <Text className="text-sm capitalize text-primary-600 dark:text-primary-400">
                    {list.is_private ? 'Private' : 'Public'}
                  </Text>
                </View>

                <DotSeparator />

                <View className="flex-row items-center gap-1">
                  <Text className="text-sm text-primary-600 dark:text-primary-400">
                    {list.like_count}
                  </Text>
                  <Bookmark size={12} color={theme.primary[600]} />
                </View>
              </View>

              {/* Description */}
              {list.description && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setDescExpanded((prev) => !prev)}>
                  <Text
                    numberOfLines={descExpanded ? undefined : 2}
                    ellipsizeMode={descExpanded ? undefined : 'tail'}
                    className="text-base text-primary-700 dark:text-primary-300">
                    {list.description}
                  </Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>
          {!isOwner && list.owner && (
            <TouchableOpacity
              disabled={list.owner.is_private}
              onPress={() => {
                haptics.action();
                if (list.owner && !list.owner.is_private) {
                  router.push({
                    pathname: '/profile/[id]',
                    params: {
                      id: list.owner.id,
                    },
                  });
                }
              }}
              activeOpacity={0.85}
              className="mx-4 mb-2 rounded-xl border border-primary-200 bg-primary-100 p-3 dark:border-primary-800 dark:bg-primary-900">
              <View className="flex-row items-center justify-between">
                {/* Left: avatar + name */}
                <View className="flex-row items-center gap-3">
                  {list.owner.avatar_url ? (
                    <Image
                      source={{ uri: getPublicUrl(list.owner.avatar_url) }}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-300 dark:bg-primary-700">
                      <UserRound size={16} color={theme.primary[900]} />
                    </View>
                  )}

                  <View>
                    <Text className="font-SpaceGrotesk-Medium text-primary-900 dark:text-primary-100">
                      {list.owner.display_name}
                    </Text>
                    <Text className="text-sm text-primary-600 dark:text-primary-400">
                      List creator
                    </Text>
                  </View>
                </View>

                {/* Right: action */}
                <View className="rounded-full border border-primary-300 px-3 py-1.5 dark:border-primary-700">
                  {list.owner.is_private ? (
                    <Lock size={14} color={theme.primary[600]} />
                  ) : (
                    <Text className="font-SpaceGrotesk-Medium text-sm text-primary-900 dark:text-primary-100">
                      View
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
        <View className=" bg-primary-50 px-4 pb-3 pt-2 dark:bg-primary-950">
          <View className="flex-row items-center gap-x-2">
            <TextInput
              value={search}
              onChangeText={setSearch}
              className="flex-1 rounded-xl border border-primary-700 px-4 py-3 text-primary-950 dark:border-primary-400 dark:text-primary-200"
              placeholder={`Search through ${list.name}`}
              placeholderTextColor={theme.primary[500]}
            />
            <ArrowDownUp
              size={22}
              onPress={() => {
                haptics.action();
                setModalVisible(true);
              }}
              color={theme.primary[950]}
            />
          </View>

          {isOwner && (
            <View className="mt-3">
              <SegmentedControl
                values={FILTERS}
                selectedIndex={selected}
                onChange={(e) => {
                  haptics.action();
                  setSelected(e.nativeEvent.selectedSegmentIndex as FilterIndex);
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
          renderItem={({ item }) => (
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
              <View className="overflow-hidden rounded-xl">
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w342${item.media?.poster_path}` }}
                  className="h-56 w-full"
                />
              </View>
            </TouchableOpacity>
          )}
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
