import {
  Alert,
  Cascader,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Radio,
  Row,
  Select,
  type CascaderProps,
  type GetProp,
  type GetProps,
  type RadioChangeEvent,
} from "antd";
import React, { useEffect, useState } from "react";
import { CommonSelect } from "~/common/select";
import { CommonTitle } from "~/common/title";
import type { QuestionListReq, QuestionListResp } from "~/type/question";
import type { Textbook, TextbookOption, TextbookOtherDict } from "~/type/textbook";
import { httpClient } from "~/util/http";
import { StringConst, StringConstUtil } from "~/util/string";
import { CommonTag } from "~/common/tag";
import type { SelectQuestionIds } from "~/type/test";

type SearchProps = GetProps<typeof Input.Search>;

const { Search } = Input;

interface SelectQuestionProps {
  textbookOptions: TextbookOption[];
  setQuestionCateId: (value: number) => void;
  questionTypeList: TextbookOtherDict[];
  questionTagList: TextbookOtherDict[];
  questionIds: SelectQuestionIds;
  setQuestionIds: (value: SelectQuestionIds) => void;
}

// 挑选题目弹框
export default function SelectQuestion(props: SelectQuestionProps) {
  // 题目来源
  const [sourceVal, setSourceVal] = useState<string>(StringConstUtil.tikuSourceList[0].value);
  const onSourceChange = (value: string) => {
    setSourceVal(value);
  };

  // 教材章节和知识点
  const optionInit: Textbook = {
    children: [],
    id: 0,
    key: "",
    label: "",
    parentId: 0,
    pathDepth: 0,
    sortOrder: 0,
  };
  const [selectOption, setSelectOption] = useState<Textbook>(optionInit);

  // 选择教材章节和知识点
  const onSelectOptionChange: CascaderProps<TextbookOption>["onChange"] = (_, selectedOptions) => {
    if (selectedOptions === undefined) {
      setSelectOption(optionInit);
      return;
    }
    const info = selectedOptions[selectedOptions.length - 1].raw;
    setSelectOption(info);
    props.setQuestionCateId(info.id);
  };

  // 题型类型列表
  const [questionTypeVal, setQuestionTypeVal] = useState<number>(props.questionTypeList.length > 0 ? props.questionTypeList[0].id : 0);
  const onQuestionTypeChange = ({ target: { value } }: RadioChangeEvent) => {
    setQuestionTypeVal(Number(value));
  };

  // 选择题目标签
  const [tagsVal, setTagsVal] = useState<number[]>([]);
  const onSelectQuestionTagChange: GetProp<typeof Checkbox.Group, "onChange"> = (checkedValues) => {
    setTagsVal(checkedValues as number[]);
  };

  // 选择题目
  const onSelectQuestionChange: GetProp<typeof Checkbox.Group, "onChange"> = (checkedValues) => {
    props.setQuestionIds({
      ...props.questionIds,
      currentIds: checkedValues as number[],
    });
  };

  // 搜索标题
  const [titleVal, setTitleVal] = useState<string>("");
  const onSearch: SearchProps["onSearch"] = (value, _e, _) => {
    setTitleVal(value);
  };

  // 题目列表
  const [reqQuestListErr, setReqQuestListErr] = useState<React.ReactNode>(null);
  const questionListInit: QuestionListResp = {
    list: [],
    pageNo: 0,
    pageSize: 0,
    total: 0,
  };
  const [questionListResp, setQuestionListResp] = useState<QuestionListResp>(questionListInit);

  // 监听教材章节选择题目列表
  useEffect(() => {
    // 教材章节或知识点题目列表
    if (StringConst.tiKuChapterOrKnowledgeSourceVal === sourceVal) {
      if (selectOption.id <= 0) {
        return;
      }

      const questionListReq: QuestionListReq = {
        questionCateId: selectOption.id,
        pageNo: 1,
        pageSize: 30,
      };
      if (questionTypeVal > 0) {
        questionListReq.questionTypeId = questionTypeVal;
      }
      if (titleVal && titleVal.length > 0) {
        questionListReq.titleVal = titleVal;
      }
      if (tagsVal && tagsVal.length > 0) {
        questionListReq.tagIds = tagsVal;
      }

      httpClient
        .post<QuestionListResp>("/question/list", questionListReq)
        .then((res) => {
          if (reqQuestListErr) {
            setReqQuestListErr("");
          }

          setQuestionListResp(res);
        })
        .catch((err) => {
          setReqQuestListErr(<Alert title="Error" description={`读取题目列表出错: ${err.message}`} type="error" showIcon />);
        });
    } else {
      setQuestionListResp(questionListInit);
    }
  }, [sourceVal, selectOption, questionTypeVal, tagsVal, titleVal]);

  return (
    <div>
      <div>
        <Form labelWrap={true} layout="horizontal" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
          <Form.Item label="题目来源">
            <Select value={sourceVal} onChange={onSourceChange} options={StringConstUtil.tikuSourceList} />
          </Form.Item>

          {/* 选择教材章节或知识点子类名称 */}
          {sourceVal === "1" && (
            <Form.Item label="教材章节或知识点名称">
              <Cascader style={{ width: "100%" }} options={props.textbookOptions} onChange={onSelectOptionChange} placeholder="请选择章节小节名称" />
            </Form.Item>
          )}

          <Form.Item label="选择题型">
            <Radio.Group defaultValue={questionTypeVal} buttonStyle="solid" onChange={onQuestionTypeChange}>
              <Radio.Button key={StringConst.listSelectAll} value={StringConst.listSelectAll}>
                {StringConst.listSelectAllDesc}
              </Radio.Button>
              {props.questionTypeList.map((item) => {
                return (
                  <Radio.Button key={item.id} value={item.id}>
                    {item.itemValue}
                  </Radio.Button>
                );
              })}
            </Radio.Group>
          </Form.Item>

          <Form.Item label="选择标签">
            <Checkbox.Group onChange={onSelectQuestionTagChange}>
              {props.questionTagList.map((item) => {
                return (
                  <Checkbox value={item.id} key={item.id}>
                    {item.itemValue}
                  </Checkbox>
                );
              })}
            </Checkbox.Group>
          </Form.Item>

          <Form.Item label="标题搜索">
            <Search placeholder="请输入标题关键字" onSearch={onSearch} style={{ width: "50%" }} />
          </Form.Item>
        </Form>
      </div>

      <Divider size="small" />

      {/* 题目列表 */}
      <div>
        {reqQuestListErr}

        {/* 外部组件移除选中的值时该组件未能刷新最新的选中状态 */}
        <Checkbox.Group style={{ width: "100%" }} onChange={onSelectQuestionChange}>
          <Row gutter={[10, 10]} align={"middle"}>
            {questionListResp.list.map((questionInfo) => {
              return (
                <Col span={24} key={questionInfo.id}>
                  {/* Checkbox 的设计问题, 内部无法撑开自动去按内容实际宽度处理, 这些写组件的人真他妈恶心还弱智 */}
                  <Checkbox
                    className="flex w-full items-start mb-4 [&>span:last-child]:flex-1 [&>span:last-child]:w-0"
                    style={{ marginInlineStart: 0 }}
                    value={questionInfo.id}
                  >
                    <div className="group relative p-4 pb-4 hover:pb-2.5 border border-transparent hover:border-blue-500 transition-all duration-300 ease-in-out bg-white overflow-hidden">
                      {/* 标签 */}
                      <div className="mt-2.5">
                        <CommonTag
                          questionTypeList={props.questionTypeList}
                          questionTagList={props.questionTagList}
                          questionTypeId={questionInfo.questionTypeId}
                          questionTagIds={questionInfo.questionTagIds ?? []}
                          difficultyLevel={questionInfo.difficultyLevel}
                        />
                      </div>

                      {/* 标题 */}
                      <div className="mt-2.5">
                        {<CommonTitle title={questionInfo.title} comment={questionInfo.comment} images={questionInfo.images} />}
                      </div>

                      {/* 选项内容 */}
                      <div className="mt-2.5">
                        {questionInfo.options && questionInfo.options.length > 0 && (
                          <CommonSelect optionsLayout={questionInfo.optionsLayout ?? 1} options={questionInfo.options} />
                        )}
                      </div>
                    </div>
                  </Checkbox>
                </Col>
              );
            })}
          </Row>
        </Checkbox.Group>
      </div>
    </div>
  );
}
