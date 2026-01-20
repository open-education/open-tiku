// 选项风格
import type { QuestionBaseInfoResp, QuestionOption } from "~/type/question";
import {
  Alert,
  Button,
  Col,
  Flex,
  Radio,
  type RadioChangeEvent,
  Row,
  Image,
} from "antd";
import { StringUtil, StringValidator } from "~/util/string";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import React from "react";
import type { EditSelect } from "~/type/edit";
import { httpClient } from "~/util/http";

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
            <Image
              height={200}
              key={imageName}
              alt="basic"
              src={`/api/file/read/${imageName}`}
            />
          );
        })}
      </Col>
    </Row>
  );
}

// 选择题样式
export function CommonSelect(questionInfo: QuestionBaseInfoResp) {
  const showSelectVal: number = questionInfo.optionsLayout ?? 1;

  if (showSelectVal === 1) {
    return (
      <Row gutter={[10, 10]} align={"middle"}>
        {questionInfo.options?.map((item) => {
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
        {questionInfo.options?.map((item) => {
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
    const options: QuestionOption[] = questionInfo.options ?? [];
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

interface AddSelectOptionLayoutProps {
  val: number;
  setVal: (value: number) => void;
  onStartEdit?: (value: boolean) => void;
}

// 选择选项样式
export function AddSelectOptionLayout(props: AddSelectOptionLayoutProps) {
  const onAddSelectChange = (e: RadioChangeEvent) => {
    props.setVal(Number(e.target.value));
    props.onStartEdit?.(true);
  };

  return (
    <Row gutter={[10, 10]}>
      <Col span={24}>
        <div className="text-blue-700 text-[15px] mb-2.5 font-bold">选项</div>
        <Flex vertical gap="small" justify={"right"}>
          <Radio.Group
            value={props.val}
            buttonStyle="solid"
            onChange={onAddSelectChange}
            block
            options={[
              {
                value: 1,
                label: "展示一行",
              },
              {
                value: 2,
                label: "展示一列",
              },
              {
                value: 3,
                label: "展示两列",
              },
            ]}
            optionType="button"
          />
        </Flex>
      </Col>
    </Row>
  );
}

interface EditSelectOptionLayoutProps {
  val: number;
  setVal: (value: number) => void;
  id: number;
  setRefreshListNum: (value: number) => void;
}

// 编辑选项样式
export function EditSelectOptionLayout(props: EditSelectOptionLayoutProps) {
  const [showEditSelect, setShowEditSelect] = React.useState(false);
  const [showEditSelectErr, setShowEditSelectErr] =
    React.useState<React.ReactNode>("");

  const updateSelectVal = () => {
    const req: EditSelect = {
      id: props.id,
      layout: props.val,
    };
    httpClient
      .post("/edit/options-layout", req)
      .then((res) => {
        setShowEditSelectErr("");
        setShowEditSelect(false);
        props.setRefreshListNum(StringUtil.getRandomInt());
      })
      .catch((err) => {
        setShowEditSelectErr(
          <div>
            <Alert title={`更新选项样式出错: ${err.message}`} type={"error"} />
          </div>,
        );
      });
  };

  const showEditSelectArea = (
    <div className="mt-2.5">
      <Flex gap="small" wrap justify={"right"}>
        <Button color="cyan" variant="dashed" onClick={updateSelectVal}>
          更新
        </Button>
      </Flex>
    </div>
  );

  return (
    <div className="p-2.5 hover:border border-red-700 border-dashed">
      <div>
        {
          <AddSelectOptionLayout
            val={props.val}
            setVal={props.setVal}
            onStartEdit={setShowEditSelect}
          />
        }
      </div>
      {showEditSelectErr}
      {showEditSelect && showEditSelectArea}
    </div>
  );
}
