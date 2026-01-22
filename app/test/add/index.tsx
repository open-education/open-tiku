import { Button, Form, Input, Select } from "antd";
import { useState } from "react";
import type { Textbook, TextbookOption, TextbookOtherDict } from "~/type/textbook";
import "katex/dist/katex.min.css";
import SelectQuestionModal from "~/test/add/select-question";
import ShowQuestionList from "~/test/add/show-question";

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

  // 打开模态框
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 选择题目
  const [questionIds, setQuestionIds] = useState<number[]>([]);

  return (
    <div className="p-2.5 min-h-screen">
      {/* 组卷说明 */}
      <div>
        <p className="text-blue-700">1. 题型的模式和分配由组卷规则决定, 如果需要其它的模式请配置新的组卷规则;</p>
        <p className="text-blue-700">2. 题目编号是题目在试卷上的顺序也是题号, 注意要连贯;</p>
      </div>

      {/* 组题表单 */}
      <div className="mt-2.5">
        <Form labelWrap={true} layout="horizontal" labelCol={{ span: 1 }} wrapperCol={{ span: 23 }}>
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
            <Button
              color="primary"
              variant="dashed"
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              挑选题目
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* 选择题目 */}
      <SelectQuestionModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        textbookOptions={textbookOptions}
        optionInit={optionInit}
        selectOption={selectOption}
        setSelectOption={setSelectOption}
        questionTypeList={questionTypeList}
        questionTagList={questionTagList}
        questionIds={questionIds}
        setQuestionIds={setQuestionIds}
      />

      {/* 每种题型展示题目列表 */}
      <ShowQuestionList questionIds={questionIds} setQuestionIds={setQuestionIds} selectOption={selectOption} />
    </div>
  );
}
