import React from 'react';
import { Pressable, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  SharedValue,
} from 'react-native-reanimated';
import { Menu, Star, List } from 'lucide-react-native';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedText = Animated.createAnimatedComponent(Text);

const SPRING_CONFIG = {
  duration: 1200,
  overshootClamping: true,
  dampingRatio: 0.8,
};

const OFFSET = 60;

interface FloatingActionButtonProps {
  isExpanded: SharedValue<boolean>;
  index: number;
  icon: React.ReactNode;
  label: string;
}

const FloatingActionButton = ({ isExpanded, index, icon, label }: FloatingActionButtonProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const moveValue = isExpanded.value ? OFFSET * index : 0;
    const translateY = withSpring(moveValue, SPRING_CONFIG);
    const scale = withDelay(index * 100, withTiming(isExpanded.value ? 1 : 0));
    const opacity = withDelay(index * 100, withTiming(isExpanded.value ? 1 : 0));

    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const opacity = withDelay(index * 100, withTiming(isExpanded.value ? 1 : 0));
    const translateX = withTiming(isExpanded.value ? 0 : 10);
    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  return (
    <Animated.View
      style={[animatedStyle]}
      className="absolute flex-row items-center right-0"
    >
      {/* Label (to the left) */}
      <AnimatedText
        style={labelStyle}
        className="mr-3 text-base text-primary-900 dark:text-primary-100 font-semibold"
      >
        {label}
      </AnimatedText>

      {/* Button */}
      <AnimatedPressable
        className="h-12 w-12 items-center justify-center rounded-full bg-primary-900/40 dark:bg-primary-100/40"
      >
        {icon}
      </AnimatedPressable>
    </Animated.View>
  );
};

export default function HeaderFAB() {
  const isExpanded = useSharedValue(false);

  const handlePress = () => {
    isExpanded.value = !isExpanded.value;
  };

  const plusIconStyle = useAnimatedStyle(() => {
    const rotate = withTiming(isExpanded.value ? '90deg' : '0deg');
    return { transform: [{ rotate }] };
  });

  return (
    <View className="absolute top-4 right-4 items-center">
      {/* Main button */}
      <AnimatedPressable
        onPress={handlePress}
        className="w-12 h-12 rounded-full bg-primary-900/40 dark:bg-primary-100/40 items-center justify-center z-10">
        <Animated.View style={plusIconStyle}>
          <Menu size={22}  />
        </Animated.View>
      </AnimatedPressable>

      {/* Expanding buttons (downwards) */}
      <FloatingActionButton
        isExpanded={isExpanded}
        index={1}
        label='Rating'
        icon={<Star size={20}  />
    
    }
      />
      <FloatingActionButton
        isExpanded={isExpanded}
        index={2}
        label='Add to list'
        icon={<List size={20}  />}
      />
    </View>
  );
}
