import { Input } from '~/components/ui/input';
import { ChapterDropdownNav, type SelectNavProps } from '~/common/nav';
import { MultiTagSelect, StatusSelect, TypeSelect } from '~/common/question/tag';
import type { QuestionPageSourceProps, QuestionSearch } from '~/type/question';
import type { TextbookResp } from '~/type/textbook';
import { useQuestionCates, useQuestionList, useQuestionOtherDictList, useTextbooks } from '~/util/fetcher';
import { useEffect, useMemo, useState } from 'react';
import { createOtherDictListRecord, createTextbookPathDict } from '~/util/textbook-dict';
import { StringConst } from '~/util/string';
import { Separator } from '~/components/ui/separator';
import { SimpleNoData } from '~/common/empty';
import { SimpleAlert } from '~/common/alert';
import { useDelayedLoading } from '~/hooks/delayed-loading';
import { Loading } from '~/common/load';
import { QuestionListShow } from '~/common/question/list';
import { SimplePagination } from '~/common/page';
import { SimpleSheet } from '~/common/sheet';
import Add from '~/home/question/add';
import { TaskAdd, TaskListShow } from '~/home/question/task';
import { Button } from '~/components/ui/button';
import { Plus, Upload, View } from 'lucide-react';
import type { UserInfoResp } from '~/type/user';
import { useUserInfo } from '~/hooks/use-user';
import { QuestionRelationType, UserRoleType } from '~/type/enum';
import { cn } from 'cn';

// 题目搜索页面
interface QuestionSearchProps {
  selectNavProps?: SelectNavProps;
  pageSource: QuestionPageSourceProps;
  className?: string;
}

