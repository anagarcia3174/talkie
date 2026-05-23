import { scheduleOnRN } from 'react-native-worklets';
import { useCallback, useEffect } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const THUMB_SIZE = 16;
const THUMB_HALF = THUMB_SIZE / 2;

interface TimestampSliderProps {
  value: number;
  minimumValue?: number;
  maximumValue: number;
  step?: number;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  minimumTrackColor: string;
  maximumTrackColor: string;
  thumbColor: string;
}

export default function TimestampSlider({
  value,
  minimumValue = 0,
  maximumValue,
  step = 1,
  disabled = false,
  onValueChange,
  onSlidingComplete,
  minimumTrackColor,
  maximumTrackColor,
  thumbColor,
}: TimestampSliderProps) {
  const trackWidth = useSharedValue(0);
  const progress = useSharedValue(0);
  const startProgress = useSharedValue(0);

  const range = Math.max(maximumValue - minimumValue, 1);

  const clamp = (num: number, min: number, max: number) => {
    'worklet';
    return Math.min(Math.max(num, min), max);
  };

  const progressToValue = (nextProgress: number) => {
    'worklet';
    const rawValue = minimumValue + nextProgress * range;
    const steppedValue = Math.round(rawValue / step) * step;
    return clamp(steppedValue, minimumValue, maximumValue);
  };

  const valueToProgress = useCallback(
    (nextValue: number) => {
      return clamp((nextValue - minimumValue) / range, 0, 1);
    },
    [minimumValue, range]
  );

  useEffect(() => {
    progress.value = withTiming(valueToProgress(value), { duration: 120 });
  }, [value, valueToProgress, progress]);

  const handleLayout = (event: LayoutChangeEvent) => {
    trackWidth.value = event.nativeEvent.layout.width;
  };

  const updateFromX = (x: number, complete = false) => {
    'worklet';
    if (trackWidth.value <= 0) return;
    const effectiveWidth = trackWidth.value - THUMB_SIZE;
    const nextProgress = clamp((x - THUMB_HALF) / effectiveWidth, 0, 1);
    const nextValue = progressToValue(nextProgress);
    progress.value = (nextValue - minimumValue) / range;
    if (onValueChange) scheduleOnRN(onValueChange, nextValue);
    if (complete && onSlidingComplete) scheduleOnRN(onSlidingComplete, nextValue);
  };

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onBegin(() => {
      startProgress.value = progress.value;
    })
    .onUpdate((event) => {
      const startX = THUMB_HALF + startProgress.value * (trackWidth.value - THUMB_SIZE);
      updateFromX(startX + event.translationX);
    })
    .onEnd(() => {
      const finalValue = progressToValue(progress.value);
      if (onSlidingComplete) scheduleOnRN(onSlidingComplete, finalValue);
    });

  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onEnd((event) => {
      updateFromX(event.x, true);
    });

  const gesture = Gesture.Race(panGesture, tapGesture);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        // ✅ Clamps thumb within [0, trackWidth - THUMB_SIZE] — never clips outside view
        translateX: progress.value * (trackWidth.value - THUMB_SIZE),
      },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View className="h-10 min-w-[80px] flex-1 justify-center" onLayout={handleLayout}>
        <View
          className="h-2 overflow-hidden rounded-full"
          style={{
            backgroundColor: maximumTrackColor,
            opacity: disabled ? 0.5 : 1,
            marginHorizontal: THUMB_HALF, // ✅ insets track so fill aligns with thumb center
          }}>
          <Animated.View
            className="h-full rounded-full"
            style={[{ backgroundColor: minimumTrackColor }, fillStyle]}
          />
        </View>
        <Animated.View
          pointerEvents="none"
          className="absolute h-4 w-4 rounded-full"
          style={[
            {
              backgroundColor: thumbColor,
              opacity: disabled ? 0.5 : 1,
            },
            thumbStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
}
