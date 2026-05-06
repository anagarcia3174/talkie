import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ListItemWithMedia } from '~/types/supabaseTypes';

interface LibraryProgressChartProps {
  items: ListItemWithMedia[];
  libraryId: number;
}

type StatKey = 'total' | 'watched' | 'watching' | 'pending';

const STAT_TILES: {
  key: StatKey;
  label: string;
  badgeBgClass: string;
  badgeTextClass: string;
}[] = [
  {
    key: 'total',
    label: 'Total',
    badgeBgClass: 'bg-primary-600/15 dark:bg-primary-400/20',
    badgeTextClass: 'text-primary-700 dark:text-primary-300',
  },
  {
    key: 'watched',
    label: 'Watched',
    badgeBgClass: 'bg-emerald-500/20 dark:bg-emerald-400/25',
    badgeTextClass: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    key: 'watching',
    label: 'Watching',
    badgeBgClass: 'bg-amber-500/20 dark:bg-amber-400/25',
    badgeTextClass: 'text-amber-700 dark:text-amber-400',
  },
  {
    key: 'pending',
    label: 'Pending',
    badgeBgClass: 'bg-red-500/20 dark:bg-red-400/25',
    badgeTextClass: 'text-red-700 dark:text-red-400',
  },
];

const LibraryProgressChart = ({ items, libraryId }: LibraryProgressChartProps) => {
  const router = useRouter();
  const counts = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc[item.status ?? 'pending'] += 1;
        return acc;
      },
      { watched: 0, watching: 0, pending: 0 }
    );
  }, [items]);

  const total = items.length;

  const values: Record<StatKey, number> = {
    total,
    watched: counts.watched,
    watching: counts.watching,
    pending: counts.pending,
  };

  return (
    <View className="px-4">
      <Text className="mb-3 font-SpaceGrotesk-SemiBold text-sm uppercase tracking-wide text-primary-500 dark:text-primary-400">
        Library Progress
      </Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/list/${libraryId}`)}
        className="flex-row gap-1">
        {STAT_TILES.map(({ key, label, badgeBgClass, badgeTextClass }) => (
          <View
            key={key}
            className="min-w-0 flex-1 rounded-2xl  border-primary-100 bg-primary-100 px-1.5 py-3 dark:border-primary-800 dark:bg-primary-900">
            <Text className="mb-2 text-center font-SpaceGrotesk-Bold text-2xl text-primary-950 dark:text-primary-50">
              {values[key]}
            </Text>
            <View className={`self-center rounded-full px-2 py-1 ${badgeBgClass}`}>
              <Text
                className={`text-center font-SpaceGrotesk-SemiBold text-[10px] ${badgeTextClass}`}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}>
                {label}
              </Text>
            </View>
          </View>
        ))}
      </TouchableOpacity>
    </View>
  );
};

export default LibraryProgressChart;
