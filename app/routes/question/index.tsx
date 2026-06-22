import type { Route } from "./+types/index";
import type { Textbook } from "~/type/textbook";
import { createTextbookPathDict } from "~/util/textbook-dict";
import { useQuestionCates, useQuestionList, useQuestionTags, useQuestionTypes, useTextbooks } from "~/util/fetcher";
import { ChapterDropdownNav, type SelectNavProps } from "~/common/nav";
import { useLocation } from "react-router";
import { useEffect, useMemo, useState } from "react";
import type { QuestionSearch } from "~/type/question";
import { MultiTagSelect, TypeSelect } from "~/common/question/tag";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { StringConst } from "~/util/string";
import { SimplePagination } from "~/common/page";
import { Separator } from "~/components/ui/separator";
import { Loading } from "~/common/load";
import { SimpleAlert } from "~/common/alert";
import { SimpleSheet } from "~/common/sheet";
import { SimpleNoData } from "~/common/empty";
import { ArrayUtil } from "~/util/object";
import { QuestionListShow } from "~/common/question/list";
import Add from "~/question/add";
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
  const pathMap = useMemo(() => {
    return createTextbookPathDict(textbooks);
  }, [textbooks]);

  // 搜索对象维护
  const [questionSearch, setQuestionSearch] = useState<QuestionSearch>({
    twoLevelId: 0,
    fiveLevelId: selectNavProps.relatedId > 0 ? selectNavProps.relatedId : 0,
    fiveLevelSelectKeys: selectNavProps.selectedKeys || [],
    eightId: 0,
    eightLevelSelectKeys: [],
    typeId: 0,
    tagIds: [],
    id: 0,
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
    updateQuestionSearch("twoLevelId", twoLevelId);
  }, [questionSearch.fiveLevelId, pathMap]);

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
  const [sheetTitle, setSheetTitle] = useState<string>("");
  const [sheetDesc, setSheetDesc] = useState<string>("");
  const [sheetContent, setSheetContent] = useState<React.ReactNode>("");

  // 添加题目
  const handleAdd = () => {
    setSheetTitle("添加题目");
    setSheetDesc("通常只有标题是必填项, 比如纯粹的填空简答题等");
    setSheetContent(
      <Add questionSearch={questionSearch} setSheetTitle={setSheetTitle} setSheetDesc={setSheetDesc} setSheetContent={setSheetContent} />,
    );
    setOpenSheet(true);
  };

  return (
    <div className="p-3">
      {/* 搜索选项 */}
      <div className="flex flex-col gap-3">
        {/* 选择前5层级 */}
        <div className="grid grid-cols-10 gap-1 items-center">
          <div className="col-span-1">章节/考点:</div>
          <div className="col-span-9">
            <ChapterDropdownNav
              textbooks={textbooks}
              onSelect={(selectedItems: Textbook[]) => {
                if (!selectedItems) {
                  updateQuestionSearch("fiveLevelId", 0);
                  updateQuestionSearch("fiveLevelSelectKeys", []);
                  return;
                }

                const current: Textbook = selectedItems[selectedItems.length - 1];
                updateQuestionSearch("fiveLevelId", current.id);
                updateQuestionSearch(
                  "fiveLevelSelectKeys",
                  selectedItems.map((item) => item.key),
                );
              }}
              defaultSelectedKeys={selectNavProps.selectedKeys}
              placeholder="请选择章节/考点"
            />
          </div>
        </div>

        {/* 根据前5层级选择后3层级 */}
        <div className="grid grid-cols-10 gap-4 items-center">
          <div className="col-span-1">题型:</div>
          <div className="col-span-9">
            <ChapterDropdownNav
              textbooks={questionCates}
              onSelect={(selectedItems: Textbook[]) => {
                if (!selectedItems) {
                  updateQuestionSearch("eightId", 0);
                  updateQuestionSearch("eightLevelSelectKeys", []);
                  return;
                }

                const current: Textbook = selectedItems[selectedItems.length - 1];
                updateQuestionSearch("eightId", current.id);
                updateQuestionSearch(
                  "eightLevelSelectKeys",
                  selectedItems.map((info) => info.key),
                );
              }}
              defaultSelectedKeys={[]}
              placeholder="请选择题型"
            />
          </div>
        </div>

        <div className="grid grid-cols-10 gap-4 items-center">
          <div className="col-span-1">类型:</div>
          <div className="col-span-9">
            <TypeSelect
              options={questionTypes}
              defaultValue={0}
              onSelect={(val) => {
                updateQuestionSearch("typeId", val);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-10 gap-4 items-center">
          <div className="col-span-1">标签:</div>
          <div className="col-span-9">
            <MultiTagSelect
              options={questionTags}
              defaultValue={[]}
              onChange={(val) => {
                updateQuestionSearch("tagIds", val);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-10 gap-4 items-center">
          <div className="col-span-1">ID:</div>
          <div className="col-span-9">
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

        <div className="grid grid-cols-10 gap-1 items-center">
          <div className="col-span-1">操作:</div>
          <div className="col-span-9">
            <div className="flex flex-wrap gap-1">
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
      <div>
        <QuestionListShow
          questionTypeDict={questionTypeDict}
          questionTagDict={questionTagDict}
          listResp={questionListResp}
          questionSearch={questionSearch}
          setOpenSheet={setOpenSheet}
          setSheetTitle={setSheetTitle}
          setSheetDesc={setSheetDesc}
          setSheetContent={setSheetContent}
          setLoading={setIsLoading}
        />
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
