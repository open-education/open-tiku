import React, { useState } from "react";
import {
  Alert,
  Button,
  Col,
  Flex,
  Radio,
  type RadioChangeEvent,
  Row,
} from "antd";
import { httpClient } from "~/util/http";
import type { EditQuestionType } from "~/type/edit";
import { StringUtil } from "~/util/string";
import type { TextbookOtherDict } from "~/type/textbook";

interface QuestionTypeProps {
  typeList: TextbookOtherDict[];
  typeVal: number;
  setTypeVal: (value: number) => void;
  onStartEdit?: (value: boolean) => void;
}

// 题目问题类型基础样式
export function EditQuestionType(props: QuestionTypeProps) {
  if (!props.typeList.length) {
    return (
      <Alert
        title="Warning"
        description="问题类型为空"
        type="warning"
        showIcon
        closable
      />
    );
  }
  const onEditQuestionsChange = ({ target: { value } }: RadioChangeEvent) => {
    props.setTypeVal(Number(value));
    props.onStartEdit?.(value);
  };

  return (
    <Radio.Group
      defaultValue={props.typeVal}
      buttonStyle="solid"
      onChange={onEditQuestionsChange}
    >
      {props.typeList?.map((item) => {
        return (
          <Radio.Button key={item.id} value={item.id}>
            {item.itemValue}
          </Radio.Button>
        );
      })}
    </Radio.Group>
  );
}

interface AddQuestionTypeProps {
  typeList: TextbookOtherDict[];
  typeVal: number;
  setTypeVal: (value: number) => void;
  onStartEdit?: (value: boolean) => void;
}

// 添加题目时题目类型样式
export function AddQuestionTypeStyle(props: AddQuestionTypeProps) {
  return (
    <Row gutter={[10, 10]}>
      <Col span={24}>
        <div className="text-blue-700 text-[15px] mb-2.5 font-bold">题型</div>
        <Flex vertical gap="middle">
          {
            <EditQuestionType
              typeList={props.typeList}
              typeVal={props.typeVal}
              setTypeVal={props.setTypeVal}
              onStartEdit={props.onStartEdit}
            />
          }
        </Flex>
      </Col>
    </Row>
  );
}

interface EditQuestionTypeProps {
  typeList: TextbookOtherDict[];
  typeVal: number;
  setTypeVal: (value: number) => void;
  id: number;
  setRefreshListNum: (value: number) => void;
}

// 编辑题目时题目类型样式
export function EditQuestionTypeStyle(props: EditQuestionTypeProps) {
  const [showEditQuestionTypeErr, setShowEditQuestionTypeErr] =
    useState<React.ReactNode>("");
  const [showEditQuestionType, setShowEditQuestionType] =
    useState<boolean>(false);

  const updateQuestionType = () => {
    const req: EditQuestionType = {
      id: props.id,
      questionType: props.typeVal,
    };
    httpClient
      .post("/edit/question-type", req)
      .then((res) => {
        setShowEditQuestionTypeErr("");
        setShowEditQuestionType(false);
        props.setRefreshListNum(StringUtil.getRandomInt());
      })
      .catch((err) => {
        setShowEditQuestionTypeErr(
          <div>
            <Alert title={`更新问题类型出错: ${err.message}`} type={"error"} />
          </div>,
        );
      });
  };

  const showEditQuestionTypeArea = (
    <div className="mt-2.5">
      <Flex gap="small" wrap justify={"right"}>
        <Button color="cyan" variant="dashed" onClick={updateQuestionType}>
          更新
        </Button>
      </Flex>
    </div>
  );

  return (
    <div className="p-2.5 hover:border border-red-700 border-dashed">
      <div>
        {
          <AddQuestionTypeStyle
            typeList={props.typeList}
            typeVal={props.typeVal}
            setTypeVal={props.setTypeVal}
            onStartEdit={setShowEditQuestionType}
          />
        }
      </div>
      {showEditQuestionTypeErr}
      {showEditQuestionType && showEditQuestionTypeArea}
    </div>
  );
}
