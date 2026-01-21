import {
  Button,
  Cascader,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  type CascaderProps,
  type GetProp,
} from "antd";
import { useState } from "react";
import type { Textbook, TextbookOption } from "~/type/textbook";

const { TextArea } = Input;

// 添加试卷
export default function Add(props: any) {
  // 教材章节和知识点下拉选择原始数据
  const textbookOptions: TextbookOption[] = props.textbookOptions ?? [];

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
  const [sourceVal, setSourdeVal] = useState<string>("1");
  const onSourceChange = (value: string) => {
    setSourdeVal(value);
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
  const onSelectOptionChange: CascaderProps<TextbookOption>["onChange"] = (
    _,
    selectedOptions,
  ) => {
    if (selectedOptions === undefined) {
      setSelectOption(optionInit);
      return;
    }
    setSelectOption(selectedOptions[selectedOptions.length - 1].raw);
  };

  // 选择题目
  const onSelectQuestionChange: GetProp<typeof Checkbox.Group, "onChange"> = (
    checkedValues,
  ) => {
    console.log("checked = ", checkedValues);
  };

  return (
    <div className="p-2.5 min-h-screen">
      {/* 组题表单 */}
      <Form
        layout="horizontal"
        labelCol={{ span: 2 }}
        wrapperCol={{ span: 22 }}
      >
        <Form.Item label="标题">
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

        <Form.Item label="题目">
          <Input placeholder="请输入题目名称" />
        </Form.Item>

        <Form.Item label="题型描述">
          <TextArea
            value=""
            placeholder="请输入题型描述"
            autoSize={{ minRows: 2, maxRows: 5 }}
          />
        </Form.Item>

        <Form.Item label="挑选题目">
          <Button color="primary" variant="dashed" onClick={showModal}>
            添加题目
          </Button>
        </Form.Item>
      </Form>

      {/* 选题弹框 */}
      <Modal
        title="挑选题目"
        width={1200}
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          layout="horizontal"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <Form.Item label="题目来源">
            <Select
              value={sourceVal}
              onChange={onSourceChange}
              options={[
                { value: "1", label: "教材章节或知识点" },
                { value: "2", label: "我的题库" },
                { value: "3", label: "我的试题篮" },
              ]}
            />
          </Form.Item>

          {/* 选择教材章节或知识点 */}
          {sourceVal === "1" && (
            <Form.Item label="教材章节或知识点名称">
              <Cascader
                style={{ width: "100%" }}
                options={textbookOptions}
                onChange={onSelectOptionChange}
                placeholder="请选择章节小节名称"
              />
            </Form.Item>
          )}

          {/* 题目列表 */}
          <div>
            <Checkbox.Group
              style={{ width: "100%" }}
              onChange={onSelectQuestionChange}
            >
              <Row>
                <Col span={24}>
                  <Checkbox value="A">A</Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="B">B</Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="C">C</Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="D">D</Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="E">E</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
