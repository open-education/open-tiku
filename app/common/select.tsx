import { Col, Row, Image } from "antd";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import type { QuestionOption } from "~/type/question";
import { StringValidator } from "~/util/string";

// 选择题的一个展示样式
interface SingleSelectProps {
  label: string;
  content: string;
  images?: string[];
}
function SingleSelect(props: SingleSelectProps) {
  return (
    <Row gutter={[10, 10]} align={"middle"}>
      <Col span={0.5}>{props.label}.</Col>
      <Col span={23.5}>
        {/* 一般来说内容和图片不会同时出现, 如果存在再重新设计样式 */}
        {StringValidator.isNonEmpty(props.content) && (
          <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {props.content}
          </Markdown>
        )}
        {/* 图片, 目前先不处理标签和图片同时存在的情况 */}
        {props.images?.map((imageName) => {
          return (
            <div
              key={imageName}
              style={{ width: 200, height: 200, overflow: "hidden" }}
            >
              <Image
                width="100%"
                height="100%"
                style={{ objectFit: "cover" }}
                alt="basic"
                src={`/api/file/read/${imageName}`}
              />
            </div>
          );
        })}
      </Col>
    </Row>
  );
}

interface OptionProps {
  optionsLayout: number;
  options: QuestionOption[];
}

// 选择题样式
export function CommonSelect(props: OptionProps) {
  const showSelectVal: number = props.optionsLayout ?? 1;

  if (showSelectVal === 1) {
    return (
      <Row gutter={[10, 10]} align={"middle"}>
        {props.options?.map((item) => {
          return (
            <Col span={6} key={item.label}>
              <SingleSelect
                label={item.label}
                content={item.content}
                images={item.images}
              />
            </Col>
          );
        })}
      </Row>
    );
  } else if (showSelectVal === 2) {
    return (
      <Row gutter={[10, 10]} align={"middle"}>
        {props.options?.map((item) => {
          return (
            <Col span={24} key={item.label}>
              <SingleSelect
                label={item.label}
                content={item.content}
                images={item.images}
              />
            </Col>
          );
        })}
      </Row>
    );
  } else {
    // 将数组分成两部分, 5各选项的如果后续需要再调整样式, 5个选项一般选择一列的样式应该是最好的
    const options: QuestionOption[] = props.options ?? [];
    if (options.length === 0) {
      return "";
    }

    const mid = Math.floor(options.length / 2);
    const firstHalf = options.slice(0, mid);
    const secondHalf = options.slice(mid);

    return (
      <Row gutter={[10, 10]} align={"middle"}>
        <Col span={24}>
          <Row gutter={[10, 10]} align={"middle"}>
            {firstHalf.map((item) => {
              return (
                <Col span={12} key={item.label}>
                  <SingleSelect
                    label={item.label}
                    content={item.content}
                    images={item.images}
                  />
                </Col>
              );
            })}
          </Row>
        </Col>
        <Col span={24}>
          <Row gutter={[10, 10]} align={"middle"}>
            {secondHalf.map((item) => {
              return (
                <Col span={12} key={item.label}>
                  <SingleSelect
                    label={item.label}
                    content={item.content}
                    images={item.images}
                  />
                </Col>
              );
            })}
          </Row>
        </Col>
      </Row>
    );
  }
}
