import React from 'react';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';

interface MetadataItemProps {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
  href?: string;
  tooltipContent?: React.ReactNode;
  className?: string;
}

const MetadataItem: React.FC<MetadataItemProps> = ({
  icon: Icon,
  label,
  value,
  href,
  tooltipContent,
  className,
}) => {
  const content = (
    <>
      {Icon && <Icon className="mr-1 h-4 w-4" />}
      {value}
    </>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center text-sm text-muted-foreground ${className || ''}`}>
            {href ? (
              <Link href={href} className="flex items-center hover:underline">
                {content}
              </Link>
            ) : (
              <div className="flex items-center">{content}</div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent || label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MetadataItem;
