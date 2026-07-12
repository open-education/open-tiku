import { useEffect, useMemo, useState } from "react";
import { ChapterDropdownNav, ChapterTreeCheckboxNav } from "~/common/nav";
import { MultiTagSelect, ShowDifficultyLevelRange } from "~/common/question/tag";
import type { PaperGenMeta, PaperGenSearch, PaperTopMeta, PaperTopMetaSearch } from "~/type/paper";
import type { Textbook } from "~/type/textbook";
import { useQuestionCates, useQuestionOtherDicts, useTextbooks } from "~/util/fetcher";
import { ArrayUtil } from "~/util/object";
import { createTextbookPathDict } from "~/util/textbook-dict";
import { PaperGenConfig } from "~/paper/gen/config";
import { Button } from "~/components/ui/button";
import { Send, Settings2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { StringValidator } from "~/util/string";
import { PaperMetaConf } from "~/common/paper/config";

// 生成试卷

const defaultPaperMeta: PaperTopMeta = {
  relatedId: 0,
  tag: "",
  title: "",
  score: 0,
  source: "",
  year: "",
  groups: [],
  status: 0,
  createdAt: "",
  updatedAt: "",
  grade: "",
  semester: "",
  remark: "",
  authorId: 0,
  authorName: "admin", // 当前登录用户昵称
  count: 0,
  statusDesc: "",
  remarkExt: "",
  relatedName: "",
};

interface GenAddProps {
  metaSearch: PaperTopMetaSearch;
}
export default function GenAdd({ metaSearch }: GenAddProps) {
  // 计算初始值, 编辑时也是更新这个初始化值
  const initialPaperMeta = useMemo(() => {
    const updates: Partial<PaperTopMeta> = {};
    const fields = ["relatedId", "relatedName", "tag", "year", "grade", "semester"] as const;

    fields.forEach((field) => {
      const value = metaSearch[field as keyof typeof metaSearch];
      // relatedId 是 number
      if (field === "relatedId") {
        const rid = value as number;
        if (rid > 0) {
          updates[field] = rid;
        }
      } else if (StringValidator.isNonEmpty(value)) {
        updates[field] = value as any; // 需要断言为 any 才能赋值成功
      }
    });

    return { ...defaultPaperMeta, ...updates };
  }, []); // 只在组件挂载时计算一次

  // 初始化试卷信息
  const [paper, setPaper] = useState<PaperTopMeta>(initialPaperMeta);
  const updatePaperMeta = (key: keyof PaperTopMeta, value: string | number) => {
    setPaper((prev) => ({ ...prev, [key]: value }));
  };

  const { data: textbooks = [], isLoading: textbooksIsLoading, error: textbooksErr } = useTextbooks(5);
  // 将教材字典转化为 Map 格式, 存储 id 对应的所有层
  const pathMap = useMemo(() => {
    return createTextbookPathDict(textbooks);
  }, [textbooks]);

  // 搜索对象维护
  const [paperGenSearch, setPaperGenSearch] = useState<PaperGenSearch>({
    twoLevelId: 0,
    fiveLevelId: 0,
    fiveLevelSelectKeys: [],
    typeId: 0,
    tagIds: [],
    dimensionIds: [],
  });
  const updatePaperGenSearch = (key: keyof PaperGenSearch, value: number | number[] | string[]) => {
    setPaperGenSearch((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    // 5层深度时才能添加题目和查看题目列表, 但是题目类型和标签再2层深度上, 因此只要有2层深度就可以把题型类型和标签返回, 后续如果有优化再处理
    // 很明显 fiveLevelId 是选择下拉菜单触发的优先级最高
    if (!paperGenSearch.fiveLevelId || pathMap.size === 0) {
      return;
    }

    const nodes = pathMap.get(paperGenSearch.fiveLevelId.toString()) ?? [];
    const twoLevelId = nodes.length > 2 ? nodes[1].id : 0;
    updatePaperGenSearch("twoLevelId", twoLevelId);
  }, [paperGenSearch.fiveLevelId, pathMap]);

  // 查询题目类型和标签
  const {
    data: questionTypes = [],
    isLoading: questionTypesLoading,
    error: questionTypesErr,
  } = useQuestionOtherDicts(paperGenSearch.twoLevelId, "question_type");
  const paperGenMetaList = useMemo(
    () =>
      questionTypes.map(
        (info): PaperGenMeta => ({
          id: info.id,
          label: info.itemValue,
          num: 0,
          score: 0,
        }),
      ),
    [questionTypes],
  );

  const {
    data: questionTags = [],
    isLoading: questionTagsLoading,
    error: questionTagsErr,
  } = useQuestionOtherDicts(paperGenSearch.twoLevelId, "question_tag");
  const questionTagDict = useMemo(() => ArrayUtil.arrayToDict(questionTags, "id"), [questionTags]);

  const {
    data: questionDimensions = [],
    isLoading: questionDimensionsLoading,
    error: questionDimensionsErr,
  } = useQuestionOtherDicts(paperGenSearch.twoLevelId, "question_dimension");
  const questionDimensionDict = useMemo(() => ArrayUtil.arrayToDict(questionDimensions, "id"), [questionDimensions]);

  // 获取教材/考点题型列表
  const { data: questionCates = [], isLoading: questionCatesLoading, error: questionCatesErr } = useQuestionCates(paperGenSearch.fiveLevelId);

  return (
    <div className="text-base pl-4 pr-4 pb-4">
      <div className="text-sm">
        <div>1. 图片标识请使用右上角的 快捷工具-上传文件 上传图片后获得</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="default" className="text-sm" onClick={() => {}} disabled={false}>
          <Send className="mr-2 h-4 w-4" />
          存为草稿
        </Button>
        <Button variant="outline" className="text-sm" onClick={() => {}} disabled={false}>
          <Send className="mr-2 h-4 w-4" />
          提交审核
        </Button>
      </div>

      <Separator className="mt-3 mb-3" />

      {/* 试卷配置 */}
      <div>
        <PaperMetaConf textbooks={textbooks} paper={paper} defaultSelectedKeys={metaSearch.selectedKeys} updatePaperMeta={updatePaperMeta} />
      </div>

      {/* 题目选择 */}
      <div className="mt-3">
        <Card className="mt-1 shadow-sm hover:shadow-md transition-shadow duration-200 border-border/40">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              <CardTitle className="text-base font-medium">题目选择</CardTitle>
            </div>
            <CardDescription className="text-sm">配置试卷标签, 年份，年级，学期，标题和分数等项</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent>
            {/* 搜索选项 */}
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <div className="md:w-24 shrink-0 font-medium">章节/考点:</div>
                <div className="flex-1 min-w-0">
                  <ChapterDropdownNav
                    textbooks={textbooks}
                    onSelect={(selectedItems: Textbook[]) => {
                      if (!selectedItems) {
                        updatePaperGenSearch("fiveLevelId", 0);
                        updatePaperGenSearch("fiveLevelSelectKeys", []);
                        return;
                      }
                      const current: Textbook = selectedItems[selectedItems.length - 1];
                      updatePaperGenSearch("fiveLevelId", current.id);
                      updatePaperGenSearch(
                        "fiveLevelSelectKeys",
                        selectedItems.map((item) => item.key),
                      );
                    }}
                    defaultSelectedKeys={paperGenSearch.fiveLevelSelectKeys}
                    placeholder="请选择学段"
                  />
                </div>
              </div>

              {/* 题型 */}
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <div className="md:w-24 shrink-0 font-medium">题型:</div>
                <div className="flex-1 min-w-0">
                  <ChapterTreeCheckboxNav textbooks={questionCates} onSelect={(val) => {}} className="" />
                </div>
              </div>

              {/* 标签 */}
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <div className="md:w-24 shrink-0 font-medium">标签:</div>
                <div className="flex-1 min-w-0">
                  <MultiTagSelect
                    options={questionTags}
                    value={paperGenSearch.tagIds || []}
                    onChange={(val) => {
                      updatePaperGenSearch("tagIds", val);
                    }}
                  />
                </div>
              </div>

              {/* 核心素养 */}
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <div className="md:w-24 shrink-0 font-medium">核心素养:</div>
                <div className="flex-1 min-w-0">
                  <MultiTagSelect
                    options={questionDimensions}
                    value={paperGenSearch.dimensionIds || []}
                    onChange={(val) => {
                      updatePaperGenSearch("dimensionIds", val);
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <div className="md:w-24 shrink-0 font-medium">难度分布:</div>
                <div className="flex-1 min-w-0">
                  <ShowDifficultyLevelRange />
                </div>
              </div>

              {/* 题型题量 */}
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <div className="md:w-24 shrink-0 font-medium">题型题量:</div>
                <div className="flex-1 min-w-0">
                  <PaperGenConfig paperGenMetaList={paperGenMetaList} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
