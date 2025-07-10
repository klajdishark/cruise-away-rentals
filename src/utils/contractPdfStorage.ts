
import { supabase } from '@/integrations/supabase/client';

export const uploadContractPDF = async (pdfBlob: Blob, contractId: string, contractNumber: string) => {
  try {
    const fileName = `contract-${contractNumber}-${Date.now()}.pdf`;
    const filePath = `contracts/${contractId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('contract-pdfs')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('contract-pdfs')
      .getPublicUrl(filePath);

    return {
      path: filePath,
      publicUrl: publicUrlData.publicUrl
    };
  } catch (error) {
    console.error('Error uploading contract PDF:', error);
    throw error;
  }
};

export const deleteContractPDF = async (filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from('contract-pdfs')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting PDF:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting contract PDF:', error);
    throw error;
  }
};
