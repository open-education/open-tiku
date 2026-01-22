import { Alert, Button, InputNumber } from "antd";
import { useEffect, useState } from "react";
import { CommonSelect } from "~/common/select";
import { CommonTitle } from "~/common/title";
import type { QuestionListReq, QuestionListResp } from "~/type/question";
import type { Textbook } from "~/type/textbook";
import { httpClient } from "~/util/http";
import { StringConst } from "~/util/string";

interface ShowQuestionListProps {
  questionIds: number[];
  setQuestionIds: (value: number[]) => void;
  selectOption: Textbook;
}

// 展示题目信息
export default function ShowQuestionList(props: ShowQuestionListProps) {
  // 题型列表展示错误信息
  const [reqShowQuestListErr, setReqShowQuestListErr] = useState<React.ReactNode>(null);
  const questionListInit: QuestionListResp = {
    list: [],
    pageNo: 0,
    pageSize: 0,
    total: 0,
  };
  // 每种题型下面的题目列表
  const [showQuestionListResp, setShowQuestionListResp] = useState<QuestionListResp>(questionListInit);
  useEffect(() => {
    console.log("listen: ", props.questionIds);

    // 渲染题型列表, 试卷题目数量有限而且不会超过30个不分页
    if (props.questionIds.length == 0) {
      if (reqShowQuestListErr) {
        setReqShowQuestListErr("");
      }
      setShowQuestionListResp(questionListInit);
      return;
    }

    // 最多只能选择30个题目
    if (props.questionIds.length > StringConst.tikuMaxNum) {
      setReqShowQuestListErr(<Alert title="Error" description="每种题型最多只能选择30个题目" type="error" showIcon />);
      return;
    }

    const questionListReq: QuestionListReq = {
      questionCateId: props.selectOption.id,
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
        setShowQuestionListResp(res);
      })
      .catch((err) => {
        setReqShowQuestListErr(<Alert title="Error" description={`读取题目列表出错: ${err.message}`} type="error" showIcon />);
      });
  }, [props.questionIds]);

  return (
    <div>
      {reqShowQuestListErr}
      {showQuestionListResp.list.map((questionInfo) => {
        return (
          <div
            key={questionInfo.id}
            className="group relative p-4 pb-4 hover:pb-2.5 border border-transparent hover:border-blue-500 transition-all duration-300 ease-in-out bg-white overflow-hidden"
          >
            {/* 题号 */}
            <div className="mt-2.5">
              题目编号: <InputNumber min={1} max={30} defaultValue={1} />
              <Button
                color="primary"
                variant="link"
                onClick={() => {
                  props.setQuestionIds(props.questionIds.filter((id) => id != questionInfo.id));
                }}
              >
                移除
              </Button>
            </div>

            {/* 标题 */}
            <div className="mt-2.5">{<CommonTitle title={questionInfo.title} comment={questionInfo.comment} images={questionInfo.images} />}</div>

            {/* 选项内容 */}
            <div className="mt-2.5">
              {questionInfo.options && questionInfo.options.length > 0 && (
                <CommonSelect optionsLayout={questionInfo.optionsLayout ?? 1} options={questionInfo.options} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
