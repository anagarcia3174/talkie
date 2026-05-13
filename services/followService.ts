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

export async function followUser(targetUserId: string): Promise<VoidResult> {
  try {
    const { error } = await supabase.from('follows').insert({
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

export async function unfollowUser(targetUserId: string): Promise<VoidResult> {
  try {
    const { error } = await supabase.from('follows').delete().eq('following_id', targetUserId);
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

export async function getFollowers(currentUserId?: string): Promise<DataResult<Profile[]>> {
  try {
    const userId = currentUserId ?? (await supabase.auth.getUser()).data.user?.id;
    if (!userId)
      return errorData('Not authenticated', { operation: 'get_followers', table: 'profiles' });

    const { data, error } = await supabase.rpc('get_followers', {
      user_id: userId,
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

export async function getFollowing(currentUserId?: string): Promise<DataResult<Profile[]>> {
  try {
    const userId = currentUserId ?? (await supabase.auth.getUser()).data.user?.id;
    if (!userId)
      return errorData('Not authenticated', { operation: 'get_following', table: 'profiles' });

    const { data, error } = await supabase.rpc('get_following', {
      user_id: userId,
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

export async function getFollowingIds(): Promise<DataResult<string[]>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return errorData('Not authenticated', {
        operation: 'get_following_ids',
        table: 'follows',
        isWrite: false,
      });

    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    if (error) {
      return errorData(error, {
        operation: 'get_following_ids',
        table: 'follows',
        isWrite: false,
      });
    }

    return successData((data ?? []).map((row) => row.following_id));
  } catch (err: any) {
    return errorData(err, {
      operation: 'get_following_ids',
      table: 'follows',
      isWrite: false,
    });
  }
}

export async function getFollowerIds(): Promise<DataResult<string[]>> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return errorData('Not authenticated', {
        operation: 'get_follower_ids',
        table: 'follows',
        isWrite: false,
      });

    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', user.id);

    if (error) {
      return errorData(error, {
        operation: 'get_follower_ids',
        table: 'follows',
        isWrite: false,
      });
    }

    return successData((data ?? []).map((row) => row.follower_id));
  } catch (err: any) {
    return errorData(err, {
      operation: 'get_follower_ids',
      table: 'follows',
      isWrite: false,
    });
  }
}
