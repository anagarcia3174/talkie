import { View, Text, TouchableOpacity } from 'react-native';
import { haptics } from '~/utils/haptics';

interface MediaTabsProps {
  selectedIndex: number;
  onChange: (index: number) => void;
  options: string[];
}

export default function MediaTabs({ selectedIndex, onChange, options }: MediaTabsProps) {
  return (
    <View className="mb-2 overflow-hidden rounded-b-2xl bg-primary-100 dark:bg-primary-900">
      <View className="flex-row gap-0.5 px-1.5 pb-1.5 pt-2">
        {options.map((option, index) => {
          const active = selectedIndex === index;
          const isFirst = index === 0;
          const isLast = index === options.length - 1;
          return (
            <TouchableOpacity
              key={option}
              onPress={() => {
                haptics.action();
                onChange(index);
              }}
              className={`flex-1 items-center rounded-lg py-1.5 ${isFirst ? 'rounded-bl-xl' : ''} ${isLast ? 'rounded-br-xl' : ''} ${active ? 'bg-primary-300 dark:bg-primary-800' : ''}`}>
              <Text
                className={`text-md ${active ? 'font-SpaceGrotesk-Medium text-primary-950 dark:text-primary-50' : 'font-SpaceGrotesk-Light text-primary-600 dark:text-primary-400'}`}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