function QuestionSearchPage({ selectNavProps, pageSource, className = '' }: QuestionSearchProps) {
  // 获取用户信息
  const currentUser: UserInfoResp | null = useUserInfo();

  // 5层导航信息
  const { data: textbooks = [], isLoading: textbooksLoading, error: textbooksErr } = useTextbooks(5);
  // 将教材字典转化为 Map 格式, 存储 id 对应的所有层
  const pathMap = useMemo(() => {
    return createTextbookPathDict(textbooks);
  }, [textbooks]);

  // 搜索对象维护
  const [questionSearch, setQuestionSearch] = useState<QuestionSearch>({
    twoLevelId: 0,
    fiveLevelId: selectNavProps?.relatedId || 0,
    fiveLevelSelectKeys: selectNavProps?.selectedKeys || [],
    eightIds: [],
    eightLevelSelectKeys: [],
    typeId: 0,
    tagIds: [],
    dimensionIds: [],
    levelIds: [],
    sceneIds: [],
    mistakeTipIds: [],
    // 我的题目和审核默认查询草稿中的数据
    ...(pageSource.source !== 'list' ? { status: 0 } : {}),
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
    return createOtherDictListRecord(dictListResp);
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
  } = useQuestionList(pageSource.source, questionSearch, pageNo);

  // 页面加载中
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sheet相关操作变量
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [sheetTitle, setSheetTitle] = useState<string>('');
  const [sheetDesc, setSheetDesc] = useState<string>('');
  const [sheetContent, setSheetContent] = useState<React.ReactNode>('');

  // 添加题目
  const handleQuestionAdd = () => {
    setSheetTitle('添加母题');
    setSheetDesc('通常只有标题是必填项, 比如纯粹的填空简答题等');
    setSheetContent(
      <Add
        questionSearch={questionSearch}
        addRelationType={QuestionRelationType.Base}
        setSheetTitle={setSheetTitle}
        setSheetDesc={setSheetDesc}
        setSheetContent={setSheetContent}
      />,
    );
    setOpenSheet(true);
  };

  // 添加任务
  const handleTaskAdd = () => {
    setSheetTitle('上传题目');
    setSheetDesc('注意上传模板约定');
    setSheetContent(
      <TaskAdd questionSearch={questionSearch} setSheetTitle={setSheetTitle} setSheetDesc={setSheetDesc} setSheetContent={setSheetContent} />,
    );
    setOpenSheet(true);
  };

  // 查看任务
  const handleTaskList = () => {
    setSheetTitle('任务列表');
    setSheetDesc('任务执行周期大概每5分钟一次, 如果任务异常请联系管理员');
    setSheetContent(<TaskListShow questionSearch={questionSearch} />);
    setOpenSheet(true);
  };

  return (
    <div className={cn('bg-muted p-4', className)}>
      {/* 搜索选项 */}
      <div className="flex flex-col gap-3">
        {/* 章节/考点 */}
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">章节/考点:</div>
          <div className="flex-1 min-w-0">
            <ChapterDropdownNav
              textbooks={textbooks}
              onSelect={(selectedItems: TextbookResp[]) => {
                if (!selectedItems) {
                  updateQuestionSearch('fiveLevelId', 0);
                  updateQuestionSearch('fiveLevelSelectKeys', []);
                  return;
                }
                const current: TextbookResp = selectedItems[selectedItems.length - 1];
                updateQuestionSearch('fiveLevelId', current.id);
                updateQuestionSearch(
                  'fiveLevelSelectKeys',
                  selectedItems.map((item) => item.key),
                );
              }}
              defaultSelectedKeys={questionSearch.fiveLevelSelectKeys}
              placeholder="请选择章节/考点"
            />
          </div>
        </div>

        {/* 题型 */}
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">题型分类:</div>
          <div className="flex-1 min-w-0">
            <ChapterDropdownNav
              textbooks={questionCates}
              onSelect={(selectedItems: TextbookResp[]) => {
                if (!selectedItems) {
                  updateQuestionSearch('eightIds', []);
                  updateQuestionSearch('eightLevelSelectKeys', []);
                  return;
                }

                updateQuestionSearch(
                  'eightLevelSelectKeys',
                  selectedItems.map((info) => info.key),
                );

                const current: TextbookResp = selectedItems[selectedItems.length - 1];

                // 必须选择题型
                if (current.tableName !== StringConst.questionCateTableName) {
                  updateQuestionSearch('eightIds', []);
                  return;
                }

                updateQuestionSearch('eightIds', [current.id]);
              }}
              defaultSelectedKeys={[]}
              placeholder="请选择题型"
            />
          </div>
        </div>

        {/* 类型 */}
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">题目类型:</div>
          <div className="flex-1 min-w-0">
            <TypeSelect
              options={otherDictListRecord.questionTypes}
              value={questionSearch.typeId}
              onSelect={(val) => {
                updateQuestionSearch('typeId', val);
              }}
            />
          </div>
        </div>

        {/* 标签 */}
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">题目标签:</div>
          <div className="flex-1 min-w-0">
            <MultiTagSelect
              options={otherDictListRecord.questionTags}
              value={questionSearch.tagIds}
              onChange={(val) => {
                updateQuestionSearch('tagIds', val);
              }}
            />
          </div>
        </div>

        {/* 核心素养 */}
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">核心素养:</div>
          <div className="flex-1 min-w-0">
            <MultiTagSelect
              options={otherDictListRecord.questionDimensions}
              value={questionSearch.dimensionIds}
              onChange={(val) => {
                updateQuestionSearch('dimensionIds', val);
              }}
            />
          </div>
        </div>

        {/* 分层体系 */}
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">分层体系:</div>
          <div className="flex-1 min-w-0">
            <MultiTagSelect
              options={otherDictListRecord.questionLevels}
              value={questionSearch.levelIds}
              onChange={(val) => {
                updateQuestionSearch('levelIds', val);
              }}
            />
          </div>
        </div>

        {/* 适用场景 */}
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">适用场景:</div>
          <div className="flex-1 min-w-0">
            <MultiTagSelect
              options={otherDictListRecord.questionScenes}
              value={questionSearch.sceneIds}
              onChange={(val) => {
                updateQuestionSearch('sceneIds', val);
              }}
            />
          </div>
        </div>

        {/* 常见错误 */}
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">常见错误:</div>
          <div className="flex-1 min-w-0">
            <MultiTagSelect
              options={otherDictListRecord.questionMistakeTips}
              value={questionSearch.mistakeTipIds}
              onChange={(val) => {
                updateQuestionSearch('mistakeTipIds', val);
              }}
            />
          </div>
        </div>

        {/* 我的题目和审核可以自己选择状态 */}
        {pageSource.source !== 'list' && (
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <div className="md:w-24 shrink-0 font-medium">题目状态:</div>
            <div className="flex-1 min-w-0">
              <StatusSelect defaultValue={questionSearch.status} onSelect={(status) => updateQuestionSearch('status', status)} />
            </div>
          </div>
        )}

        {/* ID */}
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">题目 ID:</div>
          <div className="flex-1 min-w-0">
            <Input
              type="number"
              value={questionSearch.id}
              onChange={(e) => {
                updateQuestionSearch('id', Number(e.target.value));
              }}
              className="text-sm md:text-sm w-full md:w-1/3" // 移动端全宽，PC端1/3宽度
            />
          </div>
        </div>

        {/* 操作按钮, 普通列表页面 */}
        {pageSource.source === 'list' && (
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <div className="md:w-24 shrink-0 font-medium">操作:</div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1">
                {currentUser && currentUser.role !== UserRoleType.Student && (
                  <>
                    <Button variant="outline" className="text-sm" onClick={handleQuestionAdd}>
                      <Plus className="mr-2 h-4 w-4" />
                      添加母题
                    </Button>
                    <Button variant="outline" className="text-sm" onClick={handleTaskAdd}>
                      <Upload className="mr-2 h-4 w-4" />
                      上传题目
                    </Button>
                  </>
                )}
                <Button variant="outline" className="text-sm" onClick={handleTaskList}>
                  <View className="mr-2 h-4 w-4" />
                  查看任务
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3">
        <Separator />
      </div>

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
      {useDelayedLoading(isLoading || textbooksLoading || dictListRespLoading || questionCatesLoading || questionListRespLoading) && <Loading />}

      {/* 题目列表 */}
      <div>
        <QuestionListShow
          pageSource={pageSource}
          otherDictListRecord={otherDictListRecord}
          listResp={questionListResp}
          questionSearch={questionSearch}
          questionListRespMutate={questionListRespMutate}
          setOpenSheet={setOpenSheet}
          setSheetTitle={setSheetTitle}
          setSheetDesc={setSheetDesc}
          setSheetContent={setSheetContent}
          setLoading={setIsLoading}
        />
      </div>

      {/* 分页 */}
      {questionListResp.total > 0 && (
        <div className="mt-3">
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

      {/* 题目页面Sheet内容 */}
      <div>
        <SimpleSheet openSheet={openSheet} setOpenSheet={setOpenSheet} sheetTitle={sheetTitle} sheetDesc={sheetDesc} sheetContent={sheetContent} />
      </div>
    </div>
  );
}

export { QuestionSearchPage };
