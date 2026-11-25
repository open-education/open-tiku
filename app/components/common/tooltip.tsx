import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from 'cn';
import React from 'react';

// 简单长文本内容提示

function SimpleTooltip({ tip, content = '', className = 'max-w-50' }: { tip: React.ReactNode; content?: React.ReactNode; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className={cn('block truncate', className)}>{tip}</span>} />
      <TooltipContent>{content ? content : tip}</TooltipContent>
    </Tooltip>
  );
}

export { SimpleTooltip };
