import {
  CreateFeedbackInput,
  VoidResult,
  errorVoid,
  successVoid,
} from '~/types/supabaseTypes';
import { supabase } from '~/utils/supabase';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

export async function createFeedback(
  input: CreateFeedbackInput
): Promise<VoidResult> {
  try {
    const appVersion = Constants.expoConfig?.version ?? null;

    const deviceInfo = `${Device.brand ?? 'Unknown'} ${
      Device.modelName ?? ''
    } (${Device.osName} ${Device.osVersion})`;

    const { error } = await supabase.from('feedback').insert({
      message: input.message,
      category: input.category ?? 'general',
      app_version: appVersion,
      device_info: deviceInfo,
    });

    if (error) {
      return errorVoid(error, {
        operation: 'create_feedback',
        table: 'feedback',
        isWrite: true,
      });
    }

    return successVoid();
  } catch (err: any) {
    return errorVoid(err, {
      operation: 'create_feedback',
      table: 'feedback',
      isWrite: true,
    });
  }
}