import type { QuestionBaseInfoResp, QuestionListResp, QuestionPageSourceProps, QuestionSearch } from '~/type/question';
import type { OtherDictListRecord } from '~/type/textbook';
import { OperateTags, TagShow } from '~/common/question/tag';
import { TitleShow } from '~/common/title';
import { MultiOptionShow } from '~/common/select';
import type { KeyedMutator } from 'swr';

/// 题库题目列表展示

// 普通列表展示, 需要查看详情等操作
interface QuestionListShowProps {
  pageSource: QuestionPageSourceProps;
  otherDictListRecord: OtherDictListRecord;
  listResp: QuestionListResp;
  questionSearch: QuestionSearch;
  questionListRespMutate: KeyedMutator<QuestionListResp>; // 审核删除等操作需要重置列表接口重新请求数据

  // 以下为 Sheet 操作方法和属性
  setOpenSheet: (value: boolean) => void;
  setSheetTitle: (value: string) => void;
  setSheetDesc: (value: string) => void;
  setSheetContent: (value: React.ReactNode) => void;

  // 提示加载中
  setLoading?: (value: boolean) => void;
}
function QuestionListShow({
  pageSource,
  otherDictListRecord,
  listResp,
  questionSearch,
  questionListRespMutate,
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
          <div
            key={questionInfo.id}
            className="mt-4 p-3 bg-card transition-all duration-200 hover:shadow-lg hover:border-primary/10 border-border/60"
          >
            {/* 题干选项等部分 */}
            <SingleQuestionCommonPart pageSource={pageSource} otherDictListRecord={otherDictListRecord} questionInfo={questionInfo} />

            {/* 题目其它标签, 比如查看答案, 关联题目等 */}
            <div className="flex flex-wrap gap-2 justify-start md:justify-end">
              <OperateTags
                pageSource={pageSource}
                otherDictListRecord={otherDictListRecord}
                questionId={questionInfo.id}
                questionRelationType={questionInfo.relationType}
                eightId={questionInfo.questionCateId}
                status={questionInfo.status}
                questionSearch={questionSearch}
                questionListRespMutate={questionListRespMutate}
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
  pageSource: QuestionPageSourceProps;
  otherDictListRecord: OtherDictListRecord;
  questionInfo: QuestionBaseInfoResp;
}
function SingleQuestionCommonPart({ pageSource, otherDictListRecord, questionInfo }: SingleQuestionCommonPartProps) {
  return (
    <>
      {/* 标签 */}
      <div className="flex flex-wrap gap-3 items-center w-full">
        <TagShow pageSource={pageSource} otherDictListRecord={otherDictListRecord} questionInfo={questionInfo} />
      </div>

      {/* 标题 */}
      <div className="mt-2.5">
        {<TitleShow id={questionInfo.id} title={questionInfo.title} comment={questionInfo.comment || ''} images={questionInfo.images} />}
      </div>

      {/* 选项内容 */}
      <div className="mt-2.5">
        {questionInfo.options && questionInfo.options.length > 0 && (
          <MultiOptionShow optionsLayout={questionInfo.optionsLayout || 1} options={questionInfo.options} />
        )}
      </div>
    </>
  );
}

// 变式题列表展示, 不关心展示详情了, 因为这部分题目跟普通列表的题目是重复的, 仅仅展示有哪些变式题列表
interface SimilarQuestionListShowProps {
  pageSource: QuestionPageSourceProps;
  otherDictListRecord: OtherDictListRecord;
  listResp: QuestionListResp;
}
function SimilarQuestionListShow({ pageSource, otherDictListRecord, listResp }: SimilarQuestionListShowProps) {
  return (
    <>
      {listResp.list?.map((questionInfo) => {
        return (
          <div
            key={questionInfo.id}
            className="mt-4 p-3 bg-card transition-all duration-200 hover:shadow-lg hover:border-primary/10 border-border/60"
          >
            {/* 题干选项等部分 */}
            <SingleQuestionCommonPart pageSource={pageSource} otherDictListRecord={otherDictListRecord} questionInfo={questionInfo} />
          </div>
        );
      })}
    </>
  );
}

export { QuestionListShow, SimilarQuestionListShow };
