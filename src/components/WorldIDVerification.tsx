import { IDKitWidget, ISuccessResult, VerificationLevel, IErrorState } from '@worldcoin/idkit';
import { Button } from './ui/button';
import { Shield } from 'lucide-react';
import { WORLD_ID_CONFIG } from '@/config/worldid';

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
  const handleVerify = (result: ISuccessResult) => {
    console.log("World ID verification successful:", result);
    onSuccess(result);
  };

  const handleError = (error: IErrorState) => {
    console.error("World ID verification error:", error);
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
