import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { haptics } from '~/utils/haptics';

interface MediaTabsProps {
  selectedIndex: number;
  onChange: (index: number) => void;
  options: string[];
}

export default function MediaTabs({ selectedIndex, onChange, options }: MediaTabsProps) {
  const theme = useTheme();

  return (
    <View className="mb-2 w-full">
      <SegmentedControl
        values={options}
        selectedIndex={selectedIndex}
        onChange={(event) => {
          haptics.action();
          onChange(event.nativeEvent.selectedSegmentIndex)}}
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
  );
}
