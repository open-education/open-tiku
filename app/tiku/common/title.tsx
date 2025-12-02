// 题目和图片风格
import type {QuestionInfo} from "~/type/question";
import {StringValidator} from "~/util/string";
import {Col, Flex, Image, Row} from "antd";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";

export function CommonTitle(questionInfo: QuestionInfo) {
    const showImageVal = questionInfo.showImageVal;
    // 0 是没有图片和图片在题目下面一致
    if (showImageVal === "0") {
        return <Row gutter={[10, 10]}>
            <Col span={24}>
                {
                    StringValidator.isNonEmpty(questionInfo.titleVal) && <Markdown
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.titleVal}
                    </Markdown>
                }
            </Col>
            {/* 标注 */}
            <Col span={24} className="text-[10px] italic text-blue-950">
                {
                    StringValidator.isNonEmpty(questionInfo.mentionVal) && <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.mentionVal}
                    </Markdown>
                }
            </Col>
            {/* 如果有图片 */}
            <Col span={24}>
                <Flex gap="small" wrap>
                    {questionInfo.imageNames?.map(imageName => {
                        return (
                            <div className="w-[500px]" key={imageName}>
                                <Image alt="basic"
                                       src={`/api/file/read/${questionInfo.textbookKey}/${questionInfo.catalogKey}/${imageName}`}/>
                            </div>
                        );
                    })}
                </Flex>
            </Col>
        </Row>
    } else {
        return <div></div>;
    }
}
