import { View, Text } from 'react-native';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode; // optional button, icon, etc.
}

const Section = ({ title, children, action }: SectionProps) => (
  <View className="mt-6">
    {/* Header row */}
    <View className="mb-2 flex-row items-center justify-between px-4">
      <Text className="font-SpaceGrotesk-SemiBold text-2xl text-primary-900 dark:text-primary-200">
        {title}
      </Text>
      {action && <View>{action}</View>}
    </View>

    {/* Content */}
    {children}
  </View>
);

export default Section;
