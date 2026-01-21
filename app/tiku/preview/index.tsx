// 预览
import { Col, Divider, Flex, Image, Row } from "antd";

import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { StringValidator } from "~/util/string";
import type { QuestionBaseInfo } from "~/type/question";
import { CommonTag } from "~/tiku/common/tag";
import { CommonTitle } from "~/common/title";
import { CommonSelect } from "~/common/select";
import type { TextbookOtherDict } from "~/type/textbook";

export default function preview(props: any) {
  const questionTypeList: TextbookOtherDict[] = props.questionTypeList ?? [];
  const questionTagList: TextbookOtherDict[] = props.questionTagList ?? [];
  const questionInfo: QuestionBaseInfo = props.questionInfo ?? {};

  return (
    <div>
      {/* 题型和标签 */}
      {CommonTag(questionInfo, questionTypeList, questionTagList)}

      <Divider
        size="small"
        variant="dashed"
        style={{ borderColor: "#7cb305" }}
        dashed
      />

      {
        <CommonTitle
          title={questionInfo.title}
          comment={questionInfo.comment}
          images={questionInfo.images}
        />
      }

      {/* 选项 */}
      {questionInfo.options && questionInfo.options.length > 0 && (
        <CommonSelect
          optionsLayout={questionInfo.optionsLayout ?? 1}
          options={questionInfo.options}
        />
      )}

      <Divider
        size="small"
        variant="dashed"
        titlePlacement="start"
        style={{ borderColor: "#7cb305" }}
        dashed
      >
        参考答案
      </Divider>

      {/* 参考答案 */}
      <Row gutter={[10, 10]}>
        <Col span={24}>
          {StringValidator.isNonEmpty(questionInfo.answer) && (
            <Markdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {questionInfo.answer}
            </Markdown>
          )}
        </Col>
      </Row>

      <Divider
        size="small"
        variant="dashed"
        titlePlacement="start"
        style={{ borderColor: "#7cb305" }}
        dashed
      >
        知识点
      </Divider>

      {/* 知识点 */}
      <Row gutter={[10, 10]}>
        <Col span={24}>
          {StringValidator.isNonEmpty(questionInfo.knowledge) && (
            <Markdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {questionInfo.knowledge}
            </Markdown>
          )}
        </Col>
      </Row>

      <Divider
        size="small"
        variant="dashed"
        titlePlacement="start"
        style={{ borderColor: "#7cb305" }}
        dashed
      >
        解题分析
      </Divider>

      {/* 解题分析 */}
      <Row gutter={[10, 10]}>
        <Col span={24}>
          {StringValidator.isNonEmpty(questionInfo.analysis?.content) && (
            <Markdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {questionInfo.analysis?.content}
            </Markdown>
          )}
        </Col>
        {/* 如果有图片 */}
        <Col span={24}>
          <Flex gap="small" wrap>
            {questionInfo.analysis?.images?.map((imageName) => {
              return (
                <Image
                  height={200}
                  key={imageName}
                  alt="basic"
                  src={`/api/file/read/${imageName}`}
                />
              );
            })}
          </Flex>
        </Col>
      </Row>

      <Divider
        size="small"
        variant="dashed"
        titlePlacement="start"
        style={{ borderColor: "#7cb305" }}
        dashed
      >
        解题过程
      </Divider>

      {/* 解题过程 */}
      <Row gutter={[10, 10]}>
        <Col span={24}>
          {StringValidator.isNonEmpty(questionInfo.process?.content) && (
            <Markdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {questionInfo.process?.content}
            </Markdown>
          )}
        </Col>
        {/* 如果有图片 */}
        <Col span={24}>
          <Flex gap="small" wrap>
            {questionInfo.process?.images?.map((imageName) => {
              return (
                <Image
                  height={200}
                  key={imageName}
                  alt="basic"
                  src={`/api/file/read/${imageName}`}
                />
              );
            })}
          </Flex>
        </Col>
      </Row>

      <Divider
        size="small"
        variant="dashed"
        titlePlacement="start"
        style={{ borderColor: "#7cb305" }}
        dashed
      >
        备注
      </Divider>

      {/* 备注 */}
      <Row gutter={[10, 10]}>
        <Col span={24}>
          {StringValidator.isNonEmpty(questionInfo.remark) && (
            <Markdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {questionInfo.remark}
            </Markdown>
          )}
        </Col>
      </Row>

      <Divider
        size="small"
        variant="dashed"
        titlePlacement="start"
        style={{ borderColor: "#7cb305" }}
        dashed
      />
    </div>
  );
}
