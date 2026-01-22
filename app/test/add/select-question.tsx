import {
  Alert,
  Cascader,
  Checkbox,
  Divider,
  Form,
  Modal,
  Radio,
  Select,
  Table,
  type CascaderProps,
  type GetProp,
  type RadioChangeEvent,
  type TableColumnsType,
} from "antd";
import React, { useEffect, useState } from "react";
import { CommonSelect } from "~/common/select";
import { CommonTitle } from "~/common/title";
import type { QuestionListReq, QuestionListResp } from "~/type/question";
import type { Textbook, TextbookOption, TextbookOtherDict } from "~/type/textbook";
import { httpClient } from "~/util/http";
import { StringConst, StringConstUtil } from "~/util/string";

interface SelectQuestionProps {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  textbookOptions: TextbookOption[];
  optionInit: Textbook;
  selectOption: Textbook;
  setSelectOption: (value: Textbook) => void;
  questionTypeList: TextbookOtherDict[];
  questionTagList: TextbookOtherDict[];
  questionIds: number[];
  setQuestionIds: (value: number[]) => void;
}

// 挑选题目弹框
export default function SelectQuestionModal(props: SelectQuestionProps) {
  // 选题弹框
  const handleOk = () => {
    props.setIsModalOpen(false);
  };
  const handleCancel = () => {
    props.setIsModalOpen(false);
  };

  // 题目来源
  const [sourceVal, setSourceVal] = useState<string>(StringConstUtil.tikuSourceList[0].value);
  const onSourceChange = (value: string) => {
    setSourceVal(value);
  };

  // 选择教材章节和知识点
  const onSelectOptionChange: CascaderProps<TextbookOption>["onChange"] = (_, selectedOptions) => {
    if (selectedOptions === undefined) {
      props.setSelectOption(props.optionInit);
      return;
    }
    props.setSelectOption(selectedOptions[selectedOptions.length - 1].raw);
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

  // 题目列表分页
  const [pageNo, setPageNo] = useState<number>(1);
  const pageSize: number = 5;
  const [questListResTotal, setQuestListResTotal] = useState<number>(0);

  // 表格显示处理
  interface DataType {
    key: React.Key;
    title: React.ReactNode;
  }
  const columns: TableColumnsType<DataType> = [{ title: "标题", dataIndex: "title" }];

  // 题目列表
  const [reqQuestListErr, setReqQuestListErr] = useState<React.ReactNode>(null);
  const [questionListResp, setQuestionListResp] = useState<DataType[]>([]);

  // 监听教材章节选择题目列表
  useEffect(() => {
    // 教材章节或知识点题目列表
    if (StringConst.tiKuChapterOrKnowledgeSourceVal === sourceVal) {
      if (props.selectOption.id <= 0) {
        setQuestListResTotal(0);
        return;
      }

      const questionListReq: QuestionListReq = {
        questionCateId: props.selectOption.id,
        pageNo: pageNo,
        pageSize: pageSize,
      };
      if (questionTypeVal > 0) {
        questionListReq.questionTypeId = questionTypeVal;
      }
      httpClient
        .post<QuestionListResp>("/question/list", questionListReq)
        .then((res) => {
          if (reqQuestListErr) {
            setReqQuestListErr("");
          }

          // 分页填充Table表格内容
          setQuestionListResp(
            res.list.map((questionInfo) => ({
              key: questionInfo.id,
              title: (
                <div
                  key={questionInfo.id}
                  className="group relative p-4 pb-4 hover:pb-2.5 border border-transparent hover:border-blue-500 transition-all duration-300 ease-in-out bg-white overflow-hidden"
                >
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
              ),
            })),
          );

          setQuestListResTotal(res.total);
        })
        .catch((err) => {
          setReqQuestListErr(<Alert title="Error" description={`读取题目列表出错: ${err.message}`} type="error" showIcon />);
        });
    } else {
      setQuestionListResp([]);
      setQuestListResTotal(0);
    }
  }, [sourceVal, props.selectOption, questionTypeVal, tagsVal, pageNo]);

  return (
    <Modal
      title="挑选题目"
      width={1200}
      closable={{ "aria-label": "Custom Close Button" }}
      open={props.isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
    >
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

        <Divider size="small" />

        {/* 题目列表 */}
        <div>
          {reqQuestListErr}

          {/* Table 组件能处理分页后其它页面的选择问题 */}
          <Table
            dataSource={questionListResp}
            columns={columns}
            rowSelection={{
              selectedRowKeys: props.questionIds,
              onChange: (keys) => {
                props.setQuestionIds(keys as number[]);
                if (keys.length > StringConst.tikuMaxNum) {
                  setReqQuestListErr(<Alert title="Error" description="每种题型最多只能选择30个题目" type="error" showIcon />);
                }
              },
              preserveSelectedRowKeys: true, // 核心：即使 data 变了，之前的选中 ID 也会保留
            }}
            pagination={{
              current: pageNo,
              total: questListResTotal,
              pageSize: 5,
              // 切换页码时触发
              onChange: (page) => {
                setPageNo(page);
              },
            }}
          />
        </div>
      </Form>
    </Modal>
  );
}
