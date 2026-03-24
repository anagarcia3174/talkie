import { supabase } from '~/utils/supabase';
import type { ReportReason, VoidResult } from '~/types/supabaseTypes';
import { successVoid, errorVoid } from '~/types/supabaseTypes';


export async function reportComment(
  commentId: number,
  reason: ReportReason,
  details?: string
): Promise<VoidResult> {
  try {
    const { error } = await supabase.from('reports').insert({
      comment_id: commentId,
      reason,
      details: details ?? null,
    });

    if (error)
      return errorVoid(error, {
        operation: 'report_comment',
        table: 'reports',
        isWrite: true,
      });

    return successVoid();
  } catch (err) {
    return errorVoid(err, {
      operation: 'report_comment',
      table: 'reports',
      isWrite: true,
    });
  }
}

export async function reportReview(
  reviewId: number,
  reason: ReportReason,
  details?: string
): Promise<VoidResult> {
  try {
    const { error } = await supabase.from('reports').insert({
      review_id: reviewId,
      reason,
      details: details ?? null,
    });

    if (error)
      return errorVoid(error, {
        operation: 'report_review',
        table: 'reports',
        isWrite: true,
      });

    return successVoid();
  } catch (err) {
    return errorVoid(err, {
      operation: 'report_review',
      table: 'reports',
      isWrite: true,
    });
  }
}