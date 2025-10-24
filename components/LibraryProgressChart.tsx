import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface LibraryProgressChartProps {
  watched: number;
  watching: number;
  pending: number;
}

const LibraryProgressChart = ({ watched, watching, pending }: LibraryProgressChartProps) => {
  const total = watched + watching + pending;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const gapSize = 3; // space between arcs (degrees)
  const gapPercent = gapSize / 360;

  const segments = [
    {
      label: 'Watched',
      value: watched,
      hexColor: '#10b981',
      lightClass: 'bg-emerald-500',
      darkClass: 'dark:bg-emerald-400',
    },
    {
      label: 'Watching',
      value: watching,
      hexColor: '#f59e0b',
      lightClass: 'bg-amber-500',
      darkClass: 'dark:bg-amber-400',
    },
    {
      label: 'Pending',
      value: pending,
      hexColor: '#ef4444',
      lightClass: 'bg-red-500',
      darkClass: 'dark:bg-red-400',
    },
  ];

  let cumulativePercent = 0;

  return (
    <View className="px-4">
      <Text className="-mb-3 font-SpaceGrotesk-SemiBold text-2xl text-primary-950 dark:text-primary-50">
        Library Progress
      </Text>
      <View className="flex-row items-center gap-x-10 ">
        {/* Chart */}
        <View className="relative">
          <Svg width={150} height={150} viewBox="0 0 150 150">
            {/* Background track */}
            <Circle cx="75" cy="75" r={radius} fill="none" strokeWidth={12} stroke="#d1d5db" />
            {/* Segments */}
            {segments.map((seg, index) => {
              if (seg.value === 0) return null;
              const percent = total > 0 ? seg.value / total : 0;
              const adjustedPercent = Math.max(percent - gapPercent, 0);
              const dashLength = adjustedPercent * circumference;
              const gapLength = circumference - dashLength;
              const rotation = cumulativePercent * 360 + gapSize / 2 - 90;
              cumulativePercent += percent;

              return (
                <Circle
                  key={index}
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="none"
                  strokeWidth={12}
                  strokeLinecap="square"
                  stroke={seg.hexColor}
                  strokeDasharray={`${dashLength} ${gapLength}`}
                  transform={`rotate(${rotation}, 75, 75)`}
                />
              );
            })}
          </Svg>
          {/* Center text */}
          <View className="absolute inset-0 items-center justify-center">
            <Text className="font-SpaceGrotesk-Bold text-xl font-bold text-primary-900 dark:text-primary-50">
              {total}
            </Text>
            <Text className="font-SpaceGrotesk-Regular text-xs text-primary-600 dark:text-primary-400">
              Total
            </Text>
          </View>
        </View>
        {/* Legend */}
        <View className="flex-1 gap-y-3">
          {segments.map((seg, i) => (
            <View key={i} className="flex-row items-center gap-2">
              <View className={`h-4 w-4 rounded-full ${seg.lightClass} ${seg.darkClass}`} />
              <Text className="font-SpaceGrotesk-Regular text-sm font-medium text-primary-900 dark:text-primary-50">
                {seg.label}: {seg.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default LibraryProgressChart;