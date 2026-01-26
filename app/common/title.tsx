import { Col, Flex, Row, Image } from "antd";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { StringValidator } from "~/util/string";

interface TitleProps {
  no?: number; // 显示题号-一般试卷用
  id?: number; // 显示题目id-普通列表用
  title: string;
  comment: string;
  images?: string[];
}

// 标题展示通用样式
export function CommonTitle(props: TitleProps) {
  // 存在有效题号时展示题号
  const showNo = props.no ? `${props.no}&#46; ` : "";
  const showId = props.id ? `ID: [${props.id}] ` : "";

  return (
    <Row gutter={[10, 10]}>
      <Col span={24}>
        {StringValidator.isNonEmpty(props.title) && (
          <Markdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
            {`${showNo}${showId}${props.title}`}
          </Markdown>
        )}
      </Col>
      {/* 标注 */}
      {StringValidator.isNonEmpty(props.comment) && (
        <Col span={24} className="text-[10px] italic text-blue-950">
          <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {props.comment}
          </Markdown>
        </Col>
      )}

      {/* 如果有图片 */}
      {props.images && props.images.length > 0 && (
        <Col span={24}>
          <Flex gap="small" wrap>
            {props.images.map((imageName) => {
              return (
                <div key={imageName} style={{ width: 200, height: 200, overflow: "hidden" }}>
                  <Image width="100%" height="100%" style={{ objectFit: "cover" }} alt="basic" src={`/api/file/read/${imageName}`} />
                </div>
              );
            })}
          </Flex>
        </Col>
      )}
    </Row>
  );
}
