import type { Route } from "./+types/index";
import type { Textbook } from "~/type/textbook";
import { createTextbookPathDict } from "~/util/textbook-dict";
import { useQuestionCates, useQuestionList, useQuestionTags, useQuestionTypes, useTextbooks } from "~/util/fetcher";
import { ChapterDropdownNav, type SelectNavProps } from "~/common/nav";
import { useLocation } from "react-router";
import { useEffect, useMemo, useState } from "react";
import type { QuestionSearch } from "~/type/question";
import { MultiTagSelect, OperateTags, TagShow, TypeSelect } from "~/common/question/tag";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { StringConst } from "~/util/string";
import { SimplePagination } from "~/common/page";
import { Separator } from "~/components/ui/separator";
import { Loading } from "~/common/load";
import { SimpleAlert } from "~/common/alert";
import { TitleShow } from "~/common/question/title";
import { MultiOptionShow } from "~/common/question/select";
import { SimpleSheet } from "~/common/sheet";
import { SimpleNoData } from "~/common/empty";
import { ArrayUtil, DictUtil } from "~/util/object";
import "katex/dist/katex.min.css";

/// 题目首页

export function meta({}: Route.MetaArgs) {
  return [{ title: "题目库" }, { name: "description", content: "教材章节, 知识点题库" }];
}

