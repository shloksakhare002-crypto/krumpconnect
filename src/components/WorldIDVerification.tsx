import { IDKitWidget, ISuccessResult, VerificationLevel, IErrorState } from '@worldcoin/idkit';
import { Button } from './ui/button';
import { Shield } from 'lucide-react';
import { WORLD_ID_CONFIG } from '@/config/worldid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WorldIDVerificationProps {
  onSuccess: (result: ISuccessResult) => void;
  onError?: (error: IErrorState) => void;
  buttonText?: string;
  disabled?: boolean;
}

export const WorldIDVerification = ({
  onSuccess,
  onError,
  buttonText = "Verify with World ID",
  disabled = false,
}: WorldIDVerificationProps) => {
  const handleVerify = async (result: ISuccessResult) => {
    console.log("World ID verification initiated:", result);
    
    try {
      // Verify server-side via edge function
      const { data, error } = await supabase.functions.invoke('verify-worldid', {
        body: {
          proof: result.proof,
          merkle_root: result.merkle_root,
          nullifier_hash: result.nullifier_hash,
          verification_level: result.verification_level,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        toast.success("World ID verification successful!");
        onSuccess(result);
      } else {
        throw new Error(data?.error || "Verification failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("World ID verification error:", errorMessage);
      toast.error(`Verification failed: ${errorMessage}`);
      if (onError) {
        onError({ 
          code: 'generic_error',
          detail: errorMessage,
          message: errorMessage
        } as IErrorState);
      }
    }
  };

  const handleError = (error: IErrorState) => {
    console.error("World ID verification error:", error);
    const errorDetail = 'message' in error ? error.message : 'An error occurred';
    toast.error(`Verification error: ${errorDetail}`);
    if (onError) {
      onError(error);
    }
  };

  return (
    <IDKitWidget
      app_id={WORLD_ID_CONFIG.app_id as `app_${string}`}
      action={WORLD_ID_CONFIG.action}
      verification_level={VerificationLevel.Orb}
      handleVerify={handleVerify}
      onSuccess={handleVerify}
      onError={handleError}
    >
      {({ open }) => (
        <Button
          onClick={open}
          disabled={disabled}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Shield className="h-4 w-4" />
          {buttonText}
        </Button>
      )}
    </IDKitWidget>
  );
};
