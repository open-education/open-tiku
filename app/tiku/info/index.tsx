// 题目详情页面
import { Col, Divider, Flex, Image, Row } from "antd";

import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import type { QuestionInfoResp } from "~/type/question";
import { StringUtil, StringValidator } from "~/util/string";
import { CommonTag } from "~/tiku/common/tag";
import { CommonTitle } from "~/common/title";
import { CommonSelect } from "~/common/select";
import { useLocation, useOutletContext } from "react-router-dom";
import type { TiKuIndexContext } from "~/type/context";
import { CommonBreadcrumb } from "~/tiku/common/breadcrumb";
import type { Textbook, TextbookOtherDict } from "~/type/textbook";

// 题目详情
export default function Info(props: any) {
  const { pathMap } = useOutletContext<TiKuIndexContext>();
  const location = useLocation();
  const pathname = StringUtil.getLastPart(location.pathname, "/");

  const questionTypeList: TextbookOtherDict[] = props.questionTypeList ?? [];
  const questionTagList: TextbookOtherDict[] = props.questionTagList ?? [];
  const childPathMap: Map<number, Textbook[]> = props.childPathMap ?? [];
  const questionInfo: QuestionInfoResp = props.questionInfo;

  return (
    <div>
      <Row gutter={[10, 10]}>
        <Col span={24}>
          {/* 面包屑快速导航 */}
          {CommonBreadcrumb(
            pathMap,
            pathname,
            childPathMap,
            questionInfo.baseInfo.questionCateId,
          )}
        </Col>
      </Row>

      {/* 题型和标签 */}
      {CommonTag(questionInfo.baseInfo, questionTypeList, questionTagList)}

      <Divider
        size="small"
        variant="dashed"
        style={{ borderColor: "#7cb305" }}
        dashed
      />

      {/* 题目标注和图片位置 */}
      {
        <CommonTitle
          title={questionInfo.baseInfo.title}
          comment={questionInfo.baseInfo.comment}
          images={questionInfo.baseInfo.images}
        />
      }

      {/* 选项 */}
      {questionInfo.baseInfo.options &&
        questionInfo.baseInfo.options.length > 0 && (
          <CommonSelect
            optionsLayout={questionInfo.baseInfo.optionsLayout ?? 1}
            options={questionInfo.baseInfo.options}
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
      <Row>
        <Col span={24}>
          {StringValidator.isNonEmpty(questionInfo.extraInfo.answer) && (
            <Markdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {questionInfo.extraInfo.answer}
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
      <Row>
        <Col span={24}>
          {StringValidator.isNonEmpty(questionInfo.extraInfo.knowledge) && (
            <Markdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {questionInfo.extraInfo.knowledge}
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
      <Row>
        <Col span={24}>
          {StringValidator.isNonEmpty(
            questionInfo.extraInfo.analysis?.content,
          ) && (
            <Markdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {questionInfo.extraInfo.analysis?.content}
            </Markdown>
          )}
        </Col>
        {/* 如果有图片 */}
        <Col span={24}>
          <Flex gap="small" wrap>
            {questionInfo.extraInfo.analysis?.images?.map((imageName) => {
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
      <Row>
        <Col span={24}>
          {StringValidator.isNonEmpty(
            questionInfo.extraInfo.process?.content,
          ) && (
            <Markdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {questionInfo.extraInfo.process?.content}
            </Markdown>
          )}
        </Col>
        {/* 如果有图片 */}
        <Col span={24}>
          <Flex gap="small" wrap>
            {questionInfo.extraInfo.process?.images?.map((imageName) => {
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
      <Row>
        <Col span={24}>
          {StringValidator.isNonEmpty(questionInfo.extraInfo.remark) && (
            <Markdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {questionInfo.extraInfo.remark}
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
