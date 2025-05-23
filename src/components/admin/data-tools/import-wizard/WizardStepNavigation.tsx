
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, LucideIcon } from 'lucide-react'; // Added LucideIcon type
import { cn } from '@/lib/utils';

interface WizardStepNavigationProps {
  onBack?: () => void;
  backLabel?: string;
  isBackDisabled?: boolean;
  onNext?: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
  nextIcon?: LucideIcon; // Use LucideIcon type
  isLoadingNext?: boolean;
  nextButtonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  nextButtonClassName?: string;
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
  nextButtonVariant = "default",
  nextButtonClassName,
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
        <Button 
          onClick={onNext} 
          disabled={isNextDisabled || isLoadingNext} 
          size="sm"
          variant={nextButtonVariant}
          className={cn(nextButtonClassName)}
        >
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
