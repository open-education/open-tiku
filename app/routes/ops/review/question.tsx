import { SimpleAlert } from '@/components/common/alert';
import { SimpleNoData } from '@/components/common/empty';
import { Loading } from '@/components/common/load';
import { SimplePagination } from '@/components/common/page';
import { QuestionListShow } from '@/components/question/list';
import { useDelayedLoading } from '@/hooks/delayed-loading';
import { QuestionPageSource, QuestionStatus } from '@/type/enum';
import type { QuestionSearch } from '@/type/question';
import { useQuestionCates, useQuestionList, useQuestionOtherDictList, useTextbooks } from '@/util/fetcher';
import { formatNumber } from '@/util/fmt';
import { TextbookUtil } from '@/util/object';
import { StringConst } from '@/util/string';
import { useEffect, useMemo, useState } from 'react';
import type { Route } from './+types/question';

// 审核-题目审核

export function meta({}: Route.MetaArgs) {
  return [
    { title: '审核-题目审核' },
    {
      name: 'description',
      content: '个人中心, 系统设置, 关联教材章节和知识点考点的关联关系',
    },
  ];
}

// 题型关联
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
    status: QuestionStatus.Pending, // 只查看待审核的题目
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
  } = useQuestionList(QuestionPageSource.MyReview, questionSearch, pageNo);

  const showLoading = useDelayedLoading(textbooksIsLoading || dictListRespLoading || questionCatesLoading || questionListRespLoading);

  return (
    <div>
      <div className="space-y-4">
        {showLoading && <Loading />}

        {textbooksErr && <SimpleAlert title="章节/知识点查询出错" message={textbooksErr.message} />}
        {dictListRespErr && <SimpleAlert title="题目相关标签查询出错" message={dictListRespErr.message} />}
        {questionCatesErr && <SimpleAlert title="题型查询出错" message={questionCatesErr.message} />}
        {questionListRespErr && <SimpleAlert title="题目列表查询出错" message={questionListRespErr.message} />}
      </div>

      <div>
        {questionListResp.total == 0 && <SimpleNoData desc="当前没有查找到任何需要你审核的题目。" />}

        {questionListResp.total > 0 && <div>共找到 {formatNumber(questionListResp.total)} 道题</div>}

        {/* 题目列表 */}
        <div className="mt-4">
          <QuestionListShow
            pageSource={QuestionPageSource.MyReview}
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
