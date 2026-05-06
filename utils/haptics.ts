import * as Haptics from 'expo-haptics';

export const haptics = {
  /**
   * Long press / opening menus / intentional actions
   */
  action: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /**
   * Successful action (add, save, follow, etc.)
   */
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /**
   * Failed action (API error, validation, etc.)
   */
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  /**
   * Risky/destructive confirmation (optional)
   */
  warning: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
};
