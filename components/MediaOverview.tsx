import { View, Text, Pressable, Keyboard } from 'react-native';
import { useUI } from '~/store/uiStore';

interface MediaOverviewProps {
  synopsis: string;
}

export default function MediaOverview({ synopsis }: MediaOverviewProps) {
  const { overviewExpanded, setOverviewExpanded } = useUI();

  const isLong = synopsis.length > 200;

  return (
    <View className="mb-2 w-full">
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
          setOverviewExpanded(!overviewExpanded);
        }}>
        <Text
          className="font-SpaceGrotesk-Regular text-primary-700 dark:text-primary-200"
          numberOfLines={isLong && !overviewExpanded ? 5 : undefined}>
          {synopsis}
        </Text>
      </Pressable>
    </View>
  );
}
