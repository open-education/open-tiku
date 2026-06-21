import type { QuestionBaseInfoResp, QuestionListResp, QuestionSearch } from "~/type/question";
import type { TextbookOtherDict } from "~/type/textbook";
import { OperateTags, TagShow } from "~/common/question/tag";
import { DictUtil } from "~/util/object";
import { TitleShow } from "~/common/question/title";
import { MultiOptionShow } from "~/common/question/select";

/// 题库题目列表展示

// 普通列表展示, 需要查看详情等操作
interface QuestionListShowProps {
  questionTypeDict: Record<number, TextbookOtherDict>;
  questionTagDict: Record<number, TextbookOtherDict>;
  listResp: QuestionListResp;
  questionSearch: QuestionSearch;

  // 以下为 Sheet 操作方法和属性
  setOpenSheet: (value: boolean) => void;
  setSheetTitle: (value: string) => void;
  setSheetDesc: (value: string) => void;
  setSheetContent: (value: React.ReactNode) => void;

  // 提示加载中
  setLoading?: (value: boolean) => void;
}
function QuestionListShow({
  questionTypeDict,
  questionTagDict,
  listResp,
  questionSearch,
  setOpenSheet,
  setSheetTitle,
  setSheetDesc,
  setSheetContent,
  setLoading,
}: QuestionListShowProps) {
  return (
    <>
      {listResp.list?.map((questionInfo) => {
        return (
          <div key={questionInfo.id} className="mt-4 p-3 bg-white">
            {/* 题干选项等部分 */}
            <SingleQuestionCommonPart questionTypeDict={questionTypeDict} questionTagDict={questionTagDict} questionInfo={questionInfo} />

            {/* 题目其它标签, 比如查看答案, 关联题目等 */}
            <div className="flex gap-2 justify-end">
              <OperateTags
                questionTypeDict={questionTypeDict}
                questionTagDict={questionTagDict}
                questionId={questionInfo.id}
                eightId={questionInfo.questionCateId}
                questionSearch={questionSearch}
                setOpenSheet={setOpenSheet}
                setSheetTitle={setSheetTitle}
                setSheetDesc={setSheetDesc}
                setSheetContent={setSheetContent}
                setLoading={setLoading}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}

// 题目标题选项等公共部分展示
interface SingleQuestionCommonPartProps {
  questionTypeDict: Record<number, TextbookOtherDict>;
  questionTagDict: Record<number, TextbookOtherDict>;
  questionInfo: QuestionBaseInfoResp;
}
function SingleQuestionCommonPart({ questionTypeDict, questionTagDict, questionInfo }: SingleQuestionCommonPartProps) {
  return (
    <>
      {/* 标签 */}
      <div className="flex gap-3 items-center w-full">
        <TagShow
          typeValue={DictUtil.getQuestionTypeName(questionInfo.questionTypeId, questionTypeDict)}
          tagNames={DictUtil.getQuestionTagNames(questionInfo.questionTagIds ?? [], questionTagDict)}
          difficultyLevelValue={questionInfo.difficultyLevel}
        />
      </div>

      {/* 标题 */}
      <div className="mt-2.5">
        {<TitleShow id={questionInfo.id} title={questionInfo.title} comment={questionInfo.comment} images={questionInfo.images} />}
      </div>

      {/* 选项内容 */}
      <div className="mt-2.5">
        {questionInfo.options && questionInfo.options.length > 0 && (
          <MultiOptionShow optionsLayout={questionInfo.optionsLayout ?? 1} options={questionInfo.options} />
        )}
      </div>
    </>
  );
}

// 变式题列表展示, 不关心展示详情了, 因为这部分题目跟普通列表的题目是重复的, 仅仅展示有哪些变式题列表
interface SimilarQuestionListShowProps {
  questionTypeDict: Record<number, TextbookOtherDict>;
  questionTagDict: Record<number, TextbookOtherDict>;
  listResp: QuestionListResp;
}
function SimilarQuestionListShow({ questionTypeDict, questionTagDict, listResp }: SimilarQuestionListShowProps) {
  return (
    <>
      {listResp.list?.map((questionInfo) => {
        return (
          <div key={questionInfo.id} className="mt-4 pt-3 bg-white">
            {/* 题干选项等部分 */}
            <SingleQuestionCommonPart questionTypeDict={questionTypeDict} questionTagDict={questionTagDict} questionInfo={questionInfo} />
          </div>
        );
      })}
    </>
  );
}

export { QuestionListShow, SimilarQuestionListShow };
