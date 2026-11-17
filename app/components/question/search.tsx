import { SimpleAlert } from '@/components/common/alert';
import { SimpleNoData } from '@/components/common/empty';
import { Loading } from '@/components/common/load';
import { type CheckboxTreeNode } from '@/components/common/nav';
import { SimplePagination } from '@/components/common/page';
import { QuestionListShow } from '@/components/question/list';
import { NavTreeList, SearchList } from '@/components/question/nav';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useDelayedLoading } from '@/hooks/delayed-loading';
import { useIsMobile } from '@/hooks/use-mobile';
import { CustomPageSource, CustomUserSource, QuestionPageSource } from '@/type/enum';
import type { CountQuestionResp, QuestionSearch } from '@/type/question';
import type { TextbookResp } from '@/type/textbook';
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
  questionSearch: QuestionSearch;
  updateQuestionSearch: (key: keyof QuestionSearch, value: number | number[] | string[]) => void;
  countListRespMutate?: KeyedMutator<CountQuestionResp[]>; // 我的题目提交审核等操作需要重置列表状态计数接口重新请求数据
}

export default function QuestionSearchList({
                                             pageSource,
                                             showFilter,
                                             noDataDesc,
                                             questionSearch,
                                             updateQuestionSearch,
                                             countListRespMutate,
                                           }: QuestionSearchListProps) {
  // 网站主要导航
  const { data: textbooks = [], isLoading: textbooksIsLoading, error: textbooksErr } = useTextbooks();
  // 将教材字典转化为 Map 格式, 存储 id 对应的所有层
  const pathMap = useMemo(() => {
    return TextbookUtil.createTextbookPathDict(textbooks);
  }, [textbooks]);

  useEffect(() => {
    TextbookUtil.updateSearchTwoLevelId(questionSearch.fiveLevelId, pathMap, updateQuestionSearch);
  }, [questionSearch.fiveLevelId, pathMap]);

  // 查询题目类型和标签等信息
  const {
    data: dictListResp = { map: {} },
    isLoading: dictListRespLoading,
    error: dictListRespErr,
  } = useQuestionOtherDictList(questionSearch.twoLevelId, [
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
  const { data: questionCates = [], isLoading: questionCatesLoading, error: questionCatesErr } = useQuestionCates(questionSearch.fiveLevelId);

  // 用户个性化配置
  const { data: customListResp = [], isLoading: customListRespLoading, error: customListRespErr } = useCustomList({
    userSource: CustomUserSource.Person,
    pageSource: CustomPageSource.Default,
  });
  useEffect(() => {
    CustomUtil.updateSearchFiveLevelInfo(customListResp, updateQuestionSearch);
  }, [customListResp]);

  // 查询题目列表
  const [pageNo, setPageNo] = useState<number>(1);
  const {
    data: questionListResp = { list: [], pageNo: pageNo, pageSize: StringConst.pageSize, total: 0 },
    isLoading: questionListRespLoading,
    error: questionListRespErr,
    mutate: questionListRespMutate,
  } = useQuestionList(pageSource, questionSearch, pageNo);

  // 页面加载中
  const showLoading = useDelayedLoading(
    textbooksIsLoading || dictListRespLoading || questionCatesLoading || questionListRespLoading || customListRespLoading,
  );

  // 左边内容
  const leftContent = (
    <NavTreeList
      textbooks={textbooks}
      questionCates={questionCates}
      questionSearch={questionSearch}
      onTextbook={(selectedTextbooks) => {
        if (!selectedTextbooks || !selectedTextbooks.fifth) {
          updateQuestionSearch('fiveLevelId', 0);
          updateQuestionSearch('fiveLevelSelectKeys', []);
          return;
        }
        const current: TextbookResp = selectedTextbooks.fifth;
        updateQuestionSearch('fiveLevelId', current.id);
      }}
      onQuestionCate={(selectedItems: CheckboxTreeNode[]) => {
        if (!selectedItems) {
          updateQuestionSearch('eightIds', []);
          return;
        }
        // tableName: "question_cate" 对应的为题型标识
        const questionCateIds = selectedItems.filter((item) => item.tableName === StringConst.questionCateTableName).map((item) => item.id);
        updateQuestionSearch('eightIds', questionCateIds);
      }}
    />
  );

  // 右边内容
  const rightContent = (
    <>
      {showFilter && (
        <SearchList otherDictListRecord={otherDictListRecord} questionSearch={questionSearch} updateQuestionSearch={updateQuestionSearch} />
      )}

      <div className="py-3">
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
    </>
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
