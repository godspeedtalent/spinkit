"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Using Card components for header styling
import { Loader2 } from 'lucide-react';

interface WizardStepSectionProps {
  stepNumber: number;
  title: string;
  description?: string;
  icon?: React.ElementType; // LucideIcon
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

const WizardStepSection: React.FC<WizardStepSectionProps> = ({
  stepNumber,
  title,
  description,
  icon: Icon,
  children,
  isLoading = false,
  className,
}) => {
  return (
    <section className={cn("p-4 border rounded-md bg-background/30 shadow-sm mt-4", className)}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-grow">
          <h3 className="text-md font-semibold flex items-center text-foreground">
            {Icon && <Icon className="mr-2 h-4 w-4 text-primary" />}
            {stepNumber}. {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
      </div>
      {children}
    </section>
  );
};

export default WizardStepSection;