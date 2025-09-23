import { View, Text  } from 'react-native';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View className="mt-6">
    <Text className="mb-2 px-4 font-SpaceGrotesk-SemiBold text-2xl text-primary-900 dark:text-primary-200">
      {title}
    </Text>
    {children}
  </View>
);


export default Section;