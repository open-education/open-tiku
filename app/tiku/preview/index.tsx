// 预览
import {Col, Divider, Row} from "antd";

import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import {StringValidator} from "~/util/string";
import type {QuestionInfo} from "~/type/question";
import {useOutletContext} from "react-router-dom";
import type {TiKuIndexContext} from "~/type/context";
import {CommonTag} from "~/tiku/common/tag";
import {CommonTitle} from "~/tiku/common/title";
import {CommonSelect} from "~/tiku/common/select";

export default function preview(props: any) {
    const {questionTypeList, tagList} = useOutletContext<TiKuIndexContext>();
    const questionInfo: QuestionInfo = props.questionInfo;

    return <div>
        {/* 题型和标签 */}
        {CommonTag(questionInfo, questionTypeList, tagList)}

        <Divider
            size="small"
            variant="dashed"
            style={{borderColor: "#7cb305"}}
            dashed
        />

        {/* 题目标注和图片位置 */}
        {CommonTitle(questionInfo)}

        {/* 选项 */}
        {CommonSelect(questionInfo)}

        <Divider
            size="small"
            variant="dashed"
            titlePlacement="start"
            style={{borderColor: "#7cb305"}}
            dashed
        >
            参考答案
        </Divider>

        {/* 参考答案 */}
        <Row gutter={[10, 10]}>
            <Col span={24}>
                {
                    StringValidator.isNonEmpty(questionInfo.answerVal) &&
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {questionInfo.answerVal}
                    </Markdown>
                }
            </Col>
        </Row>

        <Divider
            size="small"
            variant="dashed"
            titlePlacement="start"
            style={{borderColor: "#7cb305"}}
            dashed
        >
            知识点
        </Divider>

        {/* 知识点 */}
        <Row gutter={[10, 10]}>
            <Col span={24}>
                {
                    StringValidator.isNonEmpty(questionInfo.knowledgeVal) &&
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {questionInfo.knowledgeVal}
                    </Markdown>
                }
            </Col>
        </Row>

        <Divider
            size="small"
            variant="dashed"
            titlePlacement="start"
            style={{borderColor: "#7cb305"}}
            dashed
        >
            解题分析
        </Divider>

        {/* 解题分析 */}
        <Row gutter={[10, 10]}>
            <Col span={24}>
                {
                    StringValidator.isNonEmpty(questionInfo.analyzeVal) &&
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {questionInfo.analyzeVal}
                    </Markdown>
                }
            </Col>
        </Row>

        <Divider
            size="small"
            variant="dashed"
            titlePlacement="start"
            style={{borderColor: "#7cb305"}}
            dashed
        >
            解题过程
        </Divider>

        {/* 解题过程 */}
        <Row gutter={[10, 10]}>
            <Col span={24}>
                {
                    StringValidator.isNonEmpty(questionInfo.processVal) &&
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {questionInfo.processVal}
                    </Markdown>
                }
            </Col>
        </Row>

        <Divider
            size="small"
            variant="dashed"
            titlePlacement="start"
            style={{borderColor: "#7cb305"}}
            dashed
        >
            备注
        </Divider>

        {/* 备注 */}
        <Row gutter={[10, 10]}>
            <Col span={24}>
                {
                    StringValidator.isNonEmpty(questionInfo.remarkVal) &&
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {questionInfo.remarkVal}
                    </Markdown>
                }
            </Col>
        </Row>

        <Divider
            size="small"
            variant="dashed"
            titlePlacement="start"
            style={{borderColor: "#7cb305"}}
            dashed
        />
    </div>
}
