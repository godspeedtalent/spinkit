
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, type LucideIcon } from 'lucide-react';

interface WizardStepSectionProps {
  stepNumber?: number; // Optional if not always numerically stepped
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  headerActions?: React.ReactNode; // For buttons like "Download Template"
}

const WizardStepSection: React.FC<WizardStepSectionProps> = ({
  stepNumber,
  title,
  description,
  icon: Icon,
  children,
  isLoading = false,
  className,
  headerActions,
}) => {
  return (
    <section className={cn("p-4 border rounded-md bg-background/30 shadow-sm", className)}>
      <div className="flex justify-between items-start mb-3 pb-3 border-b">
        <div className="flex-grow">
          <h3 className="text-md font-semibold flex items-center text-foreground">
            {Icon && <Icon className="mr-2 h-4 w-4 text-primary shrink-0" />}
            {stepNumber && <span className="mr-2">{stepNumber}.</span>}
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          {headerActions}
        </div>
      </div>
      {children}
    </section>
  );
};

export default WizardStepSection;
