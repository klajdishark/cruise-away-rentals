import {supabase} from '@/integrations/supabase/client';
import {toast} from 'sonner';

interface ImageUploadHelperProps {
    onImageUploaded: (imageUrl: string) => void;
}

export const ImageUploadHelper = ({onImageUploaded}: ImageUploadHelperProps) => {
    const uploadImageToSupabase = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `temp/${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const {data, error} = await supabase.storage
                .from('vehicle-images')
                .upload(fileName, file);

            if (error) {
                console.error('Error uploading image:', error);
                toast.error('Failed to upload image');
                return null;
            }

            // Get the public URL
            const {data: {publicUrl}} = supabase.storage
                .from('vehicle-images')
                .getPublicUrl(fileName);

            onImageUploaded(publicUrl);
            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
            return null;
        }
    };

    return {
        uploadImageToSupabase,
    };
};
