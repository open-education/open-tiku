import React, { useState } from "react";
import type { QuestionOption } from "~/type/question";
import type { PaperQuestion } from "~/type/paper";
import { SimpleFullContent } from "~/common/content";
import { MultiOptionShow } from "~/common/question/select";
import { TitleShow } from "~/common/question/title";
import { Button } from "~/components/ui/button";

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
    return <TitleShow no={index + 1} title={stem} comment={""} images={[]} />;
  };

  // 生成题目选项
  const getQuestionOptions = (index: number, options: QuestionOption[]) => {
    return <MultiOptionShow optionsLayout={1} options={options} />;
  };

  const [isAnswerExpanded, setIsAnswerExpanded] = useState(false);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnswerExpanded(!isAnswerExpanded);
  };

  return (
    <div className="text-sm">
      {/* 主体内容 */}
      <div className={"transition-all duration-200 pb-2"}>
        {/* 标题 */}
        <div>{getQuestionTitle(index, question.stem)}</div>
        {/* 选项 */}
        <div className="mt-2.5">{getQuestionOptions(index, question.options)}</div>
        {/* 查看选项 */}
        <div className="flex justify-end" onClick={handleExpandClick}>
          {isAnswerExpanded ? (
            <>
              <Button variant={"link"}>隐藏答案</Button>
            </>
          ) : (
            <>
              <Button variant={"link"}>显示答案</Button>
            </>
          )}
        </div>
      </div>

      {/* 答案解析 - 默认不显示，无背景色 */}
      {isAnswerExpanded && (
        <div className="pt-2 pb-2 border-t border-blue-200 animate-in slide-in-from-top-2 duration-200">
          <div className="text-gray-700">
            <div className="flex flex-col gap-1">
              <div className="grid grid-cols-20 gap-1 items-center">
                <div className="col-span-1">答案:</div>
                <div className="col-span-19">
                  <SimpleFullContent content={question.answer} />
                </div>
              </div>
              <div className="grid grid-cols-20 gap-1 items-center">
                <div className="col-span-1">解析:</div>
                <div className="col-span-19">
                  <SimpleFullContent content={question.analysis.content} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { ExamQuestion };
