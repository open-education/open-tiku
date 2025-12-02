// 选项风格
import type {QuestionInfo} from "~/type/question";
import {Col, Row} from "antd";
import {StringValidator} from "~/util/string";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export function CommonSelect(questionInfo: QuestionInfo) {
    const showSelectVal = questionInfo.showSelectVal;
    if (showSelectVal === "1") {
        return <Row gutter={[10, 10]}>
            <Col span={6}>
                {
                    StringValidator.isNonEmpty(questionInfo.aVal) && <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.aVal}
                    </Markdown>
                }
            </Col>
            <Col span={6}>
                {
                    StringValidator.isNonEmpty(questionInfo.bVal) && <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.bVal}
                    </Markdown>
                }
            </Col>
            <Col span={6}>
                {
                    StringValidator.isNonEmpty(questionInfo.cVal) && <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.cVal}
                    </Markdown>
                }
            </Col>
            <Col span={6}>
                {
                    StringValidator.isNonEmpty(questionInfo.dVal) && <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.dVal}
                    </Markdown>
                }
            </Col>
        </Row>
    } else if (showSelectVal === "2") {
        return <Row gutter={[10, 10]}>
            <Col span={24}>
                {
                    StringValidator.isNonEmpty(questionInfo.aVal) && <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.aVal}
                    </Markdown>
                }
            </Col>
            <Col span={24}>
                {
                    StringValidator.isNonEmpty(questionInfo.bVal) && <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.bVal}
                    </Markdown>
                }
            </Col>
            <Col span={24}>
                {
                    StringValidator.isNonEmpty(questionInfo.cVal) && <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.cVal}
                    </Markdown>
                }
            </Col>
            <Col span={24}>
                {
                    StringValidator.isNonEmpty(questionInfo.dVal) && <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.dVal}
                    </Markdown>
                }
            </Col>
        </Row>
    } else {
        return <Row gutter={[10, 10]}>
            <Col span={24}>
                <Row gutter={[10, 10]}>
                    <Col span={12}>
                        {
                            StringValidator.isNonEmpty(questionInfo.aVal) && <Markdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >
                                {questionInfo.aVal}
                            </Markdown>
                        }
                    </Col>
                    <Col span={12}>
                        {
                            StringValidator.isNonEmpty(questionInfo.bVal) && <Markdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >
                                {questionInfo.bVal}
                            </Markdown>
                        }
                    </Col>
                </Row>
            </Col>
            <Col span={24}>
                <Row gutter={[10, 10]}>
                    <Col span={12}>
                        {
                            StringValidator.isNonEmpty(questionInfo.cVal) && <Markdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >
                                {questionInfo.cVal}
                            </Markdown>
                        }
                    </Col>
                    <Col span={12}>
                        {
                            StringValidator.isNonEmpty(questionInfo.dVal) && <Markdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >
                                {questionInfo.dVal}
                            </Markdown>
                        }
                    </Col>
                </Row>
            </Col>
        </Row>
    }
}