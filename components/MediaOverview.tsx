import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';

interface MediaOverviewProps {
  synopsis: string;
}

export default function MediaOverview({ synopsis }: MediaOverviewProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const isLong = synopsis.length > 200;

  return (
    <View className="w-full mb-2">
      <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-900 dark:text-primary-50">
        Overview
      </Text>

      <Text
        className="font-SpaceGrotesk-Regular text-primary-700 dark:text-primary-200"
        numberOfLines={isLong && !expanded ? 2 : undefined}
      >
        {synopsis}
      </Text>

      {isLong && (
        <TouchableOpacity
          className="mt-2 flex-row items-center justify-center"
          onPress={() => setExpanded(!expanded)}
        >
          <Text className="font-SpaceGrotesk-Medium text-sm text-primary-600 dark:text-primary-300">
            {expanded ? 'Show Less' : 'Show More'}
          </Text>

          {expanded ? (
            <ChevronUp
              size={16}
              color={theme.isDark ? theme.primary[300] : theme.primary[600]}
              style={{ marginLeft: 4 }}
            />
          ) : (
            <ChevronDown
              size={16}
              color={theme.isDark ? theme.primary[300] : theme.primary[600]}
              style={{ marginLeft: 4 }}
            />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
