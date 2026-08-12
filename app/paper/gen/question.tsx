import { GripVertical, RotateCcw } from "lucide-react";
import { MultiOptionShow } from "~/common/select";
import { TitleShow } from "~/common/title";
import type { GenPaperQuestionResp } from "~/type/paper";
import type { QuestionInfoResp, QuestionOption } from "~/type/question";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { useSortable, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "~/components/ui/button";
import { CSS } from "@dnd-kit/utilities";

// 一组题目拖拽列表
interface GenSortableQuestionListProps {
  groupId: number;
  questions: GenPaperQuestionResp[];
  onDrag: (groupId: number, oldIndex: number, newIndex: number) => void;
  onReplace: (groupId: number, index: number, question: GenPaperQuestionResp) => void;
  onUpdateScore: (groupId: number, questionId: number, newScore: number) => void;
  onViewInfo: (value: QuestionInfoResp) => void;
}

function GenSortableQuestionList({ groupId, questions, onDrag, onReplace, onUpdateScore, onViewInfo }: GenSortableQuestionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 拖拽结束事件触发
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.info.baseInfo.id === active.id);
      const newIndex = questions.findIndex((q) => q.info.baseInfo.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // 通知父组件该分组下面的题目位置发生了变化
        onDrag(groupId, oldIndex, newIndex);
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={questions.map((q) => q.info.baseInfo.id)} strategy={verticalListSortingStrategy}>
        {questions.map((question, idx) => {
          return (
            <GenQuestionInfo
              key={question.common.genId}
              groupId={groupId}
              index={idx}
              question={question}
              onReplace={onReplace}
              onUpdateScore={onUpdateScore}
              onViewInfo={onViewInfo}
            />
          );
        })}
      </SortableContext>
    </DndContext>
  );
}

// 手动组卷题目样式
interface GenQuestionInfoProps {
  groupId: number;
  index: number;
  question: GenPaperQuestionResp;
  onReplace: (groupId: number, index: number, question: GenPaperQuestionResp) => void;
  onUpdateScore: (groupId: number, questionId: number, score: number) => void;
  onViewInfo: (value: QuestionInfoResp) => void;
}
function GenQuestionInfo({ groupId, index, question, onReplace, onUpdateScore, onViewInfo }: GenQuestionInfoProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.info.baseInfo.id });

  // 生成题目标题
  const getQuestionTitle = (orderNum: number, stem: string, images: string[]) => {
    return <TitleShow no={orderNum} title={stem} comment={""} images={images} />;
  };

  // 生成题目选项
  const getQuestionOptions = (index: number, options: QuestionOption[]) => {
    return <MultiOptionShow optionsLayout={question.info.baseInfo.optionsLayout || 1} options={options} />;
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex text-base mt-4 pt-3 pb-3 bg-white transition-all duration-200 hover:shadow-lg hover:border-primary/10 border-border/60"
    >
      {/* 拖拽手柄 */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center cursor-grab hover:text-blue-500 transition-colors flex-[0_0_5%]"
      >
        <GripVertical className="w-8 text-green-600" />
      </div>

      {/* 题目主体 */}
      <div className="flex-[0_0_80%]">
        <div>{getQuestionTitle(question.common.orderNum, question.info.baseInfo.title, question.info.baseInfo.images || [])}</div>
        <div className="mt-2.5">{getQuestionOptions(index, question.info.baseInfo.options || [])}</div>
      </div>

      {/* 分数值可以动态调整, 比如一个大题内部的小题有分数差异, 支持替换题目 */}
      <div className="flex items-center justify-center space-x-2 ml-4 flex-[0_0_15%]">
        <Button variant="link" onClick={() => onViewInfo(question.info)}>
          详情
        </Button>
        <div className="flex items-center space-x-1">
          <label className="text-xs text-gray-500">分数：</label>
          <input
            type="number"
            value={question.common.score}
            onChange={(e) => onUpdateScore(groupId, question.info.baseInfo.id, parseInt(e.target.value) || 0)}
            className="w-12 px-1 py-0.5 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => onReplace(groupId, index, question)}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          title="替换题目"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export { GenSortableQuestionList };
