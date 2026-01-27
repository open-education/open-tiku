import { Col, Flex, Row, Tag } from "antd";
import type { TextbookOtherDict } from "~/type/textbook";
import { arrayToDict } from "~/util/common";
import { StarFilled } from "@ant-design/icons";

interface TagProps {
  questionTypeList: TextbookOtherDict[];
  questionTagList: TextbookOtherDict[];
  questionTypeId: number;
  questionTagIds: number[];
  difficultyLevel: number;
}

// 题目列表展示标签样式 题目类型在前 标签依次在后
export function CommonTag(props: TagProps) {
  const questionTypeDict = arrayToDict(props.questionTypeList, "id");
  const tagsDict = arrayToDict(props.questionTagList, "id");
  return (
    <Row gutter={[10, 10]}>
      <Col span={24}>
        <Flex gap="small" wrap>
          <Tag color="geekblue" key={props.questionTypeId}>
            {questionTypeDict[props.questionTypeId].itemValue}
          </Tag>
          {props.questionTagIds?.map((tagKey) => {
            return (
              <Tag color="green" key={tagKey}>
                {tagsDict[tagKey].itemValue}
              </Tag>
            );
          })}
          <Tag color="red">
            {props.difficultyLevel} <StarFilled style={{ color: "green" }} />
          </Tag>
        </Flex>
      </Col>
    </Row>
  );
}
