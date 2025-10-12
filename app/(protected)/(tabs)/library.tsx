import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, TextInput } from 'react-native';
import { ArrowDownUp } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { useLists } from '~/store/listStore';
import { useState } from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const FILTERS = ['All', 'Watching', 'Watched', 'Pending'];

export default function Library() {
  const theme = useTheme();
  const [selected, setSelected] = useState(0);



  return (
    <SafeAreaView className="flex-1 bg-primary-50 dark:bg-primary-950">
      {/* Header */}
      <View className="flex-row items-center justify-start px-4 mb-2">
        <Text className="font-SpaceGrotesk-Bold text-3xl text-primary-950 dark:text-primary-50">
          My Library
        </Text>
      </View>

      {/* Search + Sort */}
      <View className="flex-row items-center justify-between gap-x-2 px-4 py-2">
        <TextInput
          className="text-md flex-1 rounded-full border border-primary-700 py-3 pl-4 font-SpaceGrotesk-Light text-primary-950 focus:border-2 focus:border-primary-950 dark:border-primary-400 dark:text-primary-200 focus:dark:border-primary-50"
          cursorColor={theme.primary[700]}
          selectionColor={theme.primary[700]}
          placeholder="Search your library"
          placeholderTextColor={theme.primary[500]}
        />
        <ArrowDownUp color={theme.primary[950]} />
      </View>
      {/* Filter Slider */}
      <View className="px-4 mt-1">
        <SegmentedControl
          values={FILTERS}
          selectedIndex={selected}
          onChange={(event) => {setSelected(event.nativeEvent.selectedSegmentIndex)}}
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
    </SafeAreaView>
  );
}
