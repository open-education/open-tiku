import { SimpleAlert } from '@/components/common/alert';
import { SimpleNoData } from '@/components/common/empty';
import { Loading } from '@/components/common/load';
import { ChapterExpandNav, ChapterTreeCheckboxNav } from '@/components/common/nav';
import { SimplePagination } from '@/components/common/page';
import { QuestionListShow } from '@/components/question/list';
import { SearchList } from '@/components/question/nav';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useDelayedLoading } from '@/hooks/delayed-loading';
import { useIsMobile } from '@/hooks/use-mobile';
import { CustomPageSource, CustomUserSource, QuestionPageSource } from '@/type/enum';
import type { CountQuestionResp, QuestionListReq } from '@/type/question';
import type { TextbookFillLevel } from '@/type/textbook';
import { useCustomList, useQuestionCates, useQuestionList, useQuestionOtherDictList, useTextbooks } from '@/util/fetcher';
import { formatNumber } from '@/util/fmt';
import { CustomUtil, TextbookUtil } from '@/util/object';
import { StringConst } from '@/util/string';
import { useEffect, useMemo, useState } from 'react';
import type { KeyedMutator } from 'swr';

// 搜索选题组件
interface QuestionSearchListProps {
  pageSource: QuestionPageSource;
  showFilter: boolean;
  noDataDesc: string;
  listReq: QuestionListReq;
  updateListReq: (key: keyof QuestionListReq, val: string | number[] | number) => void;
  countListRespMutate?: KeyedMutator<CountQuestionResp[]>; // 我的题目提交审核等操作需要重置列表状态计数接口重新请求数据
}

export default function QuestionSearchList({
  pageSource,
  showFilter,
  noDataDesc,
  listReq,
  updateListReq,
  countListRespMutate,
}: QuestionSearchListProps) {
  const { data: textbooks = [], isLoading: textbooksIsLoading, error: textbooksErr } = useTextbooks();

  // 查询题目类型和标签等信息
  const [twoLevelId, setTwoLevelId] = useState<number>(0);
  const {
    data: dictListResp = { map: {} },
    isLoading: dictListRespLoading,
    error: dictListRespErr,
  } = useQuestionOtherDictList(twoLevelId, [
    'question_type',
    'question_tag',
    'question_dimension',
    'question_level',
    'question_scene',
    'question_mistake_tip',
  ]);
  const otherDictListRecord = useMemo(() => {
    return TextbookUtil.createOtherDictListRecord(dictListResp);
  }, [dictListResp]);

  // 获取教材/知识点题型列表
  const [fiveLevelId, setFiveLevelId] = useState<number>(0);
  const { data: questionCates = [], isLoading: questionCatesLoading, error: questionCatesErr } = useQuestionCates(fiveLevelId);

  const [fillLevel, setFilleLevel] = useState<TextbookFillLevel>({ fiveLevelKeys: [], eightLevelKeys: [] });
  const updateFillLevel = (key: keyof TextbookFillLevel, val: string[]) => {
    setFilleLevel((prev) => ({ ...prev, [key]: val }));
  };

  // 用户个性化配置
  const {
    data: customListResp = [],
    isLoading: customListRespLoading,
    error: customListRespErr,
  } = useCustomList({
    userSource: CustomUserSource.Person,
    pageSource: CustomPageSource.Default,
  });
  useEffect(() => {
    CustomUtil.defaultTextbookUpdate(customListResp, updateFillLevel, updateListReq, setFiveLevelId, setTwoLevelId);
  }, [customListResp]);

  // 查询题目列表
  const [pageNo, setPageNo] = useState<number>(1);
  const {
    data: questionListResp = { list: [], pageNo: pageNo, pageSize: StringConst.pageSize, total: 0 },
    isLoading: questionListRespLoading,
    error: questionListRespErr,
    mutate: questionListRespMutate,
  } = useQuestionList(pageSource, listReq, pageNo);

  // 页面加载中
  const showLoading = useDelayedLoading(
    textbooksIsLoading || dictListRespLoading || questionCatesLoading || questionListRespLoading || customListRespLoading,
  );

  // 左边内容
  const leftContent = (
    <div className="p-3 space-y-2 bg-card">
      <ChapterExpandNav
        textbooks={textbooks}
        defaultValues={fillLevel.fiveLevelKeys}
        onSelectionChange={(items) => {
          TextbookUtil.textbookPathUpdate(items, updateListReq, setFiveLevelId, setTwoLevelId);
          // 需要清空后3层菜单
          if (items && items.length > 0) {
            updateListReq('questionCateIds', []);
          }
        }}
      />

      <ChapterTreeCheckboxNav
        textbooks={questionCates}
        onSelect={(items) => {
          const ids = items.filter((item) => item.tableName === StringConst.questionCateTableName).map((item) => item.id);
          updateListReq('questionCateIds', ids);
        }}
        defaultSelectedKeys={fillLevel.eightLevelKeys}
        maxDepth={3}
      />
    </div>
  );

  // 右边内容
  const rightContent = (
    <div className="space-y-3">
      {showFilter && <SearchList otherDictListRecord={otherDictListRecord} listReq={listReq} updateListReq={updateListReq} />}

      <div>
        {/* 空数据提示 */}
        {questionListResp.total == 0 && <SimpleNoData desc={noDataDesc} />}
        {questionListResp.total > 0 && <div className="bg-card p-3">共找到 {formatNumber(questionListResp.total)} 道题</div>}

        <div className="space-y-3">
          {/* 相关错误信息 */}
          {textbooksErr && <SimpleAlert title="菜单获取失败" message={textbooksErr.message} />}
          {dictListRespErr && <SimpleAlert title="教材通用字典获取失败" message={dictListRespErr.message} />}
          {questionCatesErr && <SimpleAlert title="导航题型获取失败" message={questionCatesErr.message} />}
          {questionListRespErr && <SimpleAlert title="题目列表获取失败" message={questionListRespErr.message} />}
          {customListRespErr && <SimpleAlert title="个性化配置获取失败" message={customListRespErr.message} />}

          {/* 相关加载中 */}
          {showLoading && <Loading />}
        </div>

        <div>
          {/* 题目列表 */}
          <div>
            <QuestionListShow
              pageSource={pageSource}
              otherDictListRecord={otherDictListRecord}
              listResp={questionListResp}
              questionListRespMutate={questionListRespMutate}
              countListRespMutate={countListRespMutate}
            />
          </div>

          {/* 分页 */}
          {questionListResp.total > 0 && (
            <div className="mt-3 py-3 bg-card">
              <SimplePagination
                pageNo={questionListResp.pageNo}
                pageSize={questionListResp.pageSize}
                total={questionListResp.total}
                onPageChange={(pageNo) => {
                  setPageNo(pageNo);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 移动端兼容
  if (useIsMobile()) {
    return (
      <div className="md:hidden flex flex-col gap-3">
        {leftContent}
        {rightContent}
      </div>
    );
  }

  // PC 端
  return (
    <ResizablePanelGroup orientation="horizontal" className="border flex-col! md:flex-row!">
      <ResizablePanel defaultSize="25%">
        <div className="pr-1.5">{leftContent}</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="75%">
        <div className="pl-1.5">{rightContent}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
