import { View, Text, TouchableOpacity } from 'react-native';
import { Users, MessageSquareText, Library, Star, Monitor } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { ProfileStats } from '~/types/supabaseTypes';

interface StatsSectionProps {
  stats: ProfileStats;
  onTilePress?: (
    type: 'watched' | 'lists' | 'reviews' | 'comments' | 'followers' | 'following'
  ) => void;
}

export default function StatsSection({ stats, onTilePress }: StatsSectionProps) {
  const theme = useTheme();

  const rows = [
    [
      {
        key: 'watched' as const,
        label: 'Watched',
        value: stats.totalLogged,
        Icon: Monitor,
        color: theme.isDark ? '#4ade80' : '#16a34a',
        flex: 3,
      },
      {
        key: 'lists' as const,
        label: 'Lists',
        value: stats.lists,
        Icon: Library,
        color: theme.isDark ? '#818cf8' : '#4f46e5',
        flex: 2,
      },
    ],
    [
      {
        key: 'reviews' as const,
        label: 'Reviews',
        value: 0,
        Icon: Star,
        color: theme.isDark ? '#f87171' : '#dc2626',
        flex: 2,
      },
      {
        key: 'comments' as const,
        label: 'Comments',
        value: stats.comments,
        Icon: MessageSquareText,
        color: theme.isDark ? '#f59e0b' : '#d97706',
        flex: 3,
      },
    ],
    [
      {
        key: 'followers' as const,
        label: 'Followers',
        value: stats.followers,
        Icon: Users,
        color: theme.primary[500],
        flex: 1,
      },
      {
        key: 'following' as const,
        label: 'Following',
        value: stats.following,
        Icon: Users,
        color: theme.primary[500],
        flex: 1,
      },
    ],
  ];

  return (
    <View className="mb-8">
      <Text className="mb-2 font-SpaceGrotesk-Medium text-sm uppercase tracking-wide text-primary-500 dark:text-primary-400">
        Stats
      </Text>
      <View className="gap-2">
        {rows.map((row, rowIdx) => (
          <View key={rowIdx} className="flex-row gap-2">
            {row.map(({ key, label, value, Icon, color, flex }) => (
              <TouchableOpacity
              disabled={!onTilePress}
                key={key}
                onPress={() => onTilePress?.(key)}
                className="gap-y-1 rounded-xl bg-primary-100 px-4 py-3 dark:bg-primary-900"
                style={{ flex }}>
                <Text className="font-SpaceGrotesk-Bold text-3xl text-primary-950 dark:text-primary-50">
                  {value}
                </Text>
                <View className="flex-row items-center gap-1.5">
                  <Icon size={15} color={color} strokeWidth={2} />
                  <Text className="font-SpaceGrotesk-Regular text-sm text-primary-600 dark:text-primary-400">
                    {label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
