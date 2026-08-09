import React, { useEffect, useMemo, useState } from "react";
import { ChapterDropdownNav, ChapterTreeCheckboxNav, type CheckboxTreeNode } from "~/common/nav";
import { MultiTagSelect, ShowDifficultyLevelRange } from "~/common/question/tag";
import type {
  DifficultyLevelRange,
  PaperGenTypeMeta,
  PaperGenSearch,
  PaperMeta,
  PaperMetaSearch,
  PapgerGenConf,
  PaperPreviewReq,
  PaperGenReq,
  PaperGenGroupReq,
  PaperGenQuestionReq,
} from "~/type/paper";
import type { Textbook } from "~/type/textbook";
import { useQuestionCates, useQuestionOtherDicts, useTextbooks } from "~/util/fetcher";
import { createTextbookPathDict } from "~/util/textbook-dict";
import { PaperGenConfig } from "~/paper/gen/config";
import { Button } from "~/components/ui/button";
import { Eye, Save, Send, Settings2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { StringConst, StringValidator } from "~/util/string";
import { PaperMetaConf } from "~/common/paper/config";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import { Loading } from "~/common/load";
import { SimpleAlert } from "~/common/alert";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";
import { Watermark } from "~/common/watermark";
import { httpClient } from "~/util/http";
import { toast } from "sonner";
import { ExamPaperMeta } from "~/common/paper/meta";
import { ArrayUtil } from "~/util/object";

// 生成试卷

const generateId = () => Math.random().toString(36).substring(2, 9);

const defaultPaperMeta: PaperMeta = {
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
  count: 0,
  statusDesc: "",
  remarkExt: "",
  relatedName: "",
  paperType: 0,
};

interface GenAddProps {
  metaSearch: PaperMetaSearch;
  // 以下为 Sheet 操作方法和属性
  setSheetTitle?: (value: string) => void;
  setSheetDesc?: (value: string) => void;
  setSheetContent?: (value: React.ReactNode) => void;
}
export default function GenAdd({ metaSearch, setSheetTitle, setSheetDesc, setSheetContent }: GenAddProps) {
  // 计算初始值, 编辑时也是更新这个初始化值
  const initialPaperMeta = useMemo(() => {
    const updates: Partial<PaperMeta> = {};
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
  const [paperMeta, setPaperMeta] = useState<PaperMeta>(initialPaperMeta);
  const updatePaperMeta = (key: keyof PaperMeta, value: string | number) => {
    setPaperMeta((prev) => ({ ...prev, [key]: value }));
  };

  const { data: textbooks = [], isLoading: textbooksIsLoading, error: textbooksErr } = useTextbooks(5);
  // 将教材字典转化为 Map 格式, 存储 id 对应的所有层
  const pathMap = useMemo(() => {
    return createTextbookPathDict(textbooks);
  }, [textbooks]);

  // 搜索对象维护
  const [paperGenSearch, setPaperGenSearch] = useState<PaperGenSearch>({
    twoLevelId: 0,
    fiveLevelId: metaSearch.relatedId > 0 ? metaSearch.relatedId : 0,
    fiveLevelSelectKeys: metaSearch.selectedKeys ? metaSearch.selectedKeys : [],
    typeId: 0,
    tagIds: [],
    dimensionIds: [],
    typeMetaList: [],
  });
  const updatePaperGenSearch = (key: keyof PaperGenSearch, value: number | number[] | string[] | PaperGenTypeMeta[]) => {
    setPaperGenSearch((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    // 5层深度时才能添加题目和查看题目列表, 但是题目类型和标签再2层深度上, 因此只要有2层深度就可以把题型类型和标签返回, 后续如果有优化再处理
    // 很明显 fiveLevelId 是选择下拉菜单触发的优先级最高
    if (!paperGenSearch.fiveLevelId || pathMap.size === 0) {
      return;
    }

    const nodes = pathMap.get(paperGenSearch.fiveLevelId.toString()) ?? [];
    const twoLevelId = nodes.length >= 2 ? nodes[1].id : 0;
    updatePaperGenSearch("twoLevelId", twoLevelId);
  }, [paperGenSearch.fiveLevelId, pathMap]);

  // 查询题目类型和标签
  const {
    data: questionTypes = [],
    isLoading: questionTypesLoading,
    error: questionTypesErr,
  } = useQuestionOtherDicts(paperGenSearch.twoLevelId, "question_type");

  // 添加状态来维护题型配置
  const [typeMetaList, setTypeMetaList] = useState<PaperGenTypeMeta[]>([]);

  // 当 questionTypes 变化时，初始化 typeMetaList
  useEffect(() => {
    const initialList = questionTypes.map(
      (info): PaperGenTypeMeta => ({
        id: info.id,
        label: info.itemValue,
        num: 0,
        score: 0,
      }),
    );
    setTypeMetaList(initialList);
  }, [questionTypes]);

  // 更新 paperGenSearch 时使用 typeMetaList
  const handleTypeMetaListChange = (newList: PaperGenTypeMeta[]) => {
    setTypeMetaList(newList);
    updatePaperGenSearch("typeMetaList", newList);
  };

  const {
    data: questionTags = [],
    isLoading: questionTagsLoading,
    error: questionTagsErr,
  } = useQuestionOtherDicts(paperGenSearch.twoLevelId, "question_tag");

  const {
    data: questionDimensions = [],
    isLoading: questionDimensionsLoading,
    error: questionDimensionsErr,
  } = useQuestionOtherDicts(paperGenSearch.twoLevelId, "question_dimension");

  // 获取教材/考点题型列表
  const { data: questionCates = [], isLoading: questionCatesLoading, error: questionCatesErr } = useQuestionCates(paperGenSearch.fiveLevelId);

  // 难度分布
  const [levelRange, setLevelRange] = useState<DifficultyLevelRange>({ basic: 50, improve: 30, expand: 20 });

  const [warnInfo, setWarnInfo] = useState<React.ReactNode>(null);

  // 记录生成的预览试卷
  const [paperPreviewInfo, setPaperPreviewInfo] = useState<PaperMeta>(defaultPaperMeta);

  const [previewing, setPreviewing] = useState<boolean>(false);
  const [drafting, setDrafting] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);

  // 生成试卷预览
  const handleGenPaper = () => {
    setWarnInfo("");

    if (!paperGenSearch.questionCateIds || paperGenSearch.questionCateIds.length == 0) {
      toast.error(<div className="text-red-700">题目选择： 第8级菜单题型配置不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (paperGenSearch.typeMetaList.length == 0) {
      toast.error(<div className="text-red-700">题目选择： 题型题量配置不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (paperMeta.relatedId !== paperGenSearch.fiveLevelId) {
      toast.error(<div className="text-red-700">基础设置: 学段/考点 和 题目选择: 章节/考点 不一致</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }

    const conf: PapgerGenConf = {
      questionCateIds: paperGenSearch.questionCateIds || [],
      tagIds: paperGenSearch.tagIds,
      dimensionIds: paperGenSearch.dimensionIds,
      levelRange: levelRange,
      questionTypes: paperGenSearch.typeMetaList,
    };

    // 预览请求
    const req: PaperPreviewReq = {
      ...paperMeta,
      conf: conf,
    };

    setPreviewing(true);

    httpClient
      .post<PaperMeta>("/paper/gen/preview", req)
      .then((res) => {
        setPaperPreviewInfo(res);
      })
      .catch((err) => {
        setWarnInfo(<SimpleAlert title="生成预览失败" message={err.message} />);
      })
      .finally(() => {
        setPreviewing(false);
      });
  };

  // 保存试卷
  const handleSavePaper = (status: number) => {
    setWarnInfo("");

    // 检查必填参数是否为空
    if (paperMeta.relatedId <= 0) {
      toast.error(<div className="text-red-700">学段/考点不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringValidator.isNonEmpty(paperMeta.tag)) {
      toast.error(<div className="text-red-700">标签不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringValidator.isNonEmpty(paperMeta.year)) {
      toast.error(<div className="text-red-700">年份不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }

    if (!paperGenSearch.questionCateIds || paperGenSearch.questionCateIds.length == 0) {
      toast.error(<div className="text-red-700">题目选择： 第8级菜单题型配置不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (paperGenSearch.typeMetaList.length == 0) {
      toast.error(<div className="text-red-700">题目选择： 题型题量配置不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (paperMeta.relatedId !== paperGenSearch.fiveLevelId) {
      toast.error(<div className="text-red-700">基础设置: 学段/考点 和 题目选择: 章节/考点 不一致</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }

    // 从题目配置和 paper 中解析出题目信息, 必须生成预览才能保存, 目的是确定试卷完整
    // 没有生成预览数据 paperPreviewInfo 是空的
    if (!paperPreviewInfo || paperPreviewInfo.groups.length == 0) {
      toast.error(<div className="text-red-700">需要先生成预览, 验证试卷完整性后再保存</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    // 检查题型题量配置和预览结果中的数据是否匹配
    const previewGroupDict = ArrayUtil.arrayToDict(paperPreviewInfo.groups, "typeName");
    for (let i = 0; i < paperGenSearch.typeMetaList.length; i++) {
      const item = paperGenSearch.typeMetaList[i];
      // 题目配置为0的不处理
      if (item.num <= 0) {
        continue;
      }
      // 分数不能小于等于0
      if (item.score <= 0) {
        toast.error(<div className="text-red-700">题型题量配置 [${item.label}] 分数不能小于等于0</div>, {
          duration: Infinity,
          action: {
            label: "关闭",
            onClick: () => {},
          },
        });
        return;
      }
      if (item.label in previewGroupDict) {
        const groupInfo = previewGroupDict[item.label];
        // 题目数量不匹配则抛出错误
        if (item.num != groupInfo.questions.length) {
          toast.error(<div className="text-red-700">题型题量配置 [{item.label}] 在预览结果中数量不匹配</div>, {
            duration: Infinity,
            action: {
              label: "关闭",
              onClick: () => {},
            },
          });
          return;
        }
      } else {
        toast.error(<div className="text-red-700">题型题量配置 [{item.label}] 在预览结果中不存在</div>, {
          duration: Infinity,
          action: {
            label: "关闭",
            onClick: () => {},
          },
        });
        return;
      }
    }

    if (!confirm("确定保存预览数据?")) {
      return;
    }

    if (status === 0) {
      setDrafting(true);
      paperMeta.status = 0;
    } else {
      setApproving(true);
      paperMeta.status = 1;
    }

    paperMeta.paperType = StringConst.paperTypesGen;

    // 题目配置
    const conf: PapgerGenConf = {
      questionCateIds: paperGenSearch.questionCateIds || [],
      tagIds: paperGenSearch.tagIds,
      dimensionIds: paperGenSearch.dimensionIds,
      levelRange: levelRange,
      questionTypes: paperGenSearch.typeMetaList,
    };

    // 题型题目信息
    const reqGroups: PaperGenGroupReq[] = [];
    // 统计总题目数
    let countNum = 0;
    for (let i = 0; i < paperPreviewInfo.groups.length; i++) {
      const groupInfo = paperPreviewInfo.groups[i];
      // 没有题目的不处理
      if (!groupInfo.questions || groupInfo.questions.length == 0) {
        continue;
      }
      countNum += groupInfo.questions.length;
      const reqQuestions: PaperGenQuestionReq[] = [];
      for (let j = 0; j < groupInfo.questions.length; j++) {
        const qInfo = groupInfo.questions[j];
        reqQuestions.push({
          genId: generateId(),
          orderNum: qInfo.orderNum,
          questionId: qInfo.id,
          score: qInfo.score,
        });
      }
      const reqGroupInfo: PaperGenGroupReq = {
        questions: reqQuestions,
        id: 0,
        paperId: 0,
        genId: generateId(),
        typeName: groupInfo.typeName,
        subTitle: groupInfo.subTitle,
      };

      reqGroups.push(reqGroupInfo);
    }

    // 保存预览数据
    const req: PaperGenReq = {
      ...paperMeta,
      count: countNum,
      conf: conf,
      groups: reqGroups,
    };

    httpClient
      .post<number>("/paper/gen/add", req)
      .then((resId) => {
        // 保存试卷成功则跳转到详情页面即可
        // 获取详情渲染Sheet为试卷详情
        httpClient
          .get<PaperMeta>(`/paper/gen/info/${resId}`)
          .then((res) => {
            setSheetTitle?.("试卷详情");
            setSheetDesc?.("仅为详情预览, 需审核通过后其他人可见, 可去 我的试卷 查看");
            setSheetContent?.(<ExamPaperMeta paperMeta={res} />);
          })
          .catch((err) => {
            setWarnInfo(<SimpleAlert title="获取试卷详情失败" message={err.message} />);
          });
      })
      .catch((err) => {
        setWarnInfo(<SimpleAlert title="保存试卷出错" message={err.message} />);
      })
      .finally(() => {
        setDrafting(false);
        setApproving(false);
      });
  };

  return (
    <div className="text-base pl-4 pr-4 pb-4">
      <div className="text-sm">
        <div>1. 生成预览为查看试卷题目完整情况, 未作保存;</div>
        <div>2. 题目是随机生成的, 如果生成预览后有更新, 需要重新生成预览后再保存, 否则保存的是上一次的预览数据;</div>
        <div>3. 对预览的试卷不满意, 需保存后再去 我的试卷 进行二次编辑, 调整题目分数, 替换其它题目等;</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" className="text-sm" onClick={handleGenPaper} disabled={previewing}>
          <Eye className="mr-2 h-4 w-4" />
          {previewing ? "生成预览中" : "生成预览"}
        </Button>
        <Button variant="default" className="text-sm" onClick={() => handleSavePaper(0)} disabled={drafting}>
          <Save className="mr-2 h-4 w-4" />
          {drafting ? "存为草稿中..." : "存为草稿"}
        </Button>
        <Button variant="outline" className="text-sm" onClick={() => handleSavePaper(1)} disabled={approving}>
          <Send className="mr-2 h-4 w-4" />
          {approving ? "提交审核中..." : "提交审核"}
        </Button>
      </div>

      <Separator className="mt-3 mb-3" />

      {useDelayedLoading(textbooksIsLoading || questionTypesLoading || questionTagsLoading || questionDimensionsLoading || questionCatesLoading) && (
        <Loading />
      )}

      {textbooksErr && <SimpleAlert title="获取导航失败" message={textbooksErr.message} />}
      {questionTypesErr && <SimpleAlert title="获取题目类型失败" message={questionTypesErr.message} />}
      {questionTagsErr && <SimpleAlert title="获取题目标签失败" message={questionTagsErr.message} />}
      {questionDimensionsErr && <SimpleAlert title="获取核心素养失败" message={questionDimensionsErr.message} />}
      {questionCatesErr && <SimpleAlert title="获取题型失败" message={questionCatesErr.message} />}

      {warnInfo}

      <div className="mb-4">
        <ResizablePanelGroup orientation="horizontal" className="border">
          <ResizablePanel defaultSize="50%">
            <div className="p-4">
              {/* 试卷配置 */}
              <div>
                <PaperMetaConf
                  textbooks={textbooks}
                  paper={paperMeta}
                  defaultSelectedKeys={metaSearch.selectedKeys}
                  updatePaperMeta={updatePaperMeta}
                />
              </div>

              {/* 题目选择 */}
              <div className="mt-4">
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
                          <ChapterTreeCheckboxNav
                            textbooks={questionCates}
                            onSelect={(selectedItems: CheckboxTreeNode[]) => {
                              if (!selectedItems) {
                                updatePaperGenSearch("questionCateIds", []);
                                return;
                              }
                              // tableName: "question_cate" 对应的为题型标识
                              const questionCateIds = selectedItems
                                .filter((item) => item.tableName === StringConst.questionCateTableName)
                                .map((item) => item.id);
                              updatePaperGenSearch("questionCateIds", questionCateIds);
                            }}
                            maxDepth={7}
                          />
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
                          <ShowDifficultyLevelRange levelRange={levelRange} setLevelRange={setLevelRange} />
                        </div>
                      </div>

                      {/* 题型题量 */}
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                        <div className="md:w-24 shrink-0 font-medium">题型题量:</div>
                        <div className="flex-1 min-w-0">
                          <PaperGenConfig paperGenMetaList={typeMetaList} onChange={handleTypeMetaListChange} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="50%">
            <Watermark className="h-full w-full bg-slate-50">
              <div className="p-4">
                <ExamPaperMeta paperMeta={paperPreviewInfo} metaSearch={metaSearch} isPreview={true} />
              </div>
            </Watermark>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
