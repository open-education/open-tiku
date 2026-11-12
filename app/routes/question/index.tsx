import { SimpleAlert } from '@/common/alert';
import { SimpleNoData } from '@/common/empty';
import { Loading } from '@/common/load';
import { type CheckboxTreeNode } from '@/common/nav';
import { SimplePagination } from '@/common/page';
import { QuestionListShow } from '@/common/question/list';
import { NavTreeList, SearchList } from '@/components/question/nav';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useDelayedLoading } from '@/hooks/delayed-loading';
import { useIsMobile } from '@/hooks/use-mobile';
import { QuestionPageSource } from '@/type/enum';
import type { QuestionSearch } from '@/type/question';
import type { TextbookResp } from '@/type/textbook';
import { useQuestionCates, useQuestionList, useQuestionOtherDictList, useTextbooks } from '@/util/fetcher';
import { formatNumber } from '@/util/fmt';
import { TextbookUtil } from '@/util/object';
import { StringConst } from '@/util/string';
import { useEffect, useMemo, useState } from 'react';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '题目搜索' },
    {
      name: 'description',
      content: '收集整理网站常见的疑问和做一些适当的说明',
    },
  ];
}

// 搜索选题
export default function Index() {
  // 网站主要导航
  const { data: textbooks = [], isLoading: textbooksIsLoading, error: textbooksErr } = useTextbooks();
  // 将教材字典转化为 Map 格式, 存储 id 对应的所有层
  const pathMap = useMemo(() => {
    return TextbookUtil.createTextbookPathDict(textbooks);
  }, [textbooks]);

  // 搜索对象维护
  const [questionSearch, setQuestionSearch] = useState<QuestionSearch>({
    twoLevelId: 0,
    fiveLevelId: 0,
    fiveLevelSelectKeys: [],
    eightIds: [],
    eightLevelSelectKeys: [],
    typeId: 0,
    tagIds: [],
    dimensionIds: [],
    levelIds: [],
    sceneIds: [],
    mistakeTipIds: [],
  });
  const updateQuestionSearch = (key: keyof QuestionSearch, value: number | number[] | string[]) => {
    setQuestionSearch((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    // 5层深度时才能添加题目和查看题目列表, 但是题目类型和标签再2层深度上, 因此只要有2层深度就可以把题型类型和标签返回, 后续如果有优化再处理
    // 很明显 fiveLevelId 是选择下拉菜单触发的优先级最高
    if (!questionSearch.fiveLevelId || pathMap.size === 0) {
      return;
    }

    const nodes = pathMap.get(questionSearch.fiveLevelId.toString()) ?? [];
    const twoLevelId = nodes.length > 2 ? nodes[1].id : 0;
    updateQuestionSearch('twoLevelId', twoLevelId);
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

  // 获取教材/考点题型列表
  const { data: questionCates = [], isLoading: questionCatesLoading, error: questionCatesErr } = useQuestionCates(questionSearch.fiveLevelId);

  // 查询题目列表
  const [pageNo, setPageNo] = useState<number>(1);
  const {
    data: questionListResp = { list: [], pageNo: pageNo, pageSize: StringConst.pageSize, total: 0 },
    isLoading: questionListRespLoading,
    error: questionListRespErr,
    mutate: questionListRespMutate,
  } = useQuestionList(QuestionPageSource.List, questionSearch, pageNo);

  // 页面加载中
  const showLoading = useDelayedLoading(textbooksIsLoading || dictListRespLoading || questionCatesLoading || questionListRespLoading);

  // 左边内容
  const leftContent = (
    <NavTreeList
      textbooks={textbooks}
      questionCates={questionCates}
      onTextbook={(_, selectedTextbooks) => {
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
      <SearchList otherDictListRecord={otherDictListRecord} questionSearch={questionSearch} updateQuestionSearch={updateQuestionSearch} />

      <div className="py-3">
        <div>共找到 {formatNumber(questionListResp.total)} 道题</div>

        <div>
          {/* 空数据提示 */}
          {questionListResp.total == 0 && (
            <div className="mt-3">
              <SimpleNoData desc="没有查找到任何题目，如有题目，可以尝试上传题目，管理员审核通过后，其他人就可以看到该题目了。" />
            </div>
          )}

          {/* 相关错误信息 */}
          {textbooksErr && (
            <div className="mt-3">
              <SimpleAlert title="菜单获取失败" message={textbooksErr.message} />
            </div>
          )}
          {dictListRespErr && (
            <div className="mt-3">
              <SimpleAlert title="教材通用字典获取失败" message={dictListRespErr.message} />
            </div>
          )}
          {questionCatesErr && (
            <div className="mt-3">
              <SimpleAlert title="导航题型获取失败" message={questionCatesErr.message} />
            </div>
          )}
          {questionListRespErr && (
            <div className="mt-3">
              <SimpleAlert title="题目列表获取失败" message={questionListRespErr.message} />
            </div>
          )}

          {/* 相关加载中 */}
          {showLoading && <Loading />}
        </div>

        <div>
          {/* 题目列表 */}
          <div>
            <QuestionListShow
              pageSource={QuestionPageSource.List}
              otherDictListRecord={otherDictListRecord}
              listResp={questionListResp}
              questionSearch={questionSearch}
              questionListRespMutate={questionListRespMutate}
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
    <div>
      <ResizablePanelGroup orientation="horizontal" className="border flex-col! md:flex-row!">
        <ResizablePanel defaultSize="25%">
          <div className="pr-1.5">{leftContent}</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="75%">
          <div className="pl-1.5">{rightContent}</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
