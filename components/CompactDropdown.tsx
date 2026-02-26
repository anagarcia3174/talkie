import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Modal, ScrollView, LayoutRectangle } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { BlurView } from 'expo-blur';

export default function CompactDropdown({
  label,
  items,
  selectedValue,
  onSelect,
  getLabel,
  getValue,
}: {
  label: string;
  items: any[];
  selectedValue: number | undefined;
  onSelect: (value: number) => void;
  getLabel: (item: any) => string;
  getValue: (item: any) => number;
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
        onPress={openDropdown}
        style={{ backgroundColor: theme.primaryOpacity[950] }}
        disabled={isDisabled}
        className="flex-1 flex-row items-center justify-between rounded-lg px-3 py-2">
        <Text className="text-md font-SpaceGrotesk-SemiBold text-primary-900 dark:text-primary-200">
          {selectedLabel}
        </Text>
        {!isDisabled && <ChevronDown size={14} color={theme.primary[600]} />}
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
              <ScrollView bounces={false}>
                {items.map((item) => {
                  const value = getValue(item);
                  const isSelected = selectedValue === value;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => {
                        onSelect(value);
                        setOpen(false);
                      }}
                      style={{
                        backgroundColor: isSelected
                          ? `${theme.primary[950]}99` // 👈 hex + alpha for selected tint
                          : 'transparent',
                      }}
                      className="px-3 py-1.5">
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
