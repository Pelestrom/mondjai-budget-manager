import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface Settings {
  id: string;
  user_id: string;
  fixed_expenses_enabled: boolean;
  detailed_stats_enabled: boolean;
  smart_bar_enabled: boolean;
  notifications_enabled: boolean;
}

export const useSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Settings | null;
    },
    enabled: !!user,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<Settings>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('settings')
        .update(updates)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const toggleSetting = async (setting: keyof Omit<Settings, 'id' | 'user_id'>) => {
    if (!settings) return;
    await updateSettingsMutation.mutateAsync({ [setting]: !settings[setting] });
  };

  return {
    settings: settings ?? {
      fixed_expenses_enabled: true,
      detailed_stats_enabled: true,
      smart_bar_enabled: true,
      notifications_enabled: true,
    },
    isLoading,
    updateSettings: updateSettingsMutation.mutateAsync,
    toggleSetting,
  };
};
