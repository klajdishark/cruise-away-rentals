import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useToast} from '@/hooks/use-toast';

interface SystemSetting {
    id: string;
    setting_key: string;
    setting_value: any;
    description?: string;
    created_at: string;
    updated_at: string;
}

export const useSystemSettings = () => {
    const {toast} = useToast();
    const queryClient = useQueryClient();

    const {data: settings, isLoading, error} = useQuery({
        queryKey: ['system-settings'],
        queryFn: async () => {
            const {data, error} = await supabase
                .from('system_settings')
                .select('*')
                .order('setting_key');

            if (error) throw error;
            return data as SystemSetting[];
        },
    });

    const updateSettingMutation = useMutation({
        mutationFn: async ({key, value}: { key: string; value: any }) => {
            const {data, error} = await supabase
                .from('system_settings')
                .update({setting_value: value})
                .eq('setting_key', key)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['system-settings']});
            toast({
                title: "Success",
                description: "Setting updated successfully",
            });
        },
        onError: (error) => {
            console.error('Error updating setting:', error);
            toast({
                title: "Error",
                description: "Failed to update setting",
                variant: "destructive",
            });
        },
    });

    const getSetting = (key: string) => {
        const setting = settings?.find(s => s.setting_key === key);
        return setting?.setting_value;
    };

    const updateSetting = (key: string, value: any) => {
        updateSettingMutation.mutate({key, value});
    };

    return {
        settings,
        isLoading,
        error,
        getSetting,
        updateSetting,
        isUpdating: updateSettingMutation.isPending,
    };
};
