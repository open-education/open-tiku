import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import React from 'react';

// 简单长文本内容提示

function SimpleTooltip({ tip, content }: { tip: React.ReactNode; content?: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="block max-w-50 truncate">{tip}</span>} />
      <TooltipContent>{content ? content : tip}</TooltipContent>
    </Tooltip>
  );
}

export { SimpleTooltip };