// 题目相关后续操作都在这个路由内完成
export default function Home() {
  const location = useLocation();
  // 首页可能传递过来已经选择好的导航级联信息keys列表
  const selectNavProps: SelectNavProps = location.state?.selectNavProps ?? {};

  // 5层导航信息
  const { data: textbooks = [], isLoading: textbooksLoading, error: textbooksErr } = useTextbooks(5);
  // 将教材字典转化为 Map 格式, 存储 id 对应的所有层
  const pathMap: Map<string, Textbook[]> = createTextbookPathDict(textbooks);

  // 搜索对象维护
  const [questionSearch, setQuestionSearch] = useState<QuestionSearch>({
    twoLevelId: 0,
    fiveLevelId: selectNavProps.relatedId ?? 0,
    eightId: 0,
    typeId: 0,
    tagIds: [],
    id: 0,
  });
  const updateQuestionSearch = (key: keyof QuestionSearch, value: number | number[]) => {
    setQuestionSearch((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    // 5层深度时才能添加题目和查看题目列表, 但是题目类型和标签再2层深度上, 因此只要有2层深度就可以把题型类型和标签返回, 后续如果有优化再处理
    // 很明显 fiveLevelId 是选择下拉菜单触发的优先级最高
    const nodes = pathMap.get(questionSearch.fiveLevelId.toString()) ?? [];
    const twoLevelId = nodes.length > 2 ? nodes[1].id : 0;
    updateQuestionSearch("twoLevelId", twoLevelId);
  }, [questionSearch.fiveLevelId]);

  // 查询题目类型和标签
  const { data: questionTypes = [], isLoading: questionTypesLoading, error: questionTypesErr } = useQuestionTypes(questionSearch.twoLevelId);
  const questionTypeDict = useMemo(() => ArrayUtil.arrayToDict(questionTypes, "id"), [questionTypes]);

  const { data: questionTags = [], isLoading: questionTagsLoading, error: questionTagsErr } = useQuestionTags(questionSearch.twoLevelId);
  const questionTagDict = useMemo(() => ArrayUtil.arrayToDict(questionTags, "id"), [questionTags]);

  // 获取教材/考点题型列表
  const { data: questionCates = [], isLoading: questionCatesLoading, error: questionCatesErr } = useQuestionCates(questionSearch.fiveLevelId);

  // 查询题目列表
  const [pageNo, setPageNo] = useState<number>(1);
  const {
    data: questionListResp = { list: [], pageNo: pageNo, pageSize: StringConst.pageSize, total: 0 },
    isLoading: questionListRespLoading,
    error: questionListRespErr,
  } = useQuestionList(questionSearch, pageNo);

  // 页面加载中
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sheet相关操作变量
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [sheetTitle, setSheetTitle] = useState<React.ReactNode>("");
  const [sheetDesc, setSheetDesc] = useState<React.ReactNode>("");
  const [sheetContent, setSheetContent] = useState<React.ReactNode>("");

  // 添加题目
  const handleAdd = () => {
    setOpenSheet(true);
    setSheetTitle("添加题目");
    setSheetContent(<div>这是一段文字</div>);
  };

  return (
    <div className="mt-3">
      {/* 搜索选项 */}
      <div className="flex flex-col gap-3">
        {/* 选择前5层级 */}
        <div className="grid grid-cols-5 gap-4 items-center">
          <div className="col-span-1">学段/考点</div>
          <div className="col-span-4">
            <ChapterDropdownNav
              textbooks={textbooks}
              onSelect={(selectedItems: Textbook[]) => {
                if (!selectedItems) {
                  updateQuestionSearch("fiveLevelId", 0);
                  return;
                }

                const current: Textbook = selectedItems[selectedItems.length - 1];
                updateQuestionSearch("fiveLevelId", current.id);
              }}
              defaultSelectedKeys={selectNavProps.selectedKeys}
              placeholder="请选择学段/考点"
            />
          </div>
        </div>

        {/* 根据前5层级选择后3层级 */}
        <div className="grid grid-cols-5 gap-4 items-center">
          <div className="col-span-1">题型</div>
          <div className="col-span-4">
            <ChapterDropdownNav
              textbooks={questionCates}
              onSelect={(selectedItems: Textbook[]) => {
                if (!selectedItems) {
                  updateQuestionSearch("eightId", 0);
                  return;
                }

                const current: Textbook = selectedItems[selectedItems.length - 1];
                updateQuestionSearch("eightId", current.id);
              }}
              defaultSelectedKeys={[]}
              placeholder="请选择题型"
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 items-center">
          <div className="col-span-1">类型</div>
          <div className="col-span-4">
            <TypeSelect
              options={questionTypes}
              defaultValue={0}
              onSelect={(val) => {
                updateQuestionSearch("typeId", val);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 items-center">
          <div className="col-span-1">标签</div>
          <div className="col-span-4">
            <MultiTagSelect
              options={questionTags}
              defaultValue={[]}
              onChange={(val) => {
                updateQuestionSearch("tagIds", val);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 items-center">
          <div className="col-span-1">ID</div>
          <div className="col-span-4">
            <Input
              type="number"
              value={questionSearch.id}
              onChange={(e) => {
                updateQuestionSearch("id", Number(e.target.value));
              }}
              className="text-sm w-1/4"
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 items-center">
          <div className="col-span-1">操作</div>
          <div className="col-span-4">
            <div className="col-span-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleAdd}>
                添加题目
              </Button>
              <Button variant="outline" onClick={() => {}}>
                上传题目
              </Button>
              <Button variant="outline" onClick={() => {}}>
                查看任务
              </Button>
            </div>
          </div>
        </div>
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
      {questionTypesErr && (
        <div className="mt-3">
          <SimpleAlert title="题目类型获取失败" message={questionTypesErr.message} />
        </div>
      )}
      {questionTagsErr && (
        <div className="mt-3">
          <SimpleAlert title="题目标签获取失败" message={questionTagsErr.message} />
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
      {(isLoading || textbooksLoading || questionTypesLoading || questionTagsLoading || questionCatesLoading || questionListRespLoading) && (
        <Loading />
      )}

      {/* 题目列表 */}
      <div className="mt-3">
        {questionListResp.list?.map((questionInfo) => {
          return (
            <div
              key={questionInfo.id}
              className="group relative p-4 pb-4 hover:pb-12 border border-transparent hover:border-blue-500 transition-all duration-300 ease-in-out bg-white overflow-hidden"
            >
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

              {/* 题目其它标签, 比如查看答案, 关联题目等 */}
              <div className="absolute right-4 translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
                <OperateTags
                  questionTypeDict={questionTypeDict}
                  questionTagDict={questionTagDict}
                  questionId={questionInfo.id}
                  setOpenSheet={setOpenSheet}
                  setSheetTitle={setSheetTitle}
                  setSheetContent={setSheetContent}
                  setLoading={setIsLoading}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 分页 */}
      {questionListResp.total > 0 && (
        <div className="mt-3 mb-3">
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
