import React, {type Dispatch, type SetStateAction, useState} from "react";
import {Alert, Button, Col, Flex, Radio, type RadioChangeEvent, Row} from "antd";
import {httpClient} from "~/util/http";
import type {EditQuestionType} from "~/type/edit";
import {StringUtil} from "~/util/string";
import type {TextbookOtherDict} from "~/type/textbook";

// 题目问题类型基础样式
export function EditQuestionType(
  questionTypeList: TextbookOtherDict[] = [],
  questionTypeVal: number,
  setQuestionTypeVal: React.Dispatch<React.SetStateAction<number>>,
  setShowEditQuestionType?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  if (!questionTypeList.length) {
    return <Alert
      title="Warning"
      description="问题类型为空"
      type="warning"
      showIcon
      closable
    />
  }
  const onEditQuestionsChange = ({target: {value}}: RadioChangeEvent) => {
    setQuestionTypeVal(Number(value));
    if (setShowEditQuestionType) {
      setShowEditQuestionType(true);
    }
  };

  return <Radio.Group
    defaultValue={questionTypeVal}
    buttonStyle="solid"
    onChange={onEditQuestionsChange}
  >
    {questionTypeList.map(item => {
      return (
        <Radio.Button key={item.id} value={item.id}>
          {item.itemValue}
        </Radio.Button>
      );
    })}
  </Radio.Group>
}

// 添加题目时题目类型样式
export function AddQuestionTypeStyle(
  questionTypeList: TextbookOtherDict[] = [],
  questionTypeVal: number,
  setQuestionTypeVal: React.Dispatch<React.SetStateAction<number>>,
  setShowEditQuestionType?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  return <Row gutter={[10, 10]}>
    <Col span={24}>
      <div className="text-blue-700 text-[15px] mb-2.5 font-bold">题型</div>
      <Flex vertical gap="middle">
        {EditQuestionType(questionTypeList, questionTypeVal, setQuestionTypeVal, setShowEditQuestionType)}
      </Flex>
    </Col>
  </Row>
}

// 编辑题目时题目类型样式
export function EditQuestionTypeStyle(
  questionTypeList: TextbookOtherDict[] = [],
  questionTypeVal: number,
  setQuestionTypeVal: React.Dispatch<React.SetStateAction<number>>,
  id: number,
  setRefreshListNum: Dispatch<SetStateAction<number>>,
) {
  const [showEditQuestionTypeErr, setShowEditQuestionTypeErr] = useState<React.ReactNode>("");
  const [showEditQuestionType, setShowEditQuestionType] = useState<boolean>(false);

  const updateQuestionType = () => {
    const req: EditQuestionType = {
      id,
      questionType: questionTypeVal,
    };
    httpClient.post("/edit/question-type", req).then(res => {
      setShowEditQuestionTypeErr("");
      setShowEditQuestionType(false);
      setRefreshListNum(StringUtil.getRandomInt());
    }).catch(err => {
      setShowEditQuestionTypeErr(<div>
        <Alert title={`更新问题类型出错: ${err.message}`} type={"error"}/>
      </div>);
    })
  }

  const showEditQuestionTypeArea = <div className="mt-2.5">
    <Flex gap="small" wrap justify={"right"}>
      <Button color="cyan" variant="dashed" onClick={updateQuestionType}>更新</Button>
    </Flex>
  </div>

  return <div className="p-2.5 hover:border border-red-700 border-dashed">
    <div>
      {AddQuestionTypeStyle(questionTypeList, questionTypeVal, setQuestionTypeVal, setShowEditQuestionType)}
    </div>
    {showEditQuestionTypeErr}
    {showEditQuestionType && showEditQuestionTypeArea}
  </div>
}
