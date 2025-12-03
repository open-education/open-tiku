// 题目编辑主页
import React, {useState} from "react";
import {useOutletContext} from "react-router-dom";
import type {TiKuIndexContext} from "~/type/context";
import {Button, Col, Flex, Row, Splitter, Watermark} from "antd";
import {CommonBreadcrumb} from "~/tiku/common/breadcrumb";
import Preview from "~/tiku/preview";
import {EditQuestionTypeStyle} from "~/tiku/common/question-type";
import type {QuestionInfo} from "~/type/question";
import {EditTagStyle} from "~/tiku/common/tag";

export default function Edit(props: any) {
    const {
        textbookKey,
        catalogKey,
        subjectList,
        catalogList,
        questionTypeList,
        tagList
    } = useOutletContext<TiKuIndexContext>();

    const reqQuestionInfo: QuestionInfo = props.questionInfo;

    // 题目类型
    const [questionTypeVal, setQuestionTypeVal] = useState<string>(reqQuestionInfo.questionType);

    // 题目标签
    const [tagListVal, setTagListVal] = useState<string[]>(reqQuestionInfo.tags ?? []);

    // 生成预览对象
    const [openPreviewArea, setOpenPreviewArea] = useState(false);
    let [previewQuestionInfo, setPreviewQuestionInfo] = useState({});

    return <div>
        <Row>
            <Col span={24}>
                {/* 面包屑快速导航 */}
                {CommonBreadcrumb(subjectList, catalogList, textbookKey, catalogKey)}
            </Col>
        </Row>

        <div className="mt-2.5 text-blue-700">
            <p>编辑方式： </p>
            <p>1. 鼠标移动到区块上会浮动出虚线边框表示该块内容的范围，直接调整要变更的内容后单击更新即可.</p>
            <p>2. 如果变更了内容但是又不想更新, 不点击 更新 按钮即可, 但是预览还是你当前选择的效果，不会主动保存.</p>
        </div>

        <Row gutter={[20, 20]}>
            <Col span={24}>
                {/*{uploadQuestionIng}*/}
                {/*{uploadQuestionErr}*/}
                {/*{reqQuestionInfoErr}*/}
            </Col>
        </Row>

        <Row style={{marginTop: "20px"}}>
            <Col>
                <Flex gap="small" wrap>
                    <Button type="dashed">
                        预览
                    </Button>
                </Flex>
            </Col>
        </Row>

        <Splitter
            style={{boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", marginTop: "10px"}}
        >
            <Splitter.Panel defaultSize={"50%"}>
                {/* 题目类型 */}
                {EditQuestionTypeStyle(questionTypeList, questionTypeVal, setQuestionTypeVal)}

                {/* 题目标签 */}
                {EditTagStyle(tagList, tagListVal, setTagListVal)}
            </Splitter.Panel>

            <Splitter.Panel defaultSize="50%">
                <Watermark content="预览区域 仅展示效果">
                    <div className="min-h-[1900px] p-5">
                        {openPreviewArea ?
                            <Preview questionInfo={previewQuestionInfo}/> : ""}
                    </div>
                </Watermark>
            </Splitter.Panel>
        </Splitter>
    </div>
};
