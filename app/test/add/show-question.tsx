import { Alert, Button } from "antd";
import { useEffect, useState } from "react";
import { CommonSelect } from "~/common/select";
import { CommonTitle } from "~/common/title";
import type { QuestionBaseInfoResp, QuestionListReq, QuestionListResp } from "~/type/question";
import { httpClient } from "~/util/http";
import { StringConst } from "~/util/string";
import { CommonTag } from "~/common/tag";
import type { TextbookOtherDict } from "~/type/textbook";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ItemProps {
  questionInfo: QuestionBaseInfoResp;
  questionTypeList: TextbookOtherDict[];
  questionTagList: TextbookOtherDict[];
  questionIds: number[];
  setQuestionIds: (value: number[]) => void;
}

// 一个可拖拽排序的单元即是一个题目
function SortableItem(props: ItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.questionInfo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      // 外层容器不再绑定 listeners，因此点击这里不会触发拖拽
      className={`
        flex items-center gap-3 mb-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm
        ${isDragging ? "opacity-50 z-10 shadow-lg" : "opacity-100"}
      `}
    >
      {/* 1. 拖拽手柄图标 */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
      >
        {/* 这里用一个简单的 SVG 代替拖拽图标 (六点图标) */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 6a1 1 0 100-2 1 1 0 000 2zM7 11a1 1 0 100-2 1 1 0 000 2zM7 16a1 1 0 100-2 1 1 0 000 2zM13 6a1 1 0 100-2 1 1 0 000 2zM13 11a1 1 0 100-2 1 1 0 000 2zM13 16a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      </div>

      {/* 2. 内容体 (点击这里无法拖拽) */}
      <div>
        {/* 题号 */}
        <div>
          <Button
            color="primary"
            variant="dashed"
            onClick={() => {
              props.setQuestionIds(props.questionIds.filter((id) => id != props.questionInfo.id));
            }}
          >
            移除
          </Button>
        </div>

        {/* 标签 */}
        <div className="mt-2.5">
          <CommonTag
            questionTypeList={props.questionTypeList}
            questionTagList={props.questionTagList}
            questionTypeId={props.questionInfo.questionTypeId}
            questionTagIds={props.questionInfo.questionTagIds ?? []}
            difficultyLevel={props.questionInfo.difficultyLevel}
          />
        </div>

        {/* 标题 */}
        <div className="mt-2.5">
          {<CommonTitle title={props.questionInfo.title} comment={props.questionInfo.comment} images={props.questionInfo.images} />}
        </div>

        {/* 选项内容 */}
        <div className="mt-2.5">
          {props.questionInfo.options && props.questionInfo.options.length > 0 && (
            <CommonSelect optionsLayout={props.questionInfo.optionsLayout ?? 1} options={props.questionInfo.options} />
          )}
        </div>
      </div>
    </div>
  );
}

interface ShowQuestionListProps {
  questionTypeList: TextbookOtherDict[];
  questionTagList: TextbookOtherDict[];
  questionIds: number[];
  setQuestionIds: (value: number[]) => void;
  questionCateId: number;
}

// 展示题目信息
export default function ShowQuestionList(props: ShowQuestionListProps) {
  // 题型列表展示错误信息
  const [reqShowQuestListErr, setReqShowQuestListErr] = useState<React.ReactNode>(null);
  // 每种题型下面的题目列表
  const [questionListResp, setQuestionListResp] = useState<QuestionBaseInfoResp[]>([]);
  useEffect(() => {
    // 渲染题型列表, 试卷题目数量有限而且不会超过30个不分页
    if (props.questionIds.length == 0) {
      if (reqShowQuestListErr) {
        setReqShowQuestListErr("");
      }
      setQuestionListResp([]);
      return;
    }

    // 最多只能选择30个题目
    if (props.questionIds.length > StringConst.tikuMaxNum) {
      setReqShowQuestListErr(<Alert title="Error" description="每种题型最多只能选择30个题目" type="error" showIcon />);
      return;
    }

    const questionListReq: QuestionListReq = {
      questionCateId: props.questionCateId,
      ids: props.questionIds,
      pageNo: 1,
      pageSize: 30,
    };
    httpClient
      .post<QuestionListResp>("/question/list", questionListReq)
      .then((res) => {
        if (reqShowQuestListErr) {
          setReqShowQuestListErr("");
        }
        setQuestionListResp(res.list);
      })
      .catch((err) => {
        setReqShowQuestListErr(<Alert title="Error" description={`读取题目列表出错: ${err.message}`} type="error" showIcon />);
      });
  }, [props.questionIds]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // 拖拽结束后更新数组顺序
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setQuestionListResp((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <div>
      {reqShowQuestListErr}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={questionListResp} strategy={verticalListSortingStrategy}>
          {questionListResp.map((questionInfo) => (
            <SortableItem
              key={questionInfo.id}
              questionInfo={questionInfo}
              questionTypeList={props.questionTypeList}
              questionTagList={props.questionTagList}
              questionIds={props.questionIds}
              setQuestionIds={props.setQuestionIds}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
