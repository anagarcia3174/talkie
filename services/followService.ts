import {
  DataResult,
  errorData,
  errorVoid,
  Profile,
  successData,
  successVoid,
  VoidResult,
} from '~/types/supabaseTypes';
import { supabase } from '~/utils/supabase';

export async function followUser(currentUserId: string, targetUserId: string): Promise<VoidResult> {
  try {
    const { error } = await supabase.from('follows').insert({
      follower_id: currentUserId,
      following_id: targetUserId,
    });
    if (error) {
      return errorVoid(error, {
        operation: 'follow_user',
        table: 'follows',
        isWrite: true,
      });
    }
    return successVoid();
  } catch (err: any) {
    return errorVoid(err, {
      operation: 'follow_user',
      table: 'follows',
      isWrite: true,
    });
  }
}

export async function unFollowUser(
  currentUserId: string,
  targetUserId: string
): Promise<VoidResult> {
  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId);
    if (error) {
      return errorVoid(error, {
        operation: 'unfollow_user',
        table: 'follows',
        isWrite: true,
      });
    }
    return successVoid();
  } catch (err: any) {
    return errorVoid(err, {
      operation: 'unfollow_user',
      table: 'follows',
      isWrite: true,
    });
  }
}

export async function checkFollowing(
  currentUserId: string,
  targetUserId: string
): Promise<DataResult<boolean>> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
      .maybeSingle();

    if (error) {
      return errorData(error, {
        operation: 'check_following',
        table: 'follows',
        isWrite: false,
      });
    }

    return successData(data !== null);
  } catch (err: any) {
    return errorData(err, {
      operation: 'check_following',
      table: 'follows',
      isWrite: false,
    });
  }
}

export async function getFollowers(currentUserId: string): Promise<DataResult<Profile[]>> {
  try {
    const { data, error } = await supabase.rpc('get_followers', {
      user_id: currentUserId,
    });

    if (error) {
      return errorData(error, {
        operation: 'get_followers',
        table: 'profiles',
      });
    }

    return successData(data ?? []);
  } catch (err: any) {
    return errorData(err, {
      operation: 'get_followers',
      table: 'profiles',
    });
  }
}

export async function getFollowing(currentUserId: string): Promise<DataResult<Profile[]>> {
  try {
    const { data, error } = await supabase.rpc('get_following', {
      user_id: currentUserId,
    });

    if (error) {
      return errorData(error, {
        operation: 'get_following',
        table: 'profiles',
      });
    }

    return successData(data ?? []);
  } catch (err: any) {
    return errorData(err, {
      operation: 'get_following',
      table: 'profiles',
    });
  }
}

export async function getFollowingIds(currentUserId: string): Promise<DataResult<string[]>> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUserId);

    if (error) {
      return errorData(error, {
        operation: 'get_following_ids',
        table: 'follows',
        isWrite: false,
      });
    }

    const ids = (data ?? []).map((row) => row.following_id);

    return successData(ids);
  } catch (err: any) {
    return errorData(err, {
      operation: 'get_following_ids',
      table: 'follows',
      isWrite: false,
    });
  }
}

export async function getFollowerIds(currentUserId: string): Promise<DataResult<string[]>> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', currentUserId);

    if (error) {
      return errorData(error, {
        operation: 'get_follower_ids',
        table: 'follows',
        isWrite: false,
      });
    }

    const ids = (data ?? []).map((row) => row.follower_id);

    return successData(ids);
  } catch (err: any) {
    return errorData(err, {
      operation: 'get_follower_ids',
      table: 'follows',
      isWrite: false,
    });
  }
}
