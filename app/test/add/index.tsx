import {
  Alert,
  Button,
  Cascader,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Pagination,
  Radio,
  Row,
  Select,
  type CascaderProps,
  type GetProp,
  type RadioChangeEvent,
} from "antd";
import { useEffect, useState } from "react";
import { CommonSelect } from "~/common/select";
import { CommonTitle } from "~/common/title";
import type { QuestionListReq, QuestionListResp } from "~/type/question";
import type { Textbook, TextbookOption, TextbookOtherDict } from "~/type/textbook";
import { httpClient } from "~/util/http";
import { StringConst, StringConstUtil } from "~/util/string";
import "katex/dist/katex.min.css";

const { TextArea } = Input;

// 添加试卷
export default function Add(props: any) {
  // 教材章节和知识点下拉选择原始数据
  const textbookOptions: TextbookOption[] = props.textbookOptions ?? [];
  const questionTypeList: TextbookOtherDict[] = props.questionTypeList ?? [];
  const questionTagList: TextbookOtherDict[] = props.questionTagList ?? [];

  // 组卷规则
  const [ruleVal, setRuleVal] = useState<string>("rule1");
  const onRuleChange = (value: string) => {
    setRuleVal(value);
  };

  // 选题弹框
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // 题目来源
  const [sourceVal, setSourceVal] = useState<string>(StringConstUtil.tikuSourceList[0].value);
  const onSourceChange = (value: string) => {
    setSourceVal(value);
  };

  // 选择教材章节和知识点
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
  const onSelectOptionChange: CascaderProps<TextbookOption>["onChange"] = (_, selectedOptions) => {
    if (selectedOptions === undefined) {
      setSelectOption(optionInit);
      return;
    }
    setSelectOption(selectedOptions[selectedOptions.length - 1].raw);
  };

  // 选择题目
  const [questionIds, setQuestionIds] = useState<number[]>([]);
  const onSelectQuestionChange: GetProp<typeof Checkbox.Group, "onChange"> = (checkedValues) => {
    setQuestionIds(checkedValues as number[]);
  };

  // 题型类型列表
  const [questionTypeVal, setQuestionTypeVal] = useState<number>(questionTypeList.length > 0 ? questionTypeList[0].id : 0);
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
  const onPageChange = (page: number) => {
    setPageNo(page);
  };

  // 题目列表
  const [reqQuestListErr, setReqQuestListErr] = useState<React.ReactNode>(null);
  const questionListInit: QuestionListResp = {
    list: [],
    pageNo: 0,
    pageSize: pageSize,
    total: 0,
  };
  const [questionListResp, setQuestionListResp] = useState<QuestionListResp>(questionListInit);

  // 监听教材章节选择题目列表
  useEffect(() => {
    // 教材章节或知识点题目列表
    if (StringConst.tiKuChapterOrKnowledgeSourceVal === sourceVal) {
      if (selectOption.id <= 0) {
        setQuestionListResp(questionListInit);
        setQuestListResTotal(0);
        return;
      }

      const questionListReq: QuestionListReq = {
        questionCateId: selectOption.id,
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

          setQuestionListResp(res);
          setQuestListResTotal(res.total);
        })
        .catch((err) => {
          setReqQuestListErr(<Alert title="Error" description={`读取题目列表出错: ${err.message}`} type="error" showIcon />);
        });
    } else {
      setQuestionListResp(questionListInit);
      setQuestListResTotal(0);
    }
  }, [sourceVal, selectOption, questionTypeVal, tagsVal, pageNo]);

  return (
    <div className="p-2.5 min-h-screen">
      {/* 组卷说明 */}
      <div>
        <p className="text-blue-700">1. 题型的模式和分配由组卷规则决定, 如果需要其它的模式请配置新的组卷规则;</p>
      </div>

      {/* 组题表单 */}
      <div className="mt-2.5">
        <Form labelWrap={true} layout="horizontal" labelCol={{ span: 2 }} wrapperCol={{ span: 22 }}>
          <Form.Item label="标题" extra="比如 某年某中学某班级xxx册试卷">
            <Input placeholder="请输入试卷标题" />
          </Form.Item>

          <Form.Item label="组卷规则">
            <Select
              value={ruleVal}
              onChange={onRuleChange}
              options={[
                { value: "rule1", label: "规则1" },
                { value: "rule2", label: "规则2" },
                { value: "rule3", label: "规则3" },
              ]}
            />
          </Form.Item>

          <Form.Item label="题型" extra="比如 一、选择题">
            <Input placeholder="请输入题型名称" />
          </Form.Item>

          <Form.Item label="题型描述" extra="比如 下列4个选项中....">
            <TextArea value="" placeholder="请输入题型描述" autoSize={{ minRows: 2, maxRows: 5 }} />
          </Form.Item>

          <Form.Item label="挑选题目">
            <Button color="primary" variant="dashed" onClick={showModal}>
              添加题目
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* 选题弹框 */}
      <div>
        <Modal
          title="挑选题目"
          width={1200}
          closable={{ "aria-label": "Custom Close Button" }}
          open={isModalOpen}
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
                <Cascader style={{ width: "100%" }} options={textbookOptions} onChange={onSelectOptionChange} placeholder="请选择章节小节名称" />
              </Form.Item>
            )}

            <Form.Item label="选择题型">
              <Radio.Group defaultValue={questionTypeVal} buttonStyle="solid" onChange={onQuestionTypeChange}>
                <Radio.Button key={StringConst.listSelectAll} value={StringConst.listSelectAll}>
                  {StringConst.listSelectAllDesc}
                </Radio.Button>
                {questionTypeList.map((item) => {
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
                {questionTagList.map((item) => {
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

              <Checkbox.Group style={{ width: "100%" }} onChange={onSelectQuestionChange}>
                <Row gutter={[10, 10]} align={"middle"}>
                  {questionListResp.list.map((questionInfo) => {
                    return (
                      <Col span={24} key={questionInfo.id}>
                        <Checkbox value={questionInfo.id}>
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
                        </Checkbox>
                      </Col>
                    );
                  })}
                </Row>
              </Checkbox.Group>
            </div>

            <Divider size="small" />

            <Pagination total={questListResTotal} current={pageNo} defaultPageSize={pageSize} onChange={onPageChange} />
          </Form>
        </Modal>
      </div>
    </div>
  );
}
