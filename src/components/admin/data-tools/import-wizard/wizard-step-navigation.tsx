"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface WizardStepNavigationProps {
  onBack?: () => void;
  backLabel?: string;
  isBackDisabled?: boolean;
  onNext?: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
  nextIcon?: React.ElementType;
  isLoadingNext?: boolean;
}

const WizardStepNavigation: React.FC<WizardStepNavigationProps> = ({
  onBack,
  backLabel = "Back",
  isBackDisabled = false,
  onNext,
  nextLabel = "Next",
  isNextDisabled = false,
  nextIcon: NextIcon = ArrowRight,
  isLoadingNext = false,
}) => {
  return (
    <div className="flex justify-between items-center mt-6 pt-4 border-t">
      {onBack ? (
        <Button variant="outline" size="sm" onClick={onBack} disabled={isBackDisabled || isLoadingNext}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {backLabel}
        </Button>
      ) : (
        <div /> // Placeholder to keep 'Next' button to the right
      )}
      {onNext && (
        <Button onClick={onNext} disabled={isNextDisabled || isLoadingNext} size="sm">
          {isLoadingNext ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            NextIcon && <NextIcon className="mr-2 h-4 w-4" />
          )}
          {isLoadingNext ? 'Processing...' : nextLabel}
        </Button>
      )}
    </div>
  );
};

export default WizardStepNavigation;