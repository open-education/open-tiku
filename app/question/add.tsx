import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  FileText,
  Settings2,
  ListChecks,
  Brain,
  Wand2,
  Footprints,
  MessageSquare,
  Trash2,
  Plus,
  BookOpen,
  FileImage,
  NotebookPen,
} from "lucide-react";
import type { Content, CreateQuestionReq, QuestionInfoResp, QuestionOption, QuestionSearch } from "~/type/question";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";
import { Watermark } from "~/common/watermark";
import type { Textbook } from "~/type/textbook";
import { ChapterDropdownNav } from "~/common/nav";
import { MultiTagSelect, TypeSelect } from "~/common/question/tag";
import { StringConst, StringValidator } from "~/util/string";
import { ArrayUtil } from "~/util/object";
import { useQuestionCates, useQuestionTags, useQuestionTypes, useTextbooks } from "~/util/fetcher";
import { SimpleAlert } from "~/common/alert";
import { Loading } from "~/common/load";
import { toast } from "sonner";
import { QuestionInfo } from "~/common/question/info";
import { httpClient } from "~/util/http";
import { createTextbookPathDict } from "~/util/textbook-dict";
import { ImageAdd } from "~/common/image";
import { QuickToolList } from "~/common/tool";
import { FileUpload } from "~/common/file";
import { ParseQuestion } from "~/common/text";
import { useDelayedLoading } from "~/hooks/delayed-loading";

/// 题目添加和编辑

interface AddProps {
  questionSearch: QuestionSearch; // 列表页面搜索携带的信息
  infoResp?: QuestionInfoResp; // 初始化数据信息, 比如修改时会是详情完整信息

  setSheetTitle: (value: string) => void;
  setSheetDesc: (value: string) => void;
  setSheetContent: (value: React.ReactNode) => void;
}

