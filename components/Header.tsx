import { View, Text } from 'react-native';

export function Header() {
  return (
    <View className="px-4 mb-3">
      <View className="rounded-2xl  ">
        <Text className="font-SpaceGrotesk-Bold text-3xl tracking-tight text-primary-950  dark:text-primary-50">
          Talkie
        </Text>
      </View>
    </View>
  );
}
