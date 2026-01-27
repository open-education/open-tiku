import { Button, Divider, Drawer, Form, Input, Select } from "antd";
import { useState } from "react";
import type { TextbookOption, TextbookOtherDict } from "~/type/textbook";
import "katex/dist/katex.min.css";
import SelectQuestion from "~/test/add/select-question";
import ShowQuestionList from "~/test/add/show-question";
import type { Rule, SelectQuestionIds } from "~/type/test";
import { arrayToDict } from "~/util/common";

const { TextArea } = Input;

// 添加试卷
export default function Add(props: any) {
  // 教材章节和知识点下拉选择原始数据
  const textbookOptions: TextbookOption[] = props.textbookOptions ?? [];
  const questionTypeList: TextbookOtherDict[] = props.questionTypeList ?? [];
  const questionTagList: TextbookOtherDict[] = props.questionTagList ?? [];

  // 规则样例数据
  const rules: Rule[] = [
    {
      id: 1,
      value: "rule1",
      label: "规则1",
      list: [
        {
          id: 1,
          label: "一、选择题(本大题共12小题, 每题5分, 共60分. 每小题均有 A B C D 四个选项, 其中只有一个选项正确, 请用 2B 铅笔在答题卡相应位置涂抹)",
          num: 12,
          score: 60,
        },
        {
          id: 2,
          label: "二、填空题(共4个题)",
          num: 4,
          score: 20,
        },
        {
          id: 3,
          label: "三、解答题(共4个题)",
          num: 4,
          score: 70,
          scores: [15, 15, 15, 20],
        },
      ],
    },
  ];
  const rulesDict = arrayToDict(rules, "value");

  // 组卷规则和明细
  const [ruleVal, setRuleVal] = useState<string>("rule1");
  const [ruleItems, setRuleItems] = useState<Rule>(rulesDict[ruleVal]);
  const onRuleChange = (value: string) => {
    setRuleVal(value);
    setRuleItems(rulesDict[value]);
  };

  // 题型标识
  const [questionCateId, setQuestionCateId] = useState<number>(0);

  // 存储最终题目
  const [questionIdsMap, setQuestionIdsMap] = useState<Record<number, SelectQuestionIds>>({});

  // Drawer
  const [addDrawerSize, setAddDrawerSize] = useState(1200);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerContent, setDrawerContent] = useState<React.ReactNode>("");
  const drawerExtraInfo = <div className="text-xs text-blue-700">提示: 鼠标触摸边框左右拖动可以调整到适合的宽度</div>;
  const onCloseDrawer = () => {
    setOpenDrawer(false);
  };

  // 提交试卷
  const onSubmitTest = () => {
    console.log("提交...");
    console.log("selectQuestionIds: ", questionIdsMap);
  };

  return (
    <div className="p-2.5 min-h-screen">
      {/* 组卷说明 */}
      <div>
        <p className="text-blue-700">1. 题型的模式和分配由组卷规则决定, 如果需要其它的模式请配置新的组卷规则;</p>
        <p className="text-blue-700">2. 试卷最多30个题目, 所以选题一次最多展示30个题目, 如果没有合适的题目请使用标题关键字搜索其它题目;</p>
        <p className="text-blue-700">3. 题目排列顺序就是在试卷上的顺序, 请添加完毕后再拖拽, 否则移除时会重新刷新导致之前的排序失效;</p>
      </div>

      <Divider />

      <div>
        <Button type="primary" onClick={onSubmitTest}>
          提交
        </Button>
      </div>

      <Divider />

      {/* 组题表单 */}
      <div className="mt-2.5">
        <Form labelWrap={true} layout="horizontal" labelCol={{ span: 1 }} wrapperCol={{ span: 23 }}>
          <Form.Item label="标题" extra="比如 某年某中学某班级xxx测试卷">
            <Input placeholder="请输入试卷标题" />
          </Form.Item>

          <Form.Item label="组卷规则" extra="选择规则后会展示出包含的题型, 在对应的题型下添加题目即可">
            <Select value={ruleVal} onChange={onRuleChange} options={rules} />
          </Form.Item>

          {/* 根据组卷规则添加题目模板 */}
          {ruleItems.list?.map((item) => {
            // 获取当前循环项对应的选中数组，如果没有则默认为空数组 []
            const currentIds: SelectQuestionIds = questionIdsMap[item.id] || {
              currentIds: [],
              sortedIds: [],
            };
            const setCurrentIds = (req: SelectQuestionIds) => {
              setQuestionIdsMap((prev) => {
                return {
                  ...prev,
                  [item.id]: req,
                };
              });
            };

            return (
              <div key={item.id}>
                <Form.Item label="题型">
                  <TextArea value={item.label} placeholder="请输入题型信息" autoSize={{ minRows: 2, maxRows: 5 }} />
                </Form.Item>

                <Form.Item label="挑选题目">
                  <Button
                    color="primary"
                    variant="dashed"
                    onClick={() => {
                      setDrawerContent(
                        <SelectQuestion
                          key={item.id}
                          textbookOptions={textbookOptions}
                          setQuestionCateId={setQuestionCateId}
                          questionTypeList={questionTypeList}
                          questionTagList={questionTagList}
                          questionIds={currentIds}
                          setQuestionIds={setCurrentIds}
                        />,
                      );

                      setOpenDrawer(true);
                    }}
                  >
                    选题
                  </Button>
                </Form.Item>

                {/* 每种题型展示题目列表 */}
                <ShowQuestionList
                  key={item.id}
                  questionTypeList={questionTypeList}
                  questionTagList={questionTagList}
                  questionIds={currentIds}
                  setQuestionIds={setCurrentIds}
                  questionCateId={questionCateId}
                />

                <Divider />
              </div>
            );
          })}
        </Form>
      </div>

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
