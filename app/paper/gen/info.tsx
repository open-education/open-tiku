import { TagShow } from "~/common/paper/tag";
import { Separator } from "~/components/ui/separator";
import { useUser } from "~/hooks/use-user";
import type { GenPaperQuestionResp, GenPaperResp } from "~/type/paper";
import type { UserInfoResp } from "~/type/user";
import { StringConst } from "~/util/string";
import { GenSortableQuestionList } from "~/paper/gen/question";
import type { QuestionInfoResp, QuestionOption } from "~/type/question";
import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ArrayUtil } from "~/util/object";
import { TitleShow } from "~/common/title";
import { MultiOptionShow } from "~/common/select";

// 手动组卷试卷详情

// 预览详情
interface GenInfoPreviewProps {
  infoResp: GenPaperResp;
}

function GenInfoPreview({ infoResp }: GenInfoPreviewProps) {
  // 获取用户信息
  const currentUser: UserInfoResp | null = useUser();

  // 生成题型样式
  const getGroupName = (index: number, typeName: string, subTitle: string) => {
    const groupName = subTitle
      ? `${StringConst.groupNumberMap[index]}、${typeName} (${subTitle})`
      : `${StringConst.groupNumberMap[index]}、${typeName}`;
    return <div className="text-base">{groupName}</div>;
  };

  // 生成题目标题
  const getQuestionTitle = (orderNum: number, stem: string, images: string[]) => {
    return <TitleShow no={orderNum} title={stem} comment={""} images={images} />;
  };

  // 生成题目选项
  const getQuestionOptions = (optionsLayout: number, options: QuestionOption[]) => {
    return <MultiOptionShow optionsLayout={optionsLayout} options={options} />;
  };

  return (
    <div className="flex flex-col gap-3 pl-4 pb-4 pr-4 bg-gray-100">
      <div>
        <Separator />
      </div>

      {/* 来源和备注, 只展示存在的信息 */}
      <div className="flex flex-col gap-1 text-sm">
        {infoResp.common.score && <div>分数: {infoResp.common.score}</div>}
        {currentUser?.username && (
          <div>
            由 <span className="text-sm font-medium text-blue-600">{currentUser.username}</span> 上传
          </div>
        )}
        {infoResp.common.source && <div>来源: {infoResp.common.source}</div>}
        {infoResp.common.remark && <div>备注: {infoResp.common.remark}</div>}
      </div>

      <div>
        <Separator />
      </div>

      {/* 生成标签 */}
      <div className="flex gap-3 items-center w-full">
        <TagShow
          relatedName={infoResp.common.relatedName ?? ""}
          tag={infoResp.common.tag}
          year={infoResp.common.year}
          grade={infoResp.common.grade ?? ""}
          semester={infoResp.common.semester ?? ""}
        />
      </div>

      {/* 标题 */}
      <div className="text-lg font-bold text-center">{infoResp.common.title}</div>

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
      {infoResp.groups?.map((group, idx) => {
        return (
          <div key={group.common.genId}>
            {/* 题型名称 */}
            <div className="mt-2.5 mb-2.5 font-bold">{getGroupName(idx, group.common.typeName, group.common.subTitle)}</div>

            {/* 小题列表, 需要支持排序和替换 */}
            {group.questions.map((question, idx) => {
              return (
                <div className="text-base mt-4 p-3 bg-white transition-all duration-200 hover:shadow-lg hover:border-primary/10 border-border/60">
                  {/* 题目主体 */}
                  <div>{getQuestionTitle(question.common.orderNum, question.info.baseInfo.title, question.info.baseInfo.images || [])}</div>
                  <div className="mt-2.5">{getQuestionOptions(question.info.baseInfo.optionsLayout || 1, question.info.baseInfo.options || [])}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// 试卷详情样式
interface GenInfoProps {
  infoResp: GenPaperResp;

  // 以下为 Sheet 操作方法和属性
  setSheetTitle?: (value: string) => void;
  setSheetDesc?: (value: string) => void;
  setSheetContent?: (value: React.ReactNode) => void;
}
function GenInfo({ infoResp, setSheetTitle, setSheetDesc, setSheetContent }: GenInfoProps) {
  // 获取用户信息
  const currentUser: UserInfoResp | null = useUser();

  // 需要在这里维护这个变量状态, 考虑获取到数据后再打开抽屉因此接口请求放在上一步
  const [genPaperInfo, setGenPaperInfo] = useState<GenPaperResp>(infoResp);

  // 生成题型样式
  const getGroupName = (index: number, typeName: string, subTitle: string) => {
    const groupName = subTitle
      ? `${StringConst.groupNumberMap[index]}、${typeName} (${subTitle})`
      : `${StringConst.groupNumberMap[index]}、${typeName}`;
    return <div className="text-base">{groupName}</div>;
  };

  // 拖拽分组下一个题目到新位置
  const handleDragQuestion = (groupId: number, oldIndex: number, newIndex: number) => {
    setGenPaperInfo((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.common.id !== groupId) return g;
        return {
          ...g,
          // 移动数组并更新题目的序号
          questions: ArrayUtil.moveArrayItem<GenPaperQuestionResp>(g.questions, oldIndex, newIndex).map((q, index) => ({
            ...q,
            common: { ...q.common, orderNum: index + 1 },
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
    setGenPaperInfo((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.common.id !== groupId) return g;
        return {
          ...g,
          questions: g.questions.map((q) => (q.common.questionId === questionId ? { ...q, common: { ...q.common, ["score"]: newScore } } : q)),
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
        {genPaperInfo.common.score && <div>分数: {genPaperInfo.common.score}</div>}
        {currentUser?.username && (
          <div>
            由 <span className="text-sm font-medium text-blue-600">{currentUser.username}</span> 上传
          </div>
        )}
        {genPaperInfo.common.source && <div>来源: {genPaperInfo.common.source}</div>}
        {genPaperInfo.common.remark && <div>备注: {genPaperInfo.common.remark}</div>}
      </div>

      <div>
        <Separator />
      </div>

      {/* 生成标签 */}
      <div className="flex gap-3 items-center w-full">
        <TagShow
          relatedName={genPaperInfo.common.relatedName ?? ""}
          tag={genPaperInfo.common.tag}
          year={genPaperInfo.common.year}
          grade={genPaperInfo.common.grade ?? ""}
          semester={genPaperInfo.common.semester ?? ""}
        />
      </div>

      {/* 标题 */}
      <div className="text-lg font-bold text-center">{genPaperInfo.common.title}</div>

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
      {genPaperInfo.groups?.map((group, idx) => {
        return (
          <div key={`${genPaperInfo.id}-${group.id}`}>
            {/* 题型名称 */}
            <div className="mt-2.5 mb-2.5 font-bold">{getGroupName(idx, group.common.typeName, group.common.subTitle)}</div>

            {/* 小题列表, 需要支持排序和替换 */}
            <GenSortableQuestionList
              groupId={group.common.id}
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

export { GenInfoPreview, GenInfo };
