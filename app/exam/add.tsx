/// 添加试卷, 因为修改的内容比较集中, 故添加修改使用同一个页面和逻辑
// 直接上传图片解析为试卷的方式因为要接入 ai api 要走付费模式, 即使相对便宜
// 但是个人使用比如 DeepSeek 几乎是完全免费的, 因此需要个人借助其它 ai 平台将试卷题目转化为 markdown 格式后拷贝过来上传

import { useState } from "react";
import { ChapterDropdownNav } from "~/common/exam/nav";
import { TagSelect } from "~/common/exam/tag";
import { GradeSelect } from "~/common/exam/grade";
import { SemesterSelect } from "~/common/exam/semester";
import { YearSelect } from "~/common/exam/year";
import { Button } from "~/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";
import { Separator } from "~/components/ui/separator";
import type { Textbook } from "~/type/textbook";
import { StringConst } from "~/util/string";
import { Watermark } from "~/common/watermark";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import type { Group, PaperMeta, QuestionInfo } from "~/type/exam";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Plus, Trash2, X } from "lucide-react";
import { Label } from "~/components/ui/label";
import type { QuestionOption } from "~/type/question";
import { ExamPaperMeta } from "~/common/exam/paper";

// 初始化默认值等信息
const generateId = () => Math.random().toString(36).substring(2, 9);
const defaultPaperMeta: PaperMeta = {
  relatedId: 0,
  tag: "",
  title: "",
  score: 0,
  source: "",
  year: "",
  groups: [],
  id: 0,
  status: 0,
  createAt: "",
  updateAt: "",
};

const defaultQuestionInfo = (order: number): QuestionInfo => ({
  genId: generateId(),
  order,
  stem: "",
  answer: "",
  analysis: "",
  score: 0,
  options: [],
  id: 0,
  groupId: 0,
});

const defaultGroup = (): Group => ({
  genId: generateId(),
  typeName: "",
  subTitle: "",
  questions: [],
  id: 0,
  paperId: 0,
});

