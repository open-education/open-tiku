import { Alert, Button, Checkbox, Col, Divider, Drawer, Empty, Flex, Form, Pagination, Radio, Row, type GetProp, type RadioChangeEvent } from "antd";
import { useEffect, useState } from "react";
import type { QuestionInfoResp, QuestionListResp, QuestionSimilarListReq } from "~/type/question";
import type { Textbook, TextbookOtherDict } from "~/type/textbook";
import { httpClient } from "~/util/http";
import { StringConst } from "~/util/string";
import { CommonBreadcrumb } from "~/tiku/common/breadcrumb";
import { CommonTag } from "~/common/tag";
import { CommonTitle } from "~/common/title";
import { CommonSelect } from "~/common/select";
import Info from "~/tiku/info/index";

// 变式题列表
export default function Index(props: any) {
  // 获取属性中的数据
  const textbookId: number = Number(props.textbookId ?? 0);
  const questionId: number = Number(props.questionId ?? 0);
  const questionCateId: number = Number(props.questionCateId ?? 0);
  const questionTypeList: TextbookOtherDict[] = props.questionTypeList ?? [];
  const questionTagList: TextbookOtherDict[] = props.questionTagList ?? [];
  const pathMap: Map<number, Textbook[]> = props.pathMap ?? {};
  const childPathMap: Map<number, Textbook[]> = props.childPathMap ?? {};

  const [questionTypeVal, setQuestionTypeVal] = useState<number>(StringConst.listSelectAll);
  const onQuestionTypeChange = ({ target: { value } }: RadioChangeEvent) => {
    setQuestionTypeVal(Number(value));
  };

  // 选择题目标签
  const [tagsVal, setTagsVal] = useState<number[]>([]);
  const onSelectQuestionTagChange: GetProp<typeof Checkbox.Group, "onChange"> = (checkedValues) => {
    setTagsVal(checkedValues as number[]);
  };

  const [pageNo, setPageNo] = useState<number>(1);
  const [questListResTotal, setQuestListResTotal] = useState<number>(0);
  const onPageChange = (page: number) => {
    setPageNo(page);
  };

  const [reqQuestListErr, setReqQuestListErr] = useState<React.ReactNode>(null);
  const [questionListResp, setQuestionListResp] = useState<QuestionListResp>({
    list: [],
    pageNo: 0,
    pageSize: 0,
    total: 0,
  });

  // 获取列表
  useEffect(() => {
    const questionListReq: QuestionSimilarListReq = {
      questionId: questionId,
      questionCateId: questionCateId,
      pageNo: pageNo,
      pageSize: 10,
    };
    if (questionTypeVal > 0) {
      questionListReq.questionTypeId = questionTypeVal;
    }
    if (tagsVal && tagsVal.length > 0) {
      questionListReq.tagIds = tagsVal;
    }

    httpClient
      .post<QuestionListResp>("/question/similar", questionListReq)
      .then((res) => {
        if (reqQuestListErr) {
          setReqQuestListErr("");
        }

        setQuestionListResp(res);
        setQuestListResTotal(res.total);
      })
      .catch((err) => {
        setReqQuestListErr(<Alert title="Error" description={`读取变式题题目列表出错: ${err.message}`} type="error" showIcon />);
      });
  }, [questionId, questionCateId, questionTypeVal, tagsVal, pageNo]);

  // Drawer
  const [addDrawerSize, setAddDrawerSize] = useState(1200);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerContent, setDrawerContent] = useState<React.ReactNode>("");
  const drawerExtraInfo = <div className="text-xs text-blue-700">提示: 鼠标触摸边框左右拖动可以调整到适合的宽度</div>;
  // 添加题目
  const showAddDrawer = (id: number) => {
    // 获取题目全部信息
    httpClient.get<QuestionInfoResp>(`/question/info/${id}`).then((res) => {
      setOpenDrawer(true);
      setDrawerContent(<Info questionInfo={res} questionTypeList={questionTypeList} questionTagList={questionTagList} childPathMap={childPathMap} />);
    });
  };
  const onCloseDrawer = () => {
    setOpenDrawer(false);
  };

  return (
    <div className="p-2.5">
      {/* 顶部管理工具栏 */}
      <div className="mt-2.5">
        <Row gutter={[15, 15]}>
          <Col span={24}>
            {/* 面包屑快速导航 */}
            {CommonBreadcrumb(pathMap, textbookId.toString(), childPathMap, questionCateId)}
          </Col>
        </Row>
      </div>

      <div className="mt-2.5">
        <p className="text-blue-700">1. 变式题仅提供浏览和详情查看, 如需编辑等操作请回题库列表搜索处理;</p>
      </div>

      <div className="mt-2.5">
        <Form labelWrap={true} layout="horizontal" labelCol={{ span: 1.5 }} wrapperCol={{ span: 22.5 }}>
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
        </Form>
      </div>

      <Divider />

      {reqQuestListErr}

      {/* 一个选择题的样式 */}
      {questListResTotal === 0 && <Empty />}

      {questionListResp.list?.map((questionInfo) => {
        return (
          <div
            key={questionInfo.id}
            className="group relative p-4 pb-4 hover:pb-12 border border-transparent hover:border-blue-500 transition-all duration-300 ease-in-out bg-white overflow-hidden"
          >
            {/* 标签 */}
            <CommonTag
              questionTypeList={questionTypeList}
              questionTagList={questionTagList}
              questionTypeId={questionInfo.questionTypeId}
              questionTagIds={questionInfo.questionTagIds ?? []}
              difficultyLevel={questionInfo.difficultyLevel}
            />

            {/* 标题 */}
            <div className="mt-2.5">
              {<CommonTitle id={questionInfo.id} title={questionInfo.title} comment={questionInfo.comment} images={questionInfo.images} />}
            </div>

            {/* 选项内容 */}
            <div className="mt-2.5">
              {questionInfo.options && questionInfo.options.length > 0 && (
                <CommonSelect optionsLayout={questionInfo.optionsLayout ?? 1} options={questionInfo.options} />
              )}
            </div>

            {/* 题目其它标签, 比如查看答案, 关联题目等 */}
            <div className="absolute right-4 translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
              <Row gutter={[10, 10]} className="m-3">
                <Col span={24}>
                  <Flex gap="small" wrap justify={"right"}>
                    <Button color="primary" variant="link" onClick={() => showAddDrawer(questionInfo.id)}>
                      详情
                    </Button>
                  </Flex>
                </Col>
              </Row>
            </div>
          </div>
        );
      })}

      <Divider size="small" />

      <Pagination total={questListResTotal} current={pageNo} defaultPageSize={10} onChange={onPageChange} />

      <Drawer
        title="查看详情"
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
  );
}
