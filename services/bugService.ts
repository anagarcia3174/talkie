import { VoidResult, errorVoid, successVoid } from '~/types/supabaseTypes';
import { supabase } from '~/utils/supabase';
import { CreateBugReportInput } from '~/types/supabaseTypes';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

export async function createBugReport(input: CreateBugReportInput): Promise<VoidResult> {
  try {
    const appVersion = Constants.expoConfig?.version ?? null;

    const deviceInfo = `${Device.brand ?? 'Unknown'} ${Device.modelName ?? ''} (${Device.osName} ${Device.osVersion})`;

    const { error } = await supabase.from('bug_reports').insert({
      description: input.description,
      steps_to_reproduce: input.steps_to_reproduce ?? null,
      app_version: appVersion,
      device_info: deviceInfo,
    });

    if (error) {
      return errorVoid(error, {
        operation: 'create_bug_report',
        table: 'bug_reports',
        isWrite: true,
      });
    }

    return successVoid();
  } catch (err: any) {
    return errorVoid(err, {
      operation: 'create_bug_report',
      table: 'bug_reports',
      isWrite: true,
    });
  }
}