export default function Add(props: any) {
  // 表单选项
  const textbooks: Textbook[] = props.textbooks ?? [];

  // 初始化试卷信息
  const [paper, setPaper] = useState<PaperMeta>(defaultPaperMeta);
  const updatePaperMeta = (key: keyof PaperMeta, value: string | number) => {
    setPaper((prev) => ({ ...prev, [key]: value }));
  };

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
  const updateGroup = (groupGenId: string, key: keyof Group, value: string) => {
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

  const updateQuestion = (groupGenId: string, questionId: string, key: keyof QuestionInfo, value: string | string[] | number) => {
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
            // 计算新选项的 label (A, B, C, D, E...)
            const newLabel = String.fromCharCode(65 + q.options.length);

            const newOption: QuestionOption = {
              label: newLabel,
              content: "", // 初始为空内容
              order: q.options.length, // 顺序基于当前选项数量
              images: [], // 如果有需要可以添加
            };
            return { ...q, options: [...q.options, newOption] };
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
            const newOptions = [...q.options];
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
            const newOptions = q.options.slice(0, index);

            return { ...q, options: newOptions };
          }),
        };
      }),
    }));
  };

  return (
    <div>
      <div>
        <p>1. 直接上传图片解析为试卷的方式因为要接入 ai api 要走付费模式, 即使相对便宜</p>
        <p>2. 但是个人使用比如 DeepSeek 几乎是完全免费的, 因此需要个人借助其它 ai 平台将试卷题目转化为 markdown 格式后拷贝过来上传</p>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <Button
          variant="default"
          onClick={() => {
            console.log(paper);
          }}
        >
          保存
        </Button>
      </div>

      <Separator className="mt-3 mb-3" />

      <div className="mb-6">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize="50%">
            <div>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="col-span-1">选择考点名称/年级</div>
                  <div className="col-span-4">
                    <ChapterDropdownNav
                      textbooks={textbooks}
                      onSelect={(selectedItems: Textbook[]) => {
                        // 直接记录末级的标识即可, 搜索直接搜索该层级标识即可, 不关心父级和子级
                        // console.log("选中的路径:", selectedItems);
                        // console.log("当前选中的节点:", selectedItems[selectedItems.length - 1]);
                        // console.log("所有父级:", selectedItems.slice(0, -1));
                        // 但是详情和编辑需要展示这个路径, 需要用了再获取
                        const current = selectedItems[selectedItems.length - 1];
                        updatePaperMeta("related_id", current?.id ?? 0);
                      }}
                      defaultSelectedKeys={["some-key"]}
                      placeholder="请选择学段"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="col-span-1">选择标签</div>
                  <div className="col-span-4">
                    <TagSelect
                      options={StringConst.examTags}
                      defaultValue={paper.tag}
                      onSelect={(val) => {
                        updatePaperMeta("tag", val);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="col-span-1">选择年份</div>
                  <div className="col-span-4">
                    <YearSelect value={paper.year || undefined} onValueChange={(val) => updatePaperMeta("year", val ?? "")} placeholder="选择年份" />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="col-span-1">选择年级</div>
                  <div className="col-span-4">
                    <GradeSelect
                      value={paper.grade || undefined}
                      onValueChange={(val) => updatePaperMeta("grade", val ?? "")}
                      placeholder="选择年级"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="col-span-1">选择学期</div>
                  <div className="col-span-4">
                    <SemesterSelect
                      value={paper.semester || undefined}
                      onValueChange={(val) => updatePaperMeta("semester", val ?? "")}
                      placeholder="选择学期"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="col-span-1">试卷标题</div>
                  <div className="col-span-4">
                    <Textarea value={paper.title} onChange={(e) => updatePaperMeta("title", e.target.value)} placeholder={"请输入试卷标题"} />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="col-span-1">试卷分数</div>
                  <div className="col-span-4">
                    <Input
                      type="number"
                      value={paper.score}
                      onChange={(e) => {
                        updatePaperMeta("score", e.target.value);
                      }}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="col-span-1">试卷来源</div>
                  <div className="col-span-4">
                    <Textarea value={paper.source} onChange={(e) => updatePaperMeta("source", e.target.value)} placeholder={"请输入试卷来源"} />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="col-span-1">备注</div>
                  <div className="col-span-4">
                    <Textarea value={paper.remark} onChange={(e) => updatePaperMeta("remark", e.target.value)} placeholder={"请输入备注信息"} />
                  </div>
                </div>
              </div>

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

                <Button variant="outline" size="sm" onClick={addGroup}>
                  <Plus className="mr-1 h-4 w-4" />
                  添加大题
                </Button>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="50%">
            <Watermark className="h-full w-full border bg-slate-50">
              <div className="p-8">
                <ExamPaperMeta paperMeta={paper} />
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
  group: Group;
  index: number;
  onUpdateGroup: (key: keyof Group, value: string) => void;
  onRemoveGroup: () => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (questionId: string) => void;
  onUpdateQuestion: (questionId: string, key: keyof QuestionInfo, value: string | string[] | number) => void;
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
            className="w-48 text-sm"
          />
          <Input
            value={group.subTitle}
            onChange={(e) => onUpdateGroup("subTitle", e.target.value)}
            placeholder="题型描述, 如: 本题共8小题, 每小题5分"
            className="flex-1 min-w-50 text-sm"
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
        <Button variant="outline" size="sm" onClick={onAddQuestion}>
          <Plus className="mr-1 h-4 w-4" />
          添加小题
        </Button>
      </CardContent>
    </Card>
  );
}

// ============ 小题组件 ============

interface QuestionItemProps {
  question: QuestionInfo;
  onRemove: () => void;
  onUpdate: (key: keyof QuestionInfo, value: string | string[] | number) => void;
  onAddOption: () => void;
  onUpdateOption: (index: number, value: QuestionOption) => void;
  onRemoveOption: (index: number) => void;
}

function QuestionItem({ question, onRemove, onUpdate, onAddOption, onUpdateOption, onRemoveOption }: QuestionItemProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white">
      {/* 题号 + 删除 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{question.order}. 小题</span>
        <Button variant="ghost" size="sm" onClick={onRemove} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 题干 */}
      <div className="space-y-1">
        <Label className="text-xs">题干</Label>
        <Textarea
          value={question.stem}
          onChange={(e) => onUpdate("stem", e.target.value)}
          placeholder="从 Markdown 中复制题干粘贴到这里..."
          className="min-h-15 font-mono text-sm"
        />
      </div>

      {/* 选项 - 默认不显示，用户点击添加才出现 */}
      {question.options.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs">选项</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {question.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-mono font-medium w-5 text-sm text-muted-foreground">{StringConst.optionLabels[idx]}.</span>
                <Input
                  value={opt.content}
                  onChange={(e) => {
                    const newOpt: QuestionOption = {
                      label: opt.label,
                      content: e.target.value,
                      images: [], // todo 需要补充选项的图片
                      order: opt.order,
                    };
                    onUpdateOption(idx, newOpt);
                  }}
                  placeholder={`选项 ${StringConst.optionLabels[idx]}`}
                  className="flex-1 text-sm"
                />
                <Button variant="ghost" size="sm" onClick={() => onRemoveOption(idx)} className="h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          {question.options.length < 6 && (
            <Button variant="outline" size="sm" onClick={onAddOption} className="mt-1">
              <Plus className="mr-1 h-3 w-3" />
              添加选项
            </Button>
          )}
        </div>
      )}

      {/* 添加选项按钮 - 仅在无选项时显示 */}
      {question.options.length === 0 && (
        <Button variant="outline" size="sm" onClick={onAddOption}>
          <Plus className="mr-1 h-3 w-3" />
          添加选项(选择题/多选题)
        </Button>
      )}

      {/* 答案 + 分值 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs">答案</Label>
          <Input
            value={question.answer}
            onChange={(e) => onUpdate("answer", e.target.value)}
            placeholder="如: A 或 ABD 或 2 或 略"
            className="text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">分值</Label>
          <Input
            type="number"
            value={question.score}
            onChange={(e) => onUpdate("score", Number(e.target.value))}
            placeholder="5"
            className="text-sm"
          />
        </div>
      </div>

      {/* 解析 */}
      <div className="space-y-1">
        <Label className="text-xs">解析</Label>
        <Textarea
          value={question.analysis}
          onChange={(e) => onUpdate("analysis", e.target.value)}
          placeholder="从 Markdown 中复制解析内容粘贴到这里..."
          className="min-h-12.5 font-mono text-sm"
        />
      </div>
    </div>
  );
}
