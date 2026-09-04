import React, { useState } from 'react';
import type { TopPaperQuestionReq } from '~/type/paper';
import { SimpleFullContent } from '~/common/content';
import { MultiOptionShow } from '~/common/select';
import { TitleShow } from '~/common/title';
import { Button } from '~/components/ui/button';
import { Badge, CheckCircle, ChevronDown, Lightbulb } from 'lucide-react';
import { cn } from '~/lib/utils';

/// 试卷题目样式

// 精选试卷题目样式
interface TopQuestionInfoProps {
  index: number;
  question: TopPaperQuestionReq;
}
function TopQuestionInfo(props: TopQuestionInfoProps) {
  const { index, question } = props;

  const [isAnswerExpanded, setIsAnswerExpanded] = useState(false);

  const toggleAnswer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnswerExpanded((prev) => !prev);
  };

  return (
    <div className="text-base mt-4 p-3 bg-white transition-all duration-200 hover:shadow-lg hover:border-primary/10 border-border/60">
      {/* 题目主体 */}
      <div className="pb-2">
        <div>
          <TitleShow no={question.orderNum} title={question.stem} comment={''} images={question.images || []} />
        </div>
        <div className="mt-2.5">
          <MultiOptionShow optionsLayout={question.optionsLayout || 1} options={question.options || []} />
        </div>
      </div>

      {/* 查看答案按钮 */}
      <div className="flex justify-end mt-1">
        <Button variant="outline" size="sm" onClick={toggleAnswer} className="gap-1 text-muted-foreground hover:text-foreground transition-colors">
          <span>{isAnswerExpanded ? '收起答案' : '查看答案'}</span>
          <ChevronDown size={14} className={cn('transition-transform duration-200', isAnswerExpanded && 'rotate-180')} />
        </Button>
      </div>

      {/* 答案扩展区域（卡片 + 高度动画） */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          isAnswerExpanded
            ? 'max-h-80 overflow-y-auto opacity-100' // 限制高度 + 允许滚动
            : 'max-h-0 overflow-hidden opacity-0', // 折叠时完全隐藏
        )}
      >
        <div className="p-4 bg-muted/50 border border-border/50 space-y-3">
          {/* 答案行 */}
          <div className="flex items-start gap-2">
            <Badge className="shrink-0 gap-1 border-green-200 text-green-700 bg-green-50">
              <CheckCircle size={12} />
              答案
            </Badge>
            <div className="text-foreground font-medium">
              <SimpleFullContent content={question.answer} />
            </div>
          </div>

          {/* 解析行 */}
          <div className="flex items-start gap-2">
            <Badge className="shrink-0 gap-1 border-blue-200 text-blue-700 bg-blue-50">
              <Lightbulb size={12} />
              解析
            </Badge>
            <div className="text-muted-foreground leading-relaxed">
              <SimpleFullContent content={question.analysis.content} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { TopQuestionInfo };