export default function Add({
  questionSearch = {
    twoLevelId: 0,
    fiveLevelId: 0,
    eightId: 0,
    typeId: 0,
    tagIds: [],
    id: 0,
    fiveLevelSelectKeys: [],
    eightLevelSelectKeys: [],
  },
  infoResp = {
    baseInfo: {
      id: 0,
      questionCateId: 0,
      questionTypeId: 0,
      originalName: "",
      title: "",
      contentPlain: "",
      comment: "",
      difficultyLevel: 1.0,
      status: 0,
      createdAt: "",
      updatedAt: "",
    },
    extraInfo: {},
  },
  setSheetTitle,
  setSheetDesc,
  setSheetContent,
}: AddProps) {
  // 初始化数据状态管理
  const initAddDefaultReq = useMemo(() => {
    // infoResp 为详情传递过来的完整信息, 优先级最高
    if (infoResp && infoResp.baseInfo.id > 0) {
      return { ...infoResp.baseInfo, difficultyLevel: Number(infoResp.baseInfo.difficultyLevel), ...infoResp.extraInfo };
    }

    // 初始化部分默认值
    const initAddDefault: CreateQuestionReq = {
      questionCateId: 0,
      questionTypeId: 0,
      originalName: "",
      title: "",
      difficultyLevel: 1.0,
      optionsLayout: 1,
      source: "",
      status: 0,
    };

    // questionSearch 为列表页传递过来的数据, 可能选也可能为空
    if (questionSearch.eightId > 0) {
      initAddDefault.questionCateId = questionSearch.eightId;
    }
    if (questionSearch.typeId > 0) {
      initAddDefault.questionTypeId = questionSearch.typeId;
    }
    if (questionSearch.tagIds.length > 0) {
      initAddDefault.questionTagIds = questionSearch.tagIds;
    }
    if (questionSearch.sourceId && questionSearch.sourceId > 0) {
      // 此时为变式题母题标识id
      initAddDefault.sourceId = questionSearch.sourceId;
    }

    return initAddDefault;
  }, []);
  const [addReq, setAddReq] = useState<CreateQuestionReq>(initAddDefaultReq);
  const updateAddReq = (key: keyof CreateQuestionReq, value: number | number[] | string | string[]) => {
    setAddReq((prev) => ({ ...prev, [key]: value }));
  };

  // 两层导航信息要单独管理
  const [twoLevelId, setTwoLevelId] = useState<number>(questionSearch.twoLevelId);
  const [fiveLevelId, setFiveLevelId] = useState<number>(questionSearch.fiveLevelId);

  // 5层导航信息
  const { data: textbooks = [], isLoading: textbooksLoading, error: textbooksErr } = useTextbooks(5);
  // 将教材字典转化为 Map 格式, 存储 id 对应的所有层
  const pathMap: Map<string, Textbook[]> = createTextbookPathDict(textbooks);

  useEffect(() => {
    // 5层深度时才能添加题目和查看题目列表, 但是题目类型和标签再2层深度上, 因此只要有2层深度就可以把题型类型和标签返回, 后续如果有优化再处理
    // 很明显 fiveLevelId 是选择下拉菜单触发的优先级最高
    const nodes = pathMap.get(fiveLevelId.toString()) ?? [];
    const twoLevelId = nodes.length > 2 ? nodes[1].id : 0;
    setTwoLevelId(twoLevelId);
  }, [fiveLevelId]);

  // 查询题目类型和标签
  const { data: questionTypes = [], isLoading: questionTypesLoading, error: questionTypesErr } = useQuestionTypes(twoLevelId);
  const questionTypeDict = useMemo(() => ArrayUtil.arrayToDict(questionTypes, "id"), [questionTypes]);

  const { data: questionTags = [], isLoading: questionTagsLoading, error: questionTagsErr } = useQuestionTags(twoLevelId);
  const questionTagDict = useMemo(() => ArrayUtil.arrayToDict(questionTags, "id"), [questionTags]);

  // 获取教材/考点题型列表
  const { data: questionCates = [], isLoading: questionCatesLoading, error: questionCatesErr } = useQuestionCates(fiveLevelId);

  // 是否是选择题, 列表页可能携带需要填充默认值
  const [isChoice, setIsChoice] = useState<boolean>(questionTypeDict[addReq.questionTypeId]?.isSelect);

  // 解析工具填充覆盖现有值, 选择性填充
  const replaceAddReq = (fillReq: CreateQuestionReq) => {
    // 如果是选择题需要触发选中
    setIsChoice(questionTypeDict[fillReq.questionTypeId]?.isSelect);

    // 填充的字段如下赋值
    setAddReq((prev) => ({
      ...prev,
      ["title"]: fillReq.title,
      ["options"]: fillReq.options || [],
      ["difficultyLevel"]: Number(fillReq.difficultyLevel),
      ["questionTypeId"]: fillReq.questionTypeId,
      ["questionTagIds"]: fillReq.questionTagIds || [],
      ["knowledge"]: fillReq.knowledge || "",
      ["answer"]: fillReq.answer || "",
      ["analysis"]: fillReq.analysis || {
        content: "",
        images: [],
      },
      ["process"]: fillReq.process || {
        content: "",
        images: [],
      },
    }));
  };

  // 按钮提交状态
  const [drafing, setDrafing] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [addWarnInfo, setAddWarnInfo] = useState<React.ReactNode>("");

  // 更新解题分析和解题过程
  const updateContent = (field: "analysis" | "process", key: keyof Content, value: string | string[]) => {
    setAddReq((prev) => ({
      ...prev,
      [field]: {
        ...((prev[field] as Content) || {}),
        [key]: value,
      },
    }));
  };

  // 添加选项
  const addOption = () => {
    const current = addReq.options || [];
    const newLabel = String.fromCharCode(65 + current.length);
    setAddReq((prev) => ({
      ...prev,
      options: [...current, { label: newLabel, content: "", images: [], order: current.length }],
    }));
  };

  // 移除选项
  const removeOption = (index: number) => {
    setAddReq((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || [],
    }));
  };

  // 更新选项
  const updateOption = (index: number, field: keyof QuestionOption, value: string | string[] | number) => {
    setAddReq((prev) => {
      const newOptions = [...(prev.options || [])];
      newOptions[index] = { ...newOptions[index], [field]: value };
      return { ...prev, options: newOptions };
    });
  };

  // 步骤逻辑
  const addStep = () => {
    const current = addReq.steps || [];
    setAddReq((prev) => ({
      ...prev,
      steps: [...current, { id: current.length + 1, content: "" }],
    }));
  };
  const removeStep = (index: number) => {
    setAddReq((prev) => ({
      ...prev,
      steps: prev.steps?.filter((_, i) => i !== index) || [],
    }));
  };
  const updateStep = (index: number, content: string) => {
    setAddReq((prev) => {
      const newSteps = [...(prev.steps || [])];
      newSteps[index] = { ...newSteps[index], content };
      return { ...prev, steps: newSteps };
    });
  };

  // 图片增删简写
  const addImageToField = (field: "images" | "analysis.images" | "process.images", url: string) => {
    if (field === "images") setAddReq((p) => ({ ...p, images: [...(p.images || []), url] }));
    else if (field === "analysis.images") {
      const current = (addReq.analysis?.images as string[]) || [];
      updateContent("analysis", "images", [...current, url]);
    } else {
      const current = (addReq.process?.images as string[]) || [];
      updateContent("process", "images", [...current, url]);
    }
  };
  const removeImageFromField = (field: "images" | "analysis.images" | "process.images", index: number) => {
    if (field === "images") setAddReq((p) => ({ ...p, images: p.images?.filter((_, i) => i !== index) || [] }));
    else if (field === "analysis.images") {
      const current = (addReq.analysis?.images as string[]) || [];
      updateContent(
        "analysis",
        "images",
        current.filter((_, i) => i !== index),
      );
    } else {
      const current = (addReq.process?.images as string[]) || [];
      updateContent(
        "process",
        "images",
        current.filter((_, i) => i !== index),
      );
    }
  };

  // 提交
  const handleAddSubmit = (status: number) => {
    // 检查必填参数是否为空
    if (addReq.questionCateId <= 0) {
      toast.error(<div className="text-red-700">题型不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (addReq.questionTypeId <= 0) {
      toast.error(<div className="text-red-700">类型不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (addReq.difficultyLevel <= 0) {
      toast.error(<div className="text-red-700">难度系数不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringValidator.isNonEmpty(addReq.title)) {
      toast.error(<div className="text-red-700">题目标题不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (isChoice && (!addReq.options || addReq.options.length < 2)) {
      toast.error(<div className="text-red-700">选择题至少需要两个选项</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }

    if (!confirm(addReq.id && addReq.id > 0 ? "确定要更新题目吗？" : "确定要新增题目吗？")) {
      return;
    }

    setAddWarnInfo("");
    setIsLoading(true);

    if (status == 0) {
      setDrafing(true);
      addReq.status = 0;
    } else {
      setApproving(true);
      addReq.status = 1;
    }

    // 添加题目成功并预览详情, 未提交的题目只能在 我的题目 中可见
    httpClient
      .post<number>("/question/add", addReq)
      .then((addId) => {
        httpClient
          .get(`/question/info/${addId}`)
          .then((res) => {
            setSheetTitle("题目详情");
            setSheetDesc("当前仅是预览状态, 需管理员审核通过后题目方可被搜索展示");
            setSheetContent(
              <QuestionInfo pageSource={{ source: "list" }} questionTypeDict={questionTypeDict} questionTagDict={questionTagDict} infoResp={res} />,
            );
          })
          .catch((err) => {
            setAddWarnInfo(<SimpleAlert title="查询题目详情失败" message={err.message} />);
          });
      })
      .catch((err) => {
        setAddWarnInfo(<SimpleAlert title="添加题目失败" message={err.message} />);
      })
      .finally(() => {
        setDrafing(false);
        setApproving(false);
        setIsLoading(false);
      });
  };

  return (
    <div className="text-sm pl-4 pr-4 pb-4">
      <div>
        <div>1. 图片标识请使用右上角的 快捷工具-上传文件 上传图片后获得</div>
        <div>2. 符合 上传题目 模板的题目可以粘贴到 快捷工具-解析题目 进行解析后点击 填充 会自动填充至左边表单中</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="default" className="text-sm" onClick={() => handleAddSubmit(0)} disabled={drafing}>
          {drafing ? "存为草稿中..." : "存为草稿"}
        </Button>
        <Button variant="outline" className="text-sm" onClick={() => handleAddSubmit(1)} disabled={approving}>
          {approving ? "提交审核中..." : "提交审核"}
        </Button>
      </div>

      {/* 警告信息 */}
      {addWarnInfo}

      {/* 加载中信息 */}
      {useDelayedLoading(isLoading || textbooksLoading || questionTypesLoading || questionTagsLoading || questionCatesLoading) && <Loading />}
      {/* 相关错误信息 */}

      {textbooksErr && (
        <div className="mt-3">
          <SimpleAlert title="学段/年级列表获取失败" message={textbooksErr.message} />
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
          <SimpleAlert title="题型类型获取失败" message={questionCatesErr.message} />
        </div>
      )}

      <div className="mt-3 mb-3">
        <Separator />
      </div>

      <div>
        <QuickToolList
          tools={[
            {
              id: "tool-file-upload",
              label: (
                <div className="flex items-center gap-2">
                  <FileImage className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">上传文件</span>
                </div>
              ),
              content: <FileUpload isImage={true} />,
            },
            {
              id: "tool-text-parse",
              label: (
                <div className="flex items-center gap-2">
                  <NotebookPen className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">解析题目</span>
                </div>
              ),
              content: <ParseQuestion typeList={questionTypes} tagList={questionTags} onFill={(req) => replaceAddReq(req)} />,
            },
          ]}
          defaultToolId="tool-file-upload"
        />
      </div>

      <div>
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize="50%">
            {/* ========== 区块 1：基础信息 ========== */}
            <Card className="ml-3 mr-3 mt-1 shadow-sm hover:shadow-md transition-shadow duration-200 border-border/40">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base font-medium">基础设置</CardTitle>
                </div>
                <CardDescription className="text-sm">配置题目所属题型, 题目类型, 标签, 原创者名称, 来源和难度系数</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent>
                <div className="text-base flex flex-col gap-3">
                  {/* 选择前5层级 */}
                  <div className="grid grid-cols-10 gap-1 items-center">
                    <div className="col-span-2">
                      章节/考点:<span className="text-destructive">*</span>
                    </div>
                    <div className="col-span-8">
                      <ChapterDropdownNav
                        textbooks={textbooks}
                        onSelect={(selectedItems: Textbook[]) => {
                          if (!selectedItems) {
                            setFiveLevelId(0);
                            return;
                          }

                          const current: Textbook = selectedItems[selectedItems.length - 1];
                          setFiveLevelId(current.id);
                        }}
                        defaultSelectedKeys={questionSearch.fiveLevelSelectKeys || []}
                        placeholder="请选择学段/考点"
                      />
                    </div>
                  </div>

                  {/* 根据前5层级选择后3层级 */}
                  <div className="grid grid-cols-10 gap-4 items-center">
                    <div className="col-span-2">
                      题型:<span className="text-destructive">*</span>
                    </div>
                    <div className="col-span-8">
                      <ChapterDropdownNav
                        textbooks={questionCates}
                        onSelect={(selectedItems: Textbook[]) => {
                          if (!selectedItems) {
                            updateAddReq("questionCateId", 0);
                            return;
                          }

                          const current: Textbook = selectedItems[selectedItems.length - 1];
                          updateAddReq("questionCateId", current.id);
                        }}
                        defaultSelectedKeys={questionSearch.eightLevelSelectKeys || []}
                        placeholder="请选择题型"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-10 gap-4 items-center">
                    <div className="col-span-2">
                      类型:<span className="text-destructive">*</span>
                    </div>
                    <div className="col-span-8">
                      <TypeSelect
                        options={questionTypes}
                        value={addReq.questionTypeId}
                        onSelect={(val) => {
                          updateAddReq("questionTypeId", val);
                          setIsChoice(questionTypeDict[val]?.isSelect);
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-10 gap-4 items-center">
                    <div className="col-span-2">标签:</div>
                    <div className="col-span-8">
                      <MultiTagSelect
                        options={questionTags}
                        value={addReq.questionTagIds ?? []}
                        onChange={(val) => updateAddReq("questionTagIds", val)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-10 gap-4 items-center">
                    <div className="col-span-2">原创者:</div>
                    <div className="col-span-8">
                      <Input
                        id="originalName"
                        className="text-sm md:text-sm"
                        value={addReq.originalName}
                        onChange={(e) => updateAddReq("originalName", e.target.value)}
                        placeholder="请输入原创者代号, 不要填写真实信息, 保护他人隐私"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-10 gap-4 items-center">
                    <div className="col-span-2">来源:</div>
                    <div className="col-span-8">
                      <Input
                        id="source"
                        className="text-sm md:text-sm"
                        value={addReq.source}
                        onChange={(e) => updateAddReq("source", e.target.value)}
                        placeholder="请输入题目来源, 标注版权信息"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-10 gap-4 items-center">
                    <div className="col-span-2">
                      难度:<span className="text-destructive">*</span>
                    </div>
                    <div className="col-span-8">
                      <div className="flex flex-wrap gap-4">
                        {StringConst.difficultyLevelList.map(({ value: optionValue, label }) => (
                          <Button
                            key={optionValue}
                            className="text-sm md:text-sm w-10 text-center"
                            type="button"
                            variant={addReq.difficultyLevel === optionValue ? "default" : "outline"}
                            onClick={() => updateAddReq("difficultyLevel", optionValue)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ========== 区块 2：题干 ========== */}
            <Card className="ml-3 mr-3 mt-3 shadow-sm hover:shadow-md transition-shadow duration-200 border-border/40">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base font-medium">题干</CardTitle>
                </div>
                <CardDescription className="text-sm">题目正文, 补充说明与相关图片</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm">
                    题干内容 <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="title"
                    className="min-h-25 resize-y text-sm md:text-sm"
                    value={addReq.title || ""}
                    onChange={(e) => updateAddReq("title", e.target.value)}
                    placeholder="输入题目正文..."
                  />
                </div>
                <div className="space-y-2 mt-3">
                  <Label htmlFor="comment" className="text-sm">
                    补充说明
                  </Label>
                  <Textarea
                    id="comment"
                    className="min-h-15 resize-y text-sm md:text-sm"
                    value={addReq.comment || ""}
                    onChange={(e) => updateAddReq("comment", e.target.value)}
                    placeholder="例如：题目背景、特殊约束等"
                  />
                </div>

                {/* 图片列表 */}
                <ImageAdd
                  name="题干图片"
                  images={addReq.images || []}
                  add={() => {
                    addImageToField("images", "");
                  }}
                  update={(idx, val) => {
                    const newImages = [...(addReq.images || [])];
                    newImages[idx] = val;
                    updateAddReq("images", newImages);
                  }}
                  remove={(idx) => {
                    removeImageFromField("images", idx);
                  }}
                />
              </CardContent>
            </Card>

            {/* ========== 区块 3：选项 (条件渲染) ========== */}
            {isChoice && (
              <Card className="ml-3 mr-3 mt-3 shadow-sm hover:shadow-md transition-shadow duration-200 border-border/40">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base font-medium">选项设置</CardTitle>
                    <Badge variant="secondary" className="font-normal text-sm">
                      选择题
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">配置选项内容和布局</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent>
                  {/* 布局切换 */}
                  <div className="flex items-center gap-6 bg-muted/30 rounded-lg p-2 px-4 w-fit">
                    <span className="text-sm">选项布局</span>
                    <RadioGroup
                      value={addReq.optionsLayout}
                      onValueChange={(val) => updateAddReq("optionsLayout", val)}
                      defaultValue={addReq.optionsLayout || 1}
                      className="flex gap-4 w-fit"
                    >
                      {StringConst.selectLayoutList.map(({ id, value, label }) => (
                        <div key={id} className="flex items-center gap-2">
                          <RadioGroupItem value={value} id={id} className="text-sm" />
                          <Label htmlFor={id} className="text-sm">
                            {label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* 选项列表 */}
                  <div className="space-y-4">
                    {(addReq.options || []).map((opt, optIdx) => (
                      <div key={optIdx} className="bg-muted/10 border rounded-xl p-5 space-y-3 relative transition-all hover:border-primary/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                              {opt.label}
                            </div>
                            <span className="text-sm text-muted-foreground">选项 {optIdx + 1}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-sm md:text-sm text-destructive hover:text-destructive h-8 px-2"
                            onClick={() => removeOption(optIdx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <Textarea
                          value={opt.content}
                          onChange={(e) => updateOption(optIdx, "content", e.target.value)}
                          placeholder="输入选项内容"
                          className="text-sm md:text-sm min-h-15 bg-background/60"
                        />

                        {/* 选项内图片 */}
                        <ImageAdd
                          name="选项图片"
                          images={opt.images || []}
                          add={() => {
                            updateOption(optIdx, "images", [...(opt.images || []), ""]);
                          }}
                          update={(idx, val) => {
                            const newImages = [...(opt.images || [])];
                            newImages[idx] = val;
                            updateOption(optIdx, "images", newImages);
                          }}
                          remove={(idx) => {
                            const newImages = (opt.images || []).filter((_, i) => i !== idx);
                            updateOption(optIdx, "images", newImages);
                          }}
                        />
                      </div>
                    ))}
                    <Button type="button" variant="outline" className="text-sm md:text-sm w-full border-dashed h-11 gap-2" onClick={addOption}>
                      <Plus className="w-4 h-4" /> 添加选项
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ========== 区块 4：答案与知识点 ========== */}
            <Card className="ml-3 mr-3 mt-3 shadow-sm hover:shadow-md transition-shadow duration-200 border-border/40">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base font-medium">答案与知识点</CardTitle>
                </div>
              </CardHeader>
              <Separator />
              <CardContent>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="answer" className="text-sm">
                    参考答案
                  </Label>
                  <Textarea
                    id="answer"
                    className="min-h-17.5 text-sm md:text-sm"
                    value={addReq.answer || ""}
                    onChange={(e) => updateAddReq("answer", e.target.value)}
                    placeholder="输入参考答案"
                  />
                </div>

                <div className="mt-3 space-y-2 md:col-span-2">
                  <Label htmlFor="knowledge" className="text-sm">
                    涉及知识点
                  </Label>
                  <Textarea
                    id="knowledge"
                    className="min-h-17.5 text-sm md:text-sm"
                    value={addReq.knowledge || ""}
                    onChange={(e) => updateAddReq("knowledge", e.target.value)}
                    placeholder="输入知识点，多个可用逗号分隔"
                  />
                </div>
              </CardContent>
            </Card>

            {/* ========== 区块 5：解题分析 ========== */}
            <Card className="ml-3 mr-3 mt-3 shadow-sm hover:shadow-md transition-shadow duration-200 border-border/40">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base font-medium">解题分析</CardTitle>
                </div>
              </CardHeader>
              <Separator />
              <CardContent>
                <Textarea
                  value={addReq.analysis?.content || ""}
                  onChange={(e) => updateContent("analysis", "content", e.target.value)}
                  placeholder="详细的解题分析..."
                  className="min-h-20 text-sm md:text-sm"
                />

                <ImageAdd
                  name="分析图片"
                  images={addReq.analysis?.images || []}
                  add={() => {
                    addImageToField("analysis.images", "");
                  }}
                  update={(idx, val) => {
                    const current = (addReq.analysis?.images as string[]) || [];
                    const newImages = [...current];
                    newImages[idx] = val;
                    updateContent("analysis", "images", newImages);
                  }}
                  remove={(idx) => {
                    removeImageFromField("analysis.images", idx);
                  }}
                />
              </CardContent>
            </Card>

            {/* ========== 区块 6：解题过程 ========== */}
            <Card className="ml-3 mr-3 mt-3 shadow-sm hover:shadow-md transition-shadow duration-200 border-border/40">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base font-medium">解题过程</CardTitle>
                </div>
              </CardHeader>
              <Separator />
              <CardContent>
                <Textarea
                  value={addReq.process?.content || ""}
                  onChange={(e) => updateContent("process", "content", e.target.value)}
                  placeholder="详细的解题步骤过程..."
                  className="min-h-20 text-sm md:text-sm"
                />

                <ImageAdd
                  name="过程图片"
                  images={addReq.process?.images || []}
                  add={() => {
                    addImageToField("process.images", "");
                  }}
                  update={(idx, val) => {
                    const current = (addReq.process?.images as string[]) || [];
                    const newImages = [...current];
                    newImages[idx] = val;
                    updateContent("process", "images", newImages);
                  }}
                  remove={(idx) => {
                    removeImageFromField("process.images", idx);
                  }}
                />
              </CardContent>
            </Card>

            {/* ========== 区块 7：步骤提示 ========== */}
            <Card className="ml-3 mr-3 mt-3 shadow-sm hover:shadow-md transition-shadow duration-200 border-border/40">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Footprints className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base font-medium">解题步骤提示</CardTitle>
                </div>
                <CardDescription className="text-sm">分步骤引导学生思考</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent>
                {(addReq.steps || []).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-muted/10 rounded-lg p-4 border border-border/40">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0 mt-1">{step.id}</div>
                    <Textarea
                      value={step.content}
                      onChange={(e) => updateStep(idx, e.target.value)}
                      placeholder={`输入第 ${step.id} 步提示内容`}
                      className="min-h-12.5 bg-background/60 flex-1 text-sm md:text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive shrink-0 mt-1 text-sm md:text-sm"
                      onClick={() => removeStep(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" className="w-full border-dashed h-11 gap-2 text-sm" onClick={addStep}>
                  <Plus className="w-4 h-4" /> 添加步骤
                </Button>
              </CardContent>
            </Card>

            {/* ========== 区块 8：备注 ========== */}
            <Card className="m-3 shadow-sm hover:shadow-md transition-shadow duration-200 border-border/40">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base font-medium">易错备注</CardTitle>
                </div>
              </CardHeader>
              <Separator />
              <CardContent>
                <Textarea
                  value={addReq.remark || ""}
                  onChange={(e) => updateAddReq("remark", e.target.value)}
                  placeholder="例如：易错题型、解题技巧提醒等"
                  className="min-h-17.5 text-sm md:text-sm"
                />
              </CardContent>
            </Card>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="50%">
            <Watermark className="h-full w-full border bg-slate-50">
              <div className="pt-3">
                <QuestionInfo
                  pageSource={{ source: "list" }}
                  questionTypeDict={questionTypeDict}
                  questionTagDict={questionTagDict}
                  infoResp={{
                    baseInfo: {
                      id: 0,
                      contentPlain: "",
                      createdAt: "",
                      updatedAt: "",
                      ...addReq,
                    },
                    extraInfo: { ...addReq },
                  }}
                />
              </div>
            </Watermark>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
