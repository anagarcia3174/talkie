import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Modal, ScrollView, LayoutRectangle } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { BlurView } from 'expo-blur';
import { haptics } from '~/utils/haptics';

export default function CompactDropdown({
  label,
  items,
  selectedValue,
  onSelect,
  getLabel,
  getValue,
  disabled = false,
}: {
  label: string;
  items: any[];
  selectedValue: number | undefined;
  onSelect: (value: number) => void;
  getLabel: (item: any) => string;
  getValue: (item: any) => number;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);
  const buttonRef = useRef<View>(null);

  const selectedItem = items.find((i) => getValue(i) === selectedValue);
  const selectedLabel = selectedItem ? getLabel(selectedItem) : label;
  const isDisabled = items.length <= 1;

  const openDropdown = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };

  return (
    <>
      {/* Trigger button */}
      <Pressable
        ref={buttonRef}
        onPress={() => {
          if (disabled || isDisabled) {
            haptics.error();
            return;
          }

          haptics.action();
          openDropdown();
        }}
        className="flex-row items-center gap-1 rounded-xl bg-primary-200 px-2.5 py-1 dark:bg-primary-800">
        <Text className="font-SpaceGrotesk-SemiBold text-sm text-primary-900 dark:text-primary-200 ">
          {selectedLabel}
        </Text>
        {!isDisabled && !disabled && <ChevronDown size={12} color={theme.primary[600]} />}
      </Pressable>

      {/* Dropdown modal */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        {/* Backdrop */}
        <Pressable className="flex-1" onPress={() => setOpen(false)} />

        {anchor && (
          <View
            style={{
              position: 'absolute',
              top: anchor.y + anchor.height + 4,
              left: anchor.x,
              width: anchor.width,
              maxHeight: 200,
              borderRadius: 8,
              overflow: 'hidden',
            }}>
            <BlurView intensity={40}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                className="bg-primary-100 dark:bg-primary-900">
                {items.map((item) => {
                  const value = getValue(item);
                  const isSelected = selectedValue === value;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => {
                        haptics.action();
                        onSelect(value);
                        setOpen(false);
                      }}
                      style={{
                        backgroundColor: isSelected
                          ? `${theme.primary[950]}99` // 👈 hex + alpha for selected tint
                          : 'transparent',
                      }}
                      className="border-b-[0.8px] border-primary-200 px-3 py-1.5 dark:border-primary-800">
                      <Text
                        style={{
                          fontFamily: isSelected ? 'SpaceGrotesk-Medium' : 'SpaceGrotesk-Light',
                          fontSize: 15,
                          color: isSelected ? theme.primary[100] : theme.primary[600],
                          textAlign: 'center',
                        }}>
                        {getLabel(item)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </BlurView>
          </View>
        )}
      </Modal>
    </>
  );
}
