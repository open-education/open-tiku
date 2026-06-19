import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "~/lib/utils";
import { CommonTitle } from "~/common/title";
import { CommonSelect } from "~/common/select";
import type { QuestionOption } from "~/type/question";
import type { PaperQuestion } from "~/type/paper";
import { SimpleFullContent } from "~/common/simple-content";

/// 试卷题目样式

// 题目样式
interface ExamQuestionProps {
  index: number;
  question: PaperQuestion;
}
function ExamQuestion(props: ExamQuestionProps) {
  const { index, question } = props;

  // 生成题目标题
  const getQuestionTitle = (index: number, stem: string) => {
    return <CommonTitle no={index + 1} title={stem} comment={""} images={[]} />;
  };

  // 生成题目选项
  const getQuestionOptions = (index: number, options: QuestionOption[]) => {
    return <CommonSelect optionsLayout={2} options={options} />;
  };

  const [isHovered, setIsHovered] = useState(false);
  const [isAnswerExpanded, setIsAnswerExpanded] = useState(false);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnswerExpanded(!isAnswerExpanded);
  };

  return (
    <div
      className={cn(
        "relative transition-all duration-200",
        // 边框改为 1px，默认透明
        "border border-transparent",
        // 鼠标悬停时显示浅蓝色虚线边框，1px
        isHovered && "border-blue-300 border-dashed",
        // 鼠标悬停时背景轻微变化（可选）
        isHovered && "bg-blue-50/30",
        (isHovered || isAnswerExpanded) && "pb-6",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        // 鼠标移出时收回答案解析
        setIsAnswerExpanded(false);
      }}
    >
      {/* 主体内容 */}
      <div className={"transition-all duration-200 pb-2"}>
        {/* 标题 */}
        <div>{getQuestionTitle(index, question.stem)}</div>
        {/* 选项 */}
        <div className="mt-2.5">{getQuestionOptions(index, question.options)}</div>
      </div>

      {/* 答案解析 - 默认不显示，无背景色 */}
      {isAnswerExpanded && (
        <div className="mt-2 pt-2 border-t border-blue-200 animate-in slide-in-from-top-2 duration-200">
          <div className="text-sm text-gray-700">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-10 gap-1 items-center">
                <div className="col-span-1">答案</div>
                <div className="col-span-9">
                  <SimpleFullContent content={question.answer} />
                </div>
              </div>
              <div className="grid grid-cols-10 gap-1 items-center">
                <div className="col-span-1">解析</div>
                <div className="col-span-9">
                  <SimpleFullContent content={question.analysis.content} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 右下角 "点击查看解析" 按钮 - 鼠标悬停时显示 */}
      {isHovered && (
        <div
          className={cn(
            "absolute bottom-2 right-4",
            "text-sm text-blue-500 font-medium",
            "cursor-pointer select-none",
            "flex items-center gap-1",
            "transition-all duration-200",
            "hover:text-blue-600",
          )}
          onClick={handleExpandClick}
        >
          {isAnswerExpanded ? (
            <>
              <span>收起答案和解析</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>鼠标点击查看答案和解析</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export { ExamQuestion };
