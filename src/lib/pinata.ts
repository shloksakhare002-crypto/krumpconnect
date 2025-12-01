import { supabase } from '@/integrations/supabase/client';

export interface PinataUploadResult {
  ipfsHash: string;
  ipfsUrl: string;
  gatewayUrl: string;
  pinSize: number;
  timestamp: string;
}

export const uploadToPinata = async (file: File): Promise<PinataUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data, error } = await supabase.functions.invoke('upload-to-pinata', {
    body: formData,
  });

  if (error) {
    console.error('Error uploading to Pinata:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return data as PinataUploadResult;
};
