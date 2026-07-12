// components/PaperPreview.tsx
import React, { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RotateCcw, GripVertical } from "lucide-react";

interface Question {
  id: string;
  type: string;
  content: string;
  difficulty: number;
  score: number;
  tags: string[];
  knowledgePoint: string;
}

interface PaperPreviewProps {
  summary: {
    knowledgeCoverage: number;
    difficultyCoefficient: number;
    totalQuestions: number;
  };
  questions: Question[];
  onDrag: (dragIndex: number, hoverIndex: number) => void;
  onReplace: (questionId: string) => void;
  onUpdateScore: (questionId: string, newScore: number) => void;
}

// 可拖拽题目组件
const SortableQuestion: React.FC<{
  question: Question;
  index: number;
  onReplace: (id: string) => void;
  onUpdateScore: (id: string, score: number) => void;
}> = ({ question, index, onReplace, onUpdateScore }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border rounded-lg bg-white hover:shadow-md transition-shadow ${isDragging ? "shadow-lg border-blue-300" : "border-gray-200"}`}
    >
      <div className="flex items-start">
        {/* 拖拽手柄 */}
        <div {...attributes} {...listeners} className="mr-3 mt-1 cursor-grab hover:text-blue-500 transition-colors">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-sm font-medium text-gray-500">{index + 1}.</span>
            <span className="text-sm text-gray-700">{question.content}</span>
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-400">
            <span>难度：{question.difficulty}</span>
            <span>知识点：{question.knowledgePoint}</span>
            {question.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <div className="flex items-center space-x-1">
            <label className="text-xs text-gray-500">分数：</label>
            <input
              type="number"
              value={question.score}
              onChange={(e) => onUpdateScore(question.id, parseInt(e.target.value) || 0)}
              className="w-12 px-1 py-0.5 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button onClick={() => onReplace(question.id)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="替换题目">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const PaperPreview: React.FC<PaperPreviewProps> = ({ summary, questions, onDrag, onReplace, onUpdateScore }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const groupedQuestions = questions.reduce(
    (acc, q) => {
      if (!acc[q.type]) acc[q.type] = [];
      acc[q.type].push(q);
      return acc;
    },
    {} as Record<string, Question[]>,
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // 由于我们按类型分组，需要找到各自在原始数组中的位置
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newQuestions = arrayMove(questions, oldIndex, newIndex);
        // 通知父组件更新
        onDrag(oldIndex, newIndex);
      }
    }
  };

  return (
    <div>
      {/* 概览卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-6 bg-blue-50 rounded-lg p-4">
        <div className="text-center">
          <div className="text-sm text-gray-500">知识点覆盖</div>
          <div className="text-2xl font-bold text-blue-600">{summary.knowledgeCoverage}%</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">难度系数</div>
          <div className="text-2xl font-bold text-blue-600">{summary.difficultyCoefficient}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">题目总数</div>
          <div className="text-2xl font-bold text-blue-600">{summary.totalQuestions}</div>
        </div>
      </div>

      {/* 题目列表 */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {Object.entries(groupedQuestions).map(([type, typeQuestions]) => (
          <div key={type} className="mb-6">
            <h5 className="font-medium text-gray-700 mb-3 flex items-center">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                {type}（{typeQuestions.length}题）
              </span>
            </h5>
            <SortableContext items={typeQuestions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {typeQuestions.map((question, index) => (
                  <SortableQuestion key={question.id} question={question} index={index} onReplace={onReplace} onUpdateScore={onUpdateScore} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </DndContext>
    </div>
  );
};

export default PaperPreview;
