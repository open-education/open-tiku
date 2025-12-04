import type {QuestionType} from "~/type/question";
import React, {useState} from "react";
import {Alert, Button, Col, Flex, Radio, type RadioChangeEvent, Row} from "antd";

// 题目问题类型基础样式
export function EditQuestionType(
    questionTypeList: QuestionType[] = [],
    questionTypeVal: string,
    setQuestionTypeVal: React.Dispatch<React.SetStateAction<string>>,
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
        setQuestionTypeVal(value);
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
                <Radio.Button key={item.key} value={item.key}>
                    {item.label}
                </Radio.Button>
            );
        })}
    </Radio.Group>
}

// 添加题目时题目类型样式
export function AddQuestionTypeStyle(
    questionTypeList: QuestionType[] = [],
    questionTypeVal: string,
    setQuestionTypeVal: React.Dispatch<React.SetStateAction<string>>,
    setShowEditQuestionType?: React.Dispatch<React.SetStateAction<boolean>>,
) {
    return <Row gutter={[10, 10]}>
        <Col span={24}>
            <div className="text-blue-700 text-[15px] mb-[10px] font-bold">题型</div>
            <Flex vertical gap="middle">
                {EditQuestionType(questionTypeList, questionTypeVal, setQuestionTypeVal, setShowEditQuestionType)}
            </Flex>
        </Col>
    </Row>
}

// 编辑题目时题目类型样式
export function EditQuestionTypeStyle(
    questionTypeList: QuestionType[] = [],
    questionTypeVal: string,
    setQuestionTypeVal: React.Dispatch<React.SetStateAction<string>>,
) {
    const [showEditQuestionType, setShowEditQuestionType] = useState<boolean>(false);

    const updateQuestionType = () => {
        alert("Update question type: " + questionTypeVal);
        setShowEditQuestionType(false);
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
        {showEditQuestionType && showEditQuestionTypeArea}
    </div>
}
