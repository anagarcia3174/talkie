import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ArrowBigDownDash, Keyboard, Timer } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import BottomSheet from './BottomSheet';
import { haptics } from '~/utils/haptics';

export interface LiveSettings {
  pauseWhileTyping: boolean;
  typingDelaySeconds: number;
  autoScroll: boolean;
}

export const DEFAULT_LIVE_SETTINGS: LiveSettings = {
  pauseWhileTyping: true,
  typingDelaySeconds: 5,
  autoScroll: true,
};

interface LiveSettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  settings: LiveSettings;
  onApply: (settings: LiveSettings) => void;
}

function Toggle({ active, onPress }: { active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View
        className={`h-6 w-11 justify-center rounded-full px-0.5 ${
          active ? 'bg-primary-800 dark:bg-primary-900' : 'bg-primary-300 dark:bg-primary-700'
        }`}>
        <View
          className={`h-5 w-5 rounded-full ${
            active ? 'bg-primary-50 dark:bg-primary-200' : 'bg-primary-50 dark:bg-primary-200'
          } ${active ? 'self-end' : 'self-start'}`}
        />
      </View>
    </TouchableOpacity>
  );
}

const DELAY_OPTIONS: { label: string; value: number }[] = [
  { label: 'Off', value: 0 },
  { label: '3s', value: 3 },
  { label: '5s', value: 5 },
  { label: '10s', value: 10 },
];

function SettingRow({
  icon,
  label,
  description,
  right,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  right: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center gap-x-3 rounded-xl bg-primary-200 px-3 py-2 dark:bg-primary-800">
      <View className="rounded-lg bg-primary-300 p-1.5 dark:bg-primary-700">{icon}</View>
      <View className="flex-1">
        <Text className="font-SpaceGrotesk-Medium text-sm text-primary-950 dark:text-primary-50">
          {label}
        </Text>
        <Text className="font-SpaceGrotesk-Light text-xs text-primary-500 dark:text-primary-400">
          {description}
        </Text>
      </View>
      {right}
    </View>
  );
}

export default function LiveSettingsModal({
  isVisible,
  onClose,
  settings,
  onApply,
}: LiveSettingsModalProps) {
  const theme = useTheme();
  const [local, setLocal] = useState<LiveSettings>(settings);

  useEffect(() => {
    if (isVisible) setLocal(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const handleReset = () => {
    haptics.action();
    setLocal(DEFAULT_LIVE_SETTINGS);
  };

  const handleApply = () => {
    haptics.success();
    onApply(local);
  };

  return (
    <BottomSheet isVisible={isVisible} onClose={onClose}>
      <View className="flex-row items-center justify-between">
        <Text className="font-SpaceGrotesk-Bold text-xl text-primary-950 dark:text-primary-50">
          Live Settings
        </Text>
        <TouchableOpacity onPress={handleReset} className="p-2">
          <Text className="font-SpaceGrotesk-Medium text-sm text-primary-500 dark:text-primary-400">
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      <View className="gap-y-3">
        <SettingRow
          icon={<Keyboard size={16} color={theme.primary[700]} />}
          label="Pause while typing"
          description="Freeze timestamp when the comment box is focused"
          right={
            <Toggle
              active={local.pauseWhileTyping}
              onPress={() => {
                haptics.action();
                setLocal((prev) => ({ ...prev, pauseWhileTyping: !prev.pauseWhileTyping }));
              }}
            />
          }
        />

        <View className="gap-y-2.5 rounded-xl bg-primary-200 px-3 py-3 dark:bg-primary-800">
          <View className="flex-row items-center gap-x-3">
            <View className="rounded-lg bg-primary-300 p-1.5 dark:bg-primary-700">
              <Timer size={16} color={theme.primary[700]} />
            </View>
            <View className="flex-1">
              <Text className="font-SpaceGrotesk-Medium text-sm text-primary-950 dark:text-primary-50">
                Typing delay offset
              </Text>
              <Text className="font-SpaceGrotesk-Light text-xs text-primary-500 dark:text-primary-400">
                Subtract seconds from timestamp on post
              </Text>
            </View>
          </View>
          <View className="flex-row gap-0.5 rounded-xl bg-primary-300 p-1.5 dark:bg-primary-700">
            {DELAY_OPTIONS.map(({ label, value }) => {
              const active = local.typingDelaySeconds === value;
              return (
                <TouchableOpacity
                  key={label}
                  onPress={() => {
                    haptics.action();
                    setLocal((prev) => ({ ...prev, typingDelaySeconds: value }));
                  }}
                  className={`flex-1 items-center rounded-lg py-2 ${active ? 'bg-primary-100 dark:bg-primary-900' : ''}`}>
                  <Text
                    className={`text-sm ${active ? 'font-SpaceGrotesk-SemiBold text-primary-950 dark:text-primary-50' : 'font-SpaceGrotesk-Light text-primary-700 dark:text-primary-300'}`}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <SettingRow
          icon={<ArrowBigDownDash size={16} color={theme.primary[700]} />}
          label="Auto-scroll to latest"
          description="Scroll down as new comments appear"
          right={
            <Toggle
              active={local.autoScroll}
              onPress={() => {
                haptics.action();
                setLocal((prev) => ({ ...prev, autoScroll: !prev.autoScroll }));
              }}
            />
          }
        />
      </View>

      <View className="flex-row items-center gap-x-2 pt-2">
        <TouchableOpacity
          onPress={onClose}
          className="flex-1 items-center rounded-xl border border-primary-300 py-2.5 dark:border-primary-700">
          <Text className="font-SpaceGrotesk-Medium text-sm text-primary-700 dark:text-primary-300">
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleApply}
          className="flex-[2] items-center rounded-xl bg-primary-900 py-3 dark:bg-primary-50">
          <Text className="font-SpaceGrotesk-SemiBold text-sm text-primary-50 dark:text-primary-950">
            Apply
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}
