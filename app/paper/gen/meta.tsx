import { TagShow } from "~/common/paper/tag";
import { Separator } from "~/components/ui/separator";
import { useUser } from "~/hooks/use-user";
import type { PaperMeta, PaperQuestion } from "~/type/paper";
import type { UserInfoResp } from "~/type/user";
import { StringConst } from "~/util/string";
import { ExamGenSortableQuestion } from "~/paper/gen/question";
import type { QuestionInfoResp } from "~/type/question";
import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ArrayUtil } from "~/util/object";

// 手动组卷试卷详情

// 试卷详情样式
interface ExamPaperGenMetaProps {
  initPaperMeta: PaperMeta;

  // 以下为 Sheet 操作方法和属性
  setSheetTitle?: (value: string) => void;
  setSheetDesc?: (value: string) => void;
  setSheetContent?: (value: React.ReactNode) => void;
}
function ExamPaperGenMeta({ initPaperMeta, setSheetTitle, setSheetDesc, setSheetContent }: ExamPaperGenMetaProps) {
  // 获取用户信息
  const currentUser: UserInfoResp | null = useUser();

  // 需要在这里维护这个变量状态, 考虑获取到数据后再打开抽屉因此接口请求放在上一步
  const [paperMeta, setPaperMeta] = useState<PaperMeta>(initPaperMeta);

  // 生成题型样式
  const getGroupName = (index: number, typeName: string, subTitle: string) => {
    const groupName = subTitle
      ? `${StringConst.groupNumberMap[index]}、${typeName} (${subTitle})`
      : `${StringConst.groupNumberMap[index]}、${typeName}`;
    return <div className="text-base">{groupName}</div>;
  };

  // 拖拽分组下一个题目到新位置
  const handleDragQuestion = (groupId: number, oldIndex: number, newIndex: number) => {
    setPaperMeta((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          // 移动数组并更新题目的序号
          questions: ArrayUtil.moveArrayItem<PaperQuestion>(g.questions, oldIndex, newIndex).map((q, index) => ({
            ...q,
            orderNum: index + 1,
          })),
        };
      }),
    }));
  };

  // 替换题目
  const handleReplaceQuestion = (groupId: number, questionId: number) => {};

  // 确定替换
  const handleConfirmReplacement = (groupId: number, questionId: number, newQuestion: QuestionInfoResp) => {};

  // 更新分组下题目分数, 分数是否合规提交时校验
  const handleUpdateQuestionScore = (groupId: number, questionId: number, newScore: number) => {
    setPaperMeta((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          questions: g.questions.map((q) => (q.id === questionId ? { ...q, ["score"]: newScore } : q)),
        };
      }),
    }));
  };

  return (
    <div className="flex flex-col gap-3 pl-4 pb-4 pr-4 bg-gray-100">
      <div className="text-sm">
        <div>1. 拖拽排序仅限同一题型内, 比如选择题, 填空题内, 跨题型不支持题型也不对应;</div>
        <div>2. 同一题型下可重新分配分值, 注意该题型总分数不能发生变化;</div>
        <div>3. 针对不合理的题目, 可以替换为其它题目;</div>
      </div>

      <div>
        <Button className="text-sm" onClick={() => {}}>
          <Save className="mr-2 h-4 w-4" />
          保存
        </Button>
      </div>

      <div>
        <Separator />
      </div>

      {/* 来源和备注, 只展示存在的信息 */}
      <div className="flex flex-col gap-1 text-sm">
        {paperMeta.score && <div>分数: {paperMeta.score}</div>}
        {currentUser?.username && (
          <div>
            由 <span className="text-sm font-medium text-blue-600">{currentUser.username}</span> 上传
          </div>
        )}
        {paperMeta.source && <div>来源: {paperMeta.source}</div>}
        {paperMeta.remark && <div>备注: {paperMeta.remark}</div>}
      </div>

      <div>
        <Separator />
      </div>

      {/* 生成标签 */}
      <div className="flex gap-3 items-center w-full">
        <TagShow
          relatedName={paperMeta.relatedName ?? ""}
          tag={paperMeta.tag}
          year={paperMeta.year}
          grade={paperMeta.grade ?? ""}
          semester={paperMeta.semester ?? ""}
        />
      </div>

      {/* 标题 */}
      <div className="text-lg font-bold text-center">{paperMeta.title}</div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-6 bg-blue-50 rounded-lg p-4">
        <div className="text-center">
          <div className="text-sm text-gray-500">知识点覆盖</div>
          <div className="text-2xl font-bold text-blue-600">78%</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">难度系数</div>
          <div className="text-2xl font-bold text-blue-600">4.2</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">题目总数</div>
          <div className="text-2xl font-bold text-blue-600">17</div>
        </div>
      </div>

      {/* 试卷内容 */}
      {paperMeta.groups?.map((group, idx) => {
        return (
          <div key={`${paperMeta.id}-${group.id}`}>
            {/* 题型名称 */}
            <div className="mt-2.5 mb-2.5 font-bold">{getGroupName(idx, group.typeName, group.subTitle)}</div>

            {/* 小题列表, 需要支持排序和替换 */}
            <ExamGenSortableQuestion
              groupId={group.id}
              questions={group.questions}
              onDrag={handleDragQuestion}
              onReplace={handleReplaceQuestion}
              onUpdateScore={handleUpdateQuestionScore}
            />
          </div>
        );
      })}
    </div>
  );
}

export { ExamPaperGenMeta };
