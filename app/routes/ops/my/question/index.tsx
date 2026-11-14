import { QuestionPageSource, QuestionStatus } from '@/type/enum';
import type { QuestionSearch } from '@/type/question';
import { useQuestionCates, useQuestionList, useQuestionOtherDictList, useTextbooks } from '@/util/fetcher';
import { StringConst } from '@/util/string';
import { useEffect, useMemo, useState } from 'react';

import { SimpleAlert } from '@/components/common/alert';
import { SimpleNoData } from '@/components/common/empty';
import { Loading } from '@/components/common/load';
import type { CheckboxTreeNode } from '@/components/common/nav';
import { SimplePagination } from '@/components/common/page';
import FilterList from '@/components/question/filter';
import { QuestionListShow } from '@/components/question/list';
import { StatusList } from '@/components/question/status';
import { useDelayedLoading } from '@/hooks/delayed-loading';
import type { TextbookResp } from '@/type/textbook';
import { formatNumber } from '@/util/fmt';
import { TextbookUtil } from '@/util/object';
import type { Route } from './+types/index';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '我的题目' },
    {
      name: 'description',
      content: '收集整理网站常见的疑问和做一些适当的说明',
    },
  ];
}

// 我的题目

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
  } = useQuestionList(QuestionPageSource.MyQuestion, questionSearch, pageNo);

  const [activeStatus, setActiveStatus] = useState<QuestionStatus>(QuestionStatus.None);

  const showLoading = useDelayedLoading(textbooksIsLoading || dictListRespLoading || questionCatesLoading || questionListRespLoading);

  return (
    <div>
      <div className="mt-1 space-y-4 peer">
        {showLoading && <Loading />}

        {textbooksErr && <SimpleAlert title="章节/知识点查询出错" message={textbooksErr.message} />}
        {dictListRespErr && <SimpleAlert title="题目相关标签查询出错" message={dictListRespErr.message} />}
        {questionCatesErr && <SimpleAlert title="题型查询出错" message={questionCatesErr.message} />}
        {questionListRespErr && <SimpleAlert title="题目列表查询出错" message={questionListRespErr.message} />}
      </div>

      <div className="px-3 py-1 bg-card mt-4 peer-empty:mt-1">
        {/* 题目状态卡片 */}
        <StatusList
          activeStatus={activeStatus}
          onSelectStatus={(status) => {
            setActiveStatus(status);
            updateQuestionSearch('status', status);
          }}
        />
      </div>

      {/* 筛选条件 */}
      <div className="mt-4">
        <FilterList
          textbooks={textbooks}
          questionCates={questionCates}
          otherDictListRecord={otherDictListRecord}
          questionSearch={questionSearch}
          onTextbook={(_, selectedTextbooks) => {
            if (!selectedTextbooks || !selectedTextbooks.fifth) {
              updateQuestionSearch('fiveLevelId', 0);
              updateQuestionSearch('fiveLevelSelectKeys', []);
              return;
            }
            const current: TextbookResp = selectedTextbooks.fifth;
            updateQuestionSearch('fiveLevelId', current.id);
          }}
          onQuestionCate={() => {
            (selectedItems: CheckboxTreeNode[]) => {
              if (!selectedItems) {
                updateQuestionSearch('eightIds', []);
                return;
              }
              // tableName: "question_cate" 对应的为题型标识
              const questionCateIds = selectedItems.filter((item) => item.tableName === StringConst.questionCateTableName).map((item) => item.id);
              updateQuestionSearch('eightIds', questionCateIds);
            };
          }}
          updateQuestionSearch={updateQuestionSearch}
        />
      </div>

      <div className="mt-4">
        {questionListResp.total == 0 && (
          <SimpleNoData desc="没有查找到任何题目，如有题目，可以尝试上传题目，管理员审核通过后，其他人就可以看到该题目了。" />
        )}

        {questionListResp.total > 0 && <div>共找到 {formatNumber(questionListResp.total)} 道题</div>}

        {/* 题目列表 */}
        <div className="mt-4">
          <QuestionListShow
            pageSource={QuestionPageSource.MyQuestion}
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
  );
}
