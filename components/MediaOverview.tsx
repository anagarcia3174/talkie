import { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
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
    <View className="mb-2 w-full">
      <Text className="font-SpaceGrotesk-SemiBold text-xl text-primary-900 dark:text-primary-50">
        Overview
      </Text>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <Text
          className="font-SpaceGrotesk-Regular text-primary-700 dark:text-primary-200"
          numberOfLines={isLong && !expanded ? 2 : undefined}>
          {synopsis}
        </Text>
      </Pressable>
    </View>
  );
}
