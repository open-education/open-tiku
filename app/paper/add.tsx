import React, { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";
import { Separator } from "~/components/ui/separator";
import { StringConst, StringValidator } from "~/util/string";
import { Watermark } from "~/common/watermark";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import type { PaperTopGroup, PaperTopMeta, PaperTopMetaSearch, PaperTopQuestion } from "~/type/paper";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { FileImage, Plus, Send, Trash2, X } from "lucide-react";
import { Label } from "~/components/ui/label";
import type { Content, QuestionOption } from "~/type/question";
import { ExamPaperMeta } from "~/common/paper/meta";
import { httpClient } from "~/util/http";
import { toast } from "sonner";
import { SimpleAlert } from "~/common/alert";
import { ImageAdd } from "~/common/image";
import { useTextbooks } from "~/util/fetcher";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { FileUpload } from "~/common/file";
import { QuickToolList } from "~/common/tool";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import { Loading } from "~/common/load";
import { PaperMetaConf } from "~/common/paper/config";

/// 添加试卷, 因为修改的内容比较集中, 故添加修改使用同一个页面和逻辑
/// 直接上传图片解析为试卷的方式因为要接入 ai api 要走付费模式, 即使相对便宜
/// 但是个人使用比如 DeepSeek 几乎是完全免费的, 因此需要个人借助其它 ai 平台将试卷题目转化为 markdown 格式后拷贝过来上传

// 初始化默认值等信息
const generateId = () => Math.random().toString(36).substring(2, 9);
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

const defaultQuestionInfo = (order: number): PaperTopQuestion => ({
  genId: generateId(),
  orderNum: order,
  stem: "",
  analysis: {
    content: "",
  },
  score: 0,
  id: 0,
  groupId: 0,
  paperId: 0,
  answer: "",
});

const defaultGroup = (): PaperTopGroup => ({
  genId: generateId(),
  typeName: "",
  subTitle: "",
  questions: [],
  id: 0,
  paperId: 0,
});

interface TopAddProps {
  metaSearch: PaperTopMetaSearch;
  infoResp?: PaperTopMeta; // 如果是详情页面过来的则处于编译状态

  // 以下为 Sheet 操作方法和属性
  setSheetTitle?: (value: string) => void;
  setSheetDesc?: (value: string) => void;
  setSheetContent?: (value: React.ReactNode) => void;
}

export default function TopAdd({ metaSearch, infoResp, setSheetTitle, setSheetDesc, setSheetContent }: TopAddProps) {
  // 计算初始值, 编辑时也是更新这个初始化值
  const initialPaperMeta = useMemo(() => {
    // 如果是详情进来的则仅使用详情的数据
    if (infoResp && infoResp.id != null && infoResp.id > 0) {
      return { ...infoResp };
    }

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

  const [addWarnInfo, setAddWarnInfo] = useState<React.ReactNode>("");

  // 获取前5层导航信息
  const { data: textbooks = [], isLoading: textbooksIdLoading, error: textbooksErr } = useTextbooks(5);

  // ---- 大题操作 ----
  // 追加一个默认题型默认值
  const addGroup = () => {
    setPaper((prev) => ({
      ...prev,
      groups: [...prev.groups, defaultGroup()],
    }));
  };

  // 删除一个大题
  const removeGroup = (groupGenId: string) => {
    setPaper((prev) => ({
      ...prev,
      groups: prev.groups.filter((g) => g.genId !== groupGenId),
    }));
  };

  // 更新一个大题
  const updateGroup = (groupGenId: string, key: keyof PaperTopGroup, value: string) => {
    setPaper((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => (g.genId === groupGenId ? { ...g, [key]: value } : g)),
    }));
  };

  // ---- 小题操作 ----
  const addQuestion = (groupGenId: string) => {
    setPaper((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.genId !== groupGenId) return g;
        const nextOrder = g.questions.length + 1;
        return {
          ...g,
          questions: [...g.questions, defaultQuestionInfo(nextOrder)],
        };
      }),
    }));
  };

  const removeQuestion = (groupGenId: string, questionId: string) => {
    setPaper((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.genId !== groupGenId) return g;
        const filtered = g.questions.filter((q) => q.genId !== questionId);
        const reordered = filtered.map((q, idx) => ({ ...q, order: idx + 1 }));
        return { ...g, questions: reordered };
      }),
    }));
  };

  const updateQuestion = (groupGenId: string, questionId: string, key: keyof PaperTopQuestion, value: string | string[] | number | Content) => {
    setPaper((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.genId !== groupGenId) return g;
        return {
          ...g,
          questions: g.questions.map((q) => (q.genId === questionId ? { ...q, [key]: value } : q)),
        };
      }),
    }));
  };

  // ---- 选项操作 ----
  const addOption = (groupGenId: string, questionId: string) => {
    setPaper((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.genId !== groupGenId) return g;
        return {
          ...g,
          questions: g.questions.map((q) => {
            if (q.genId !== questionId) return q;
            const newLabel = String.fromCharCode(65 + (q.options?.length || 0));
            const newOption: QuestionOption = {
              label: newLabel,
              content: "",
              order: q.options?.length || 0, // 通常 order 从 0 开始，你也可以用 q.options.length
            };
            return {
              ...q,
              options: [...(q.options || []), newOption],
            };
          }),
        };
      }),
    }));
  };

  const updateOption = (groupGenId: string, questionId: string, index: number, value: QuestionOption) => {
    setPaper((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.genId !== groupGenId) return g;
        return {
          ...g,
          questions: g.questions.map((q) => {
            if (q.genId !== questionId) return q;
            const newOptions = [...(q.options || [])];
            newOptions[index] = value;
            return { ...q, options: newOptions };
          }),
        };
      }),
    }));
  };

  // 移除选项时需要刷新选项的标签和排序等信息
  // 也不是现在的做法比如 A B C D 我突然移除 B 结果变为 A B C 实际上应该删除移除之后的所有选项
  // 因为试卷的选项内容是固定的
  const removeOption = (groupGenId: string, questionId: string, index: number) => {
    setPaper((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.genId !== groupGenId) return g;
        return {
          ...g,
          questions: g.questions.map((q) => {
            if (q.genId !== questionId) return q;

            // 删除当前索引及其后面的所有选项
            const newOptions = (q.options || []).slice(0, index);

            return { ...q, options: newOptions };
          }),
        };
      }),
    }));
  };

  // 按钮提交状态
  const [drafing, setDrafing] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);

  // 提交试卷
  const handleAddPaper = (status: number) => {
    // 检查必填参数是否为空
    if (paper.relatedId <= 0) {
      toast.error(<div className="text-red-700">学段/考点不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringValidator.isNonEmpty(paper.tag)) {
      toast.error(<div className="text-red-700">标签不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringValidator.isNonEmpty(paper.year)) {
      toast.error(<div className="text-red-700">年份不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }

    if (!confirm(paper.id && paper.id > 0 ? "确定要更新试卷吗？" : "确定要新增试卷吗？")) {
      return;
    }

    // 每次提交都清空题型信息, 等接口决定是否再次显示
    setAddWarnInfo("");

    if (status === 0) {
      setDrafing(true);
      paper.status = 0;
    } else {
      setApproving(true);
      paper.status = 1;
    }

    httpClient
      .post<number>("/paper/add", paper)
      .then((resId) => {
        // 获取详情渲染Sheet为试卷详情
        httpClient
          .get<PaperTopMeta>(`/paper/info/${resId}`)
          .then((res) => {
            setSheetTitle?.("试卷详情");
            setSheetDesc?.("仅为详情预览, 需审核通过后其他人可见, 可去 我的试卷 查看");
            setSheetContent?.(<ExamPaperMeta paperMeta={res} />);
          })
          .catch((err) => {
            setAddWarnInfo(<SimpleAlert title="获取试卷详情失败" message={err.message} />);
          });
      })
      .catch((err) => {
        setAddWarnInfo(<SimpleAlert title="添加试卷失败" message={err.message} />);
      })
      .finally(() => {
        // 不管成功失败最终都要清除按钮控制
        setDrafing(false);
        setApproving(false);
      });
  };

  return (
    <div className="text-base pl-4 pr-4 pb-4">
      <div className="text-sm">
        <div>1. 图片标识请使用右上角的 快捷工具-上传文件 上传图片后获得</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="default" className="text-sm" onClick={() => handleAddPaper(0)} disabled={drafing}>
          <Send className="mr-2 h-4 w-4" />
          {drafing ? "存为草稿中..." : "存为草稿"}
        </Button>
        <Button variant="outline" className="text-sm" onClick={() => handleAddPaper(1)} disabled={approving}>
          <Send className="mr-2 h-4 w-4" />
          {approving ? "提交审核中..." : "提交审核"}
        </Button>
      </div>

      {addWarnInfo}

      <Separator className="mt-3 mb-3" />

      {textbooksErr && <SimpleAlert title="获取导航失败" message={textbooksErr.message} />}

      {useDelayedLoading(textbooksIdLoading) && <Loading />}

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
          ]}
          defaultToolId="tool-file-upload"
        />
      </div>

      <div className="mb-6">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize="50%">
            <div className="px-4">
              <PaperMetaConf textbooks={textbooks} paper={paper} defaultSelectedKeys={metaSearch.selectedKeys} updatePaperMeta={updatePaperMeta} />

              {/* ===== 大题列表 ===== */}
              <div className="space-y-4 mt-3">
                {paper.groups.map((group, idx) => (
                  <GroupCard
                    key={group.genId}
                    group={group}
                    index={idx}
                    onUpdateGroup={(key, value) => updateGroup(group.genId, key, value)}
                    onRemoveGroup={() => removeGroup(group.genId)}
                    onAddQuestion={() => addQuestion(group.genId)}
                    onRemoveQuestion={(qId) => removeQuestion(group.genId, qId)}
                    onUpdateQuestion={(qId, key, value) => updateQuestion(group.genId, qId, key, value)}
                    onAddOption={(qId) => addOption(group.genId, qId)}
                    onUpdateOption={(qId, idx, value) => updateOption(group.genId, qId, idx, value)}
                    onRemoveOption={(qId, idx) => removeOption(group.genId, qId, idx)}
                  />
                ))}

                <Button variant="outline" className="text-sm md:text-sm" onClick={addGroup}>
                  <Plus className="mr-1 h-4 w-4" />
                  添加大题
                </Button>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="50%">
            <Watermark className="h-full w-full border bg-slate-50">
              <div className="p-4">
                <ExamPaperMeta paperMeta={paper} metaSearch={metaSearch} isPreview={true} />
              </div>
            </Watermark>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

// ============ 大题卡片 ============

interface GroupCardProps {
  group: PaperTopGroup;
  index: number;
  onUpdateGroup: (key: keyof PaperTopGroup, value: string) => void;
  onRemoveGroup: () => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (questionId: string) => void;
  onUpdateQuestion: (questionId: string, key: keyof PaperTopQuestion, value: string | string[] | number | Content) => void;
  onAddOption: (questionId: string) => void;
  onUpdateOption: (questionId: string, index: number, value: QuestionOption) => void;
  onRemoveOption: (questionId: string, index: number) => void;
}

function GroupCard({
  group,
  index,
  onUpdateGroup,
  onRemoveGroup,
  onAddQuestion,
  onRemoveQuestion,
  onUpdateQuestion,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}: GroupCardProps) {
  return (
    <Card className="border border-primary/10">
      <CardHeader className="bg-muted/20">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-primary min-w-4">{StringConst.groupNumberMap[index] || index + 1}</span>
          <Input
            value={group.typeName}
            onChange={(e) => onUpdateGroup("typeName", e.target.value)}
            placeholder="题型名称，如：选择题、填空题、解答题..."
            className="w-48 text-sm md:text-sm"
          />
          <Input
            value={group.subTitle}
            onChange={(e) => onUpdateGroup("subTitle", e.target.value)}
            placeholder="题型描述, 如: 本题共8小题, 每小题5分"
            className="flex-1 min-w-50 text-sm md:text-sm"
          />
          <Button variant="destructive" size="sm" onClick={onRemoveGroup}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {group.questions.map((q) => (
          <QuestionItem
            key={q.genId}
            question={q}
            onRemove={() => onRemoveQuestion(q.genId)}
            onUpdate={(key, value) => onUpdateQuestion(q.genId, key, value)}
            onAddOption={() => onAddOption(q.genId)}
            onUpdateOption={(idx, value) => onUpdateOption(q.genId, idx, value)}
            onRemoveOption={(idx) => onRemoveOption(q.genId, idx)}
          />
        ))}
        <Button variant="outline" className="text-sm md:text-sm" onClick={onAddQuestion}>
          <Plus className="mr-1 h-4 w-4" />
          添加小题
        </Button>
      </CardContent>
    </Card>
  );
}

// ============ 小题组件 ============

interface QuestionItemProps {
  question: PaperTopQuestion;
  onRemove: () => void;
  onUpdate: (key: keyof PaperTopQuestion, value: string | string[] | number | Content) => void;
  onAddOption: () => void;
  onUpdateOption: (index: number, value: QuestionOption) => void;
  onRemoveOption: (index: number) => void;
}

function QuestionItem({ question, onRemove, onUpdate, onAddOption, onUpdateOption, onRemoveOption }: QuestionItemProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white">
      {/* 题号 + 删除 */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{question.orderNum}. 小题</span>
        <Button variant="ghost" onClick={onRemove} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 题干部分 */}

      <div className="space-y-1">
        <Label className="text-sm">题干</Label>
        <Textarea
          value={question.stem}
          onChange={(e) => onUpdate("stem", e.target.value)}
          placeholder="从 Markdown 中复制题干粘贴到这里..."
          className="min-h-15 text-sm md:text-sm"
        />
      </div>

      {/* 图片列表 */}
      <ImageAdd
        name="题干图片"
        images={question.images || []}
        add={() => {
          // 添加图片即是在图片后面追加一个空地址
          onUpdate("images", [...(question.images || []), ""]);
        }}
        update={(idx, val) => {
          const newImages = [...(question.images || [])];
          newImages[idx] = val;
          onUpdate("images", newImages);
        }}
        remove={(idx) => {
          // 移除下标对应的图片标识
          const newImages = [...(question.images || [])];
          const filtered = newImages.filter((_, index) => index !== idx);
          onUpdate("images", filtered);
        }}
      />

      {/* 选项 - 默认不显示，用户点击添加才出现 */}
      {(question.options || []).length > 0 && (
        <div className="space-y-1">
          {/* 布局切换 */}
          <div className="flex items-center gap-6 bg-muted/30 rounded-lg p-2 px-4 w-fit">
            <span className="text-sm">选项布局</span>
            <RadioGroup
              value={question.optionsLayout ?? 1}
              onValueChange={(val) => onUpdate("optionsLayout", Number(val))}
              className="flex gap-4 w-fit"
            >
              {StringConst.selectLayoutList.map(({ id, value, label }) => (
                <div key={id} className="flex items-center gap-2">
                  <RadioGroupItem value={value} id={id} />
                  <Label htmlFor={id} className="text-sm">
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* 选项列表 */}
          <div className="space-y-4">
            {(question.options || []).map((opt, optIdx) => (
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
                    className="text-sm text-destructive hover:text-destructive h-8 px-2"
                    onClick={() => {
                      onRemoveOption(optIdx);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Textarea
                  value={opt.content}
                  onChange={(e) => {
                    onUpdateOption(optIdx, { ...opt, content: e.target.value });
                  }}
                  placeholder="输入选项内容"
                  className="min-h-15 bg-background/60 text-sm md:text-sm"
                />
                {/* 选项内图片 */}
                <ImageAdd
                  name="选项图片"
                  images={opt.images || []}
                  add={() => {
                    // 原来图片的基础上追加一个空字符串代表图片
                    onUpdateOption(optIdx, {
                      ...opt,
                      images: [...(opt.images || []), ""],
                    });
                  }}
                  update={(idx, val) => {
                    // 原来图片的基础上添加当前图片值
                    const newImages = [...(opt.images || [])];
                    newImages[idx] = val;
                    onUpdateOption(optIdx, { ...opt, images: newImages });
                  }}
                  remove={(idx) => {
                    // 移除现有图片中当前索引的图片
                    onUpdateOption(optIdx, {
                      ...opt,
                      images: (opt.images || []).filter((_, i) => i !== idx),
                    });
                  }}
                />
              </div>
            ))}
            <Button type="button" variant="outline" className="w-full border-dashed h-11 gap-2 text-sm md:text-sm" onClick={onAddOption}>
              <Plus className="w-4 h-4" /> 添加选项
            </Button>
          </div>
        </div>
      )}

      {/* 添加选项按钮 - 仅在无选项时显示 */}
      {(question.options || []).length === 0 && (
        <Button variant="outline" className="text-sm md:text-sm" onClick={onAddOption}>
          <Plus className="mr-1 h-3 w-3" />
          添加选项(选择题/多选题)
        </Button>
      )}

      {/* 答案 + 分值 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-sm">答案</Label>
          <Textarea
            value={question.answer}
            onChange={(e) => {
              onUpdate("answer", e.target.value);
            }}
            placeholder="如: A 或 ABD 或 2 或 略"
            className="min-h-12.5 text-sm md:text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-sm">分值</Label>
          <Input
            type="number"
            className="text-sm md:text-sm"
            value={question.score}
            onChange={(e) => onUpdate("score", Number(e.target.value))}
            placeholder="5"
          />
        </div>
      </div>

      {/* 解析 */}
      <div className="space-y-1">
        <Label className="text-sm">解析</Label>
        <Textarea
          value={question.analysis.content}
          onChange={(e) => {
            onUpdate("analysis", { ...question.analysis, content: e.target.value });
          }}
          placeholder="从 Markdown 中复制解析内容粘贴到这里..."
          className="min-h-12.5 text-sm md:text-sm"
        />

        {/* 解析图片 */}
        <ImageAdd
          name="解析图片"
          images={question.analysis.images || []}
          add={() => {
            // 原来图片的基础上追加一个空字符串代表图片
            onUpdate("analysis", {
              ...question.analysis,
              images: [...(question.analysis.images || []), ""],
            });
          }}
          update={(idx, val) => {
            // 原来图片的基础上添加当前图片值
            const newImages = [...(question.analysis.images || [])];
            newImages[idx] = val;
            onUpdate("analysis", { ...question.analysis, images: newImages });
          }}
          remove={(idx) => {
            // 移除现有图片中当前索引的图片
            onUpdate("analysis", {
              ...question.analysis,
              images: (question.analysis.images || []).filter((_, i) => i !== idx),
            });
          }}
        />
      </div>
    </div>
  );
}
