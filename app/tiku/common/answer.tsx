import React, {type Dispatch, type SetStateAction, useCallback} from "react";
import {Alert, Button, Col, Flex, Input, Row} from "antd";
import type {EditAnswer} from "~/type/edit";
import type {QuestionInfo} from "~/type/question";
import {httpClient} from "~/util/http";
import {StringUtil} from "~/util/string";

const {TextArea} = Input;

export function AnswerInfo(
  answerVal: string,
  setAnswerVal: React.Dispatch<React.SetStateAction<string>>,
  setShowEditAnswer?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const onEditAnswerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setAnswerVal(e.target.value);
      if (setShowEditAnswer) {
        setShowEditAnswer(true);
      }
    },
    []
  );

  return <TextArea
    autoSize={{minRows: 3, maxRows: 7}}
    placeholder="请输入参考答案"
    onChange={onEditAnswerChange}
    name="answer"
    value={answerVal}
  />
}

export function AddAnswerInfoStyle(
  answerVal: string,
  setAnswerVal: React.Dispatch<React.SetStateAction<string>>,
  setShowEditAnswer?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  return <Row gutter={[10, 10]}>
    <Col span={24}>
      <div className="text-blue-700 text-[15px] mb-[10px] font-bold">参考答案</div>
      {AnswerInfo(answerVal, setAnswerVal, setShowEditAnswer)}
    </Col>
  </Row>
}

export function EditAnswerInfoStyle(
  answerVal: string,
  setAnswerVal: React.Dispatch<React.SetStateAction<string>>,
  questionInfo: QuestionInfo,
  setRefreshListNum: Dispatch<SetStateAction<number>>,
) {
  const [showEditAnswer, setShowEditAnswer] = React.useState(false);
  const [showEditAnswerErr, setShowEditAnswerErr] = React.useState<React.ReactNode>("");

  const updateAnswerVal = () => {
    const req: EditAnswer = {
      textbookKey: questionInfo.textbookKey,
      catalogKey: questionInfo.catalogKey,
      id: questionInfo.id,
      answer: answerVal,
    }
    httpClient.post("/edit/answer", req).then((res) => {
      setShowEditAnswerErr("");
      setShowEditAnswer(false);
      setRefreshListNum(StringUtil.getRandomInt());
    }).catch(err => {
      setShowEditAnswerErr(<div>
        <Alert title={`更新答案出错: ${err.message}`} type={"error"}/>
      </div>);
    })
  }

  const showEditAnswerArea = <div className="mt-2.5">
    <Flex gap="small" wrap justify={"right"}>
      <Button color="cyan" variant="dashed" onClick={updateAnswerVal}>更新</Button>
    </Flex>
  </div>

  return <div className="p-2.5 hover:border border-red-700 border-dashed">
    <div>
      {AddAnswerInfoStyle(answerVal, setAnswerVal, setShowEditAnswer)}
    </div>
    {showEditAnswerErr}
    {showEditAnswer && showEditAnswerArea}
  </div>
}
