import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useToast} from '@/hooks/use-toast';
import {Tables, TablesInsert} from '@/integrations/supabase/types';

type CustomerDocument = Tables<'customer_documents'>;
type CustomerDocumentInsert = TablesInsert<'customer_documents'>;

export const useCustomerDocuments = (customerId?: string) => {
    const {toast} = useToast();
    const queryClient = useQueryClient();

    // Fetch documents for a specific customer
    const {
        data: documents = [],
        isLoading,
        error
    } = useQuery({
        queryKey: ['customer-documents', customerId],
        queryFn: async () => {
            if (!customerId) return [];

            const {data, error} = await supabase
                .from('customer_documents')
                .select('*')
                .eq('customer_id', customerId)
                .order('created_at', {ascending: false});

            if (error) {
                console.error('Error fetching customer documents:', error);
                throw error;
            }

            return data;
        },
        enabled: !!customerId
    });

    // Upload document mutation
    const uploadDocumentMutation = useMutation({
        mutationFn: async ({
                               file,
                               customerId,
                               documentType,
                               documentName
                           }: {
            file: File;
            customerId: string;
            documentType: string;
            documentName: string;
        }) => {
            // First, upload the file to storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${customerId}/${Date.now()}.${fileExt}`;

            const {data: uploadData, error: uploadError} = await supabase.storage
                .from('customer-documents')
                .upload(fileName, file);

            if (uploadError) {
                console.error('Error uploading file:', uploadError);
                throw uploadError;
            }

            // Get the public URL
            const {data: {publicUrl}} = supabase.storage
                .from('customer-documents')
                .getPublicUrl(fileName);

            // Save document record to database
            const documentData: Omit<CustomerDocumentInsert, 'id' | 'created_at'> = {
                customer_id: customerId,
                document_type: documentType,
                document_name: documentName,
                file_url: publicUrl,
                file_size: file.size,
                mime_type: file.type,
            };

            const {data, error} = await supabase
                .from('customer_documents')
                .insert(documentData)
                .select()
                .single();

            if (error) {
                console.error('Error saving document record:', error);
                throw error;
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['customer-documents']});
            toast({
                title: "Document Uploaded",
                description: "Document has been successfully uploaded.",
            });
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: error.message || "Failed to upload document",
            });
        }
    });

    // Delete document mutation
    const deleteDocumentMutation = useMutation({
        mutationFn: async (documentId: string) => {
            // First get the document to find the file path
            const {data: document, error: fetchError} = await supabase
                .from('customer_documents')
                .select('file_url')
                .eq('id', documentId)
                .single();

            if (fetchError) {
                throw fetchError;
            }

            // Extract file path from URL and delete from storage
            if (document?.file_url) {
                const fileName = document.file_url.split('/').pop();
                if (fileName) {
                    await supabase.storage
                        .from('customer-documents')
                        .remove([fileName]);
                }
            }

            // Delete document record from database
            const {error} = await supabase
                .from('customer_documents')
                .delete()
                .eq('id', documentId);

            if (error) {
                console.error('Error deleting document:', error);
                throw error;
            }

            return documentId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['customer-documents']});
            toast({
                title: "Document Deleted",
                description: "Document has been successfully removed.",
            });
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "Delete Failed",
                description: error.message || "Failed to delete document",
            });
        }
    });

    return {
        documents,
        isLoading,
        error,
        uploadDocument: uploadDocumentMutation.mutate,
        deleteDocument: deleteDocumentMutation.mutate,
        isUploading: uploadDocumentMutation.isPending,
        isDeleting: deleteDocumentMutation.isPending,
    };
};
