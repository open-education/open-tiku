import { GripVertical, RotateCcw } from "lucide-react";
import { MultiOptionShow } from "~/common/select";
import { TitleShow } from "~/common/title";
import type { PaperQuestion } from "~/type/paper";
import type { QuestionInfoResp, QuestionOption } from "~/type/question";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { useSortable, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "~/components/ui/button";
import { httpClient } from "~/util/http";
import { CSS } from "@dnd-kit/utilities";

// 一组题目拖拽列表
interface ExamGenSortableQuestionProps {
  groupId: number;
  questions: PaperQuestion[];
  onDrag: (groupId: number, oldIndex: number, newIndex: number) => void;
  onReplace: (groupId: number, questionId: number) => void;
  onUpdateScore: (groupId: number, questionId: number, newScore: number) => void;
}

function ExamGenSortableQuestion({ groupId, questions, onDrag, onReplace, onUpdateScore }: ExamGenSortableQuestionProps) {
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
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // 通知父组件该分组下面的题目位置发生了变化
        onDrag(groupId, oldIndex, newIndex);
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
        {questions.map((question, idx) => {
          return (
            <ExamGenQuestion
              key={question.genId}
              groupId={groupId}
              index={idx}
              question={question}
              onReplace={onReplace}
              onUpdateScore={onUpdateScore}
            />
          );
        })}
      </SortableContext>
    </DndContext>
  );
}

// 手动组卷题目样式
interface ExamGenQuestionProps {
  groupId: number;
  index: number;
  question: PaperQuestion;
  onReplace: (groupId: number, questionId: number) => void;
  onUpdateScore: (groupId: number, questionId: number, score: number) => void;
}
function ExamGenQuestion({ groupId, index, question, onReplace, onUpdateScore }: ExamGenQuestionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });

  // 生成题目标题
  const getQuestionTitle = (orderNum: number, stem: string, images: string[]) => {
    return <TitleShow no={orderNum} title={stem} comment={""} images={images} />;
  };

  // 生成题目选项
  const getQuestionOptions = (index: number, options: QuestionOption[]) => {
    return <MultiOptionShow optionsLayout={question.optionsLayout || 1} options={options} />;
  };

  // 查看详情
  const handleGenQuestionInfo = (id: number) => {
    httpClient
      .get<QuestionInfoResp>(`/question/info/${id}`)
      .then((res) => {})
      .catch((err) => {})
      .finally(() => {});
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
        <div>{getQuestionTitle(question.orderNum, question.stem, question.images || [])}</div>
        <div className="mt-2.5">{getQuestionOptions(index, question.options || [])}</div>
      </div>

      {/* 分数值可以动态调整, 比如一个大题内部的小题有分数差异, 支持替换题目 */}
      <div className="flex items-center justify-center space-x-2 ml-4 flex-[0_0_15%]">
        <Button variant="link" onClick={() => handleGenQuestionInfo(question.id)}>
          详情
        </Button>
        <div className="flex items-center space-x-1">
          <label className="text-xs text-gray-500">分数：</label>
          <input
            type="number"
            value={question.score}
            onChange={(e) => onUpdateScore(groupId, question.id, parseInt(e.target.value) || 0)}
            className="w-12 px-1 py-0.5 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button onClick={() => onReplace(groupId, question.id)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="替换题目">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export { ExamGenSortableQuestion };
