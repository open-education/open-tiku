import { Button, Drawer, Form, Input, Select } from "antd";
import { useState } from "react";
import type { Textbook, TextbookOption, TextbookOtherDict } from "~/type/textbook";
import "katex/dist/katex.min.css";
import SelectQuestion from "~/test/add/select-question";
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

  // 题型标识
  const [questionCateId, setQuestionCateId] = useState<number>(0);

  // 选择题目
  const [questionIds, setQuestionIds] = useState<number[]>([]);

  // Drawer
  const [addDrawerSize, setAddDrawerSize] = useState(1200);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerContent, setDrawerContent] = useState<React.ReactNode>("");
  const drawerExtraInfo = <div className="text-xs text-blue-700">提示: 鼠标触摸边框左右拖动可以调整到适合的宽度</div>;
  const onCloseDrawer = () => {
    setOpenDrawer(false);
  };

  // 挑选题目
  const onClickSelectQuestion = () => {
    setDrawerContent(
      <SelectQuestion
        textbookOptions={textbookOptions}
        setQuestionCateId={setQuestionCateId}
        questionTypeList={questionTypeList}
        questionTagList={questionTagList}
        questionIds={questionIds}
        setQuestionIds={setQuestionIds}
      />,
    );

    setOpenDrawer(true);
  };

  return (
    <div className="p-2.5 min-h-screen">
      {/* 组卷说明 */}
      <div>
        <p className="text-blue-700">1. 题型的模式和分配由组卷规则决定, 如果需要其它的模式请配置新的组卷规则;</p>
        <p className="text-blue-700">2. 试卷最多30个题目, 所以选题一次最多展示30个题目, 如果没有合适的题目请使用标题关键字搜索其它题目;</p>
        <p className="text-blue-700">3. 题目排列顺序就是在试卷上的顺序, 请添加完毕后再拖拽, 否则移除时会重新刷新导致之前的排序失效;</p>
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
            <Button color="primary" variant="dashed" onClick={onClickSelectQuestion}>
              挑选题目
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* 每种题型展示题目列表 */}
      <ShowQuestionList
        questionTypeList={questionTypeList}
        questionTagList={questionTagList}
        questionIds={questionIds}
        setQuestionIds={setQuestionIds}
        questionCateId={questionCateId}
      />

      {/* 展示抽屉 */}
      <div>
        <Drawer
          title="挑选题目"
          closable={{ "aria-label": "Close Button" }}
          onClose={onCloseDrawer}
          open={openDrawer}
          size={addDrawerSize}
          resizable={{
            onResize: (newSize) => setAddDrawerSize(newSize),
          }}
          extra={drawerExtraInfo}
        >
          {drawerContent}
        </Drawer>
      </div>
    </div>
  );
}
