import {Alert, Button, Col, Divider, Drawer, Flex, Pagination, Radio, type RadioChangeEvent, Row} from "antd";
import type {QuestionListReq, QuestionListResp} from "~/type/question";
import React, {useEffect, useState} from "react";
import Add from "~/tiku/add";
import {CommonBreadcrumb} from "~/tiku/common/breadcrumb";
import {useLocation, useOutletContext} from "react-router-dom";
import type {TiKuIndexContext} from "~/type/context";
import {StringConst, StringUtil} from "~/util/string";
import {CommonTitle} from "~/tiku/common/title";
import {CommonSelect} from "~/tiku/common/select";
import type {Textbook, TextbookOtherDict} from "~/type/textbook";
import {httpClient} from "~/util/http";
import {CommonQuickJumpTag, CommonTag} from "~/tiku/common/tag";

// 列表信息
export function ListInfo(props: any) {
  const location = useLocation();
  const pathname = StringUtil.getLastPart(location.pathname, "/");

  const {pathMap} = useOutletContext<TiKuIndexContext>();

  // 获取属性中的数据
  const questionTypeList: TextbookOtherDict[] = props.questionTypeList ?? [];
  const questionTagList: TextbookOtherDict[] = props.questionTagList ?? [];
  const childPathMap: Map<number, Textbook[]> = props.childPathMap ?? {};
  const questionCateId: number = Number(props.questionCateId ?? 0);

  const [questionTypeVal, setQuestionTypeVal] = useState<number>(StringConst.listSelectAll)
  const onQuestionTypeChange = ({target: {value}}: RadioChangeEvent) => {
    setQuestionTypeVal(Number(value));
  };

  const [pageNo, setPageNo] = useState<number>(1);
  const [questListResTotal, setQuestListResTotal] = useState<number>(0);
  const onPageChange = (page: number) => {
    setPageNo(page);
  }

  const [reqQuestListErr, setReqQuestListErr] = useState<React.ReactNode>(null);
  const [refreshListNum, setRefreshListNum] = useState<number>(0);
  const [questionListResp, setQuestionListResp] = useState<QuestionListResp>({
    list: [],
    pageNo: 0,
    pageSize: 0,
    total: 0
  });

  useEffect(() => {
    // 默认查询第一章第一节的题目列表
    const questionListReq: QuestionListReq = {
      questionCateId: questionCateId,
      pageNo: pageNo,
      pageSize: 10
    };
    if (questionTypeVal > 0) {
      questionListReq.questionTypeId = questionTypeVal;
    }
    httpClient.post<QuestionListResp>("/question/list", questionListReq).then(res => {
      if (reqQuestListErr) {
        setReqQuestListErr("");
      }

      setQuestionListResp(res);
      setQuestListResTotal(res.total);
    }).catch(err => {
      setReqQuestListErr(<Alert
        title="Error"
        description={`读取题目列表出错: ${err.message}`}
        type="error"
        showIcon
      />)
    })
  }, [questionCateId, questionTypeVal, refreshListNum]);

  // Drawer
  const [addDrawerSize, setAddDrawerSize] = useState(1200);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState<string>("");
  const [drawerContent, setDrawerContent] = useState<React.ReactNode>("");
  const drawerExtraInfo = <div className="text-xs text-blue-700">提示: 鼠标触摸边框左右拖动可以调整到适合的宽度</div>
  // 添加题目
  const showAddDrawer = () => {
    // 目录应该是3层才可以添加题目
    const nodes: Textbook[] = childPathMap.get(questionCateId) ?? [];
    if (nodes.length != 3) {
      setReqQuestListErr(<Alert
        title="Error"
        description="目前仅支持在三级目录下添加题目"
        type="error"
        showIcon
      />)
      return;
    } else {
      setReqQuestListErr("");
    }

    setOpenDrawer(true);
    setDrawerTitle("添加题目");
    setDrawerContent(<Add
      setDrawerTitle={setDrawerTitle}
      setDrawerContent={setDrawerContent}
      setRefreshListNum={setRefreshListNum}
      questionTypeList={questionTypeList}
      questionTagList={questionTagList}
      childPathMap={childPathMap}
      questionCateId={questionCateId}
    />)
  };
  const onCloseDrawer = () => {
    setOpenDrawer(false);
  };
  return <div>
    {/* 顶部管理工具栏 */}
    <Row gutter={[15, 15]}>
      <Col span={24}>
        {/* 面包屑快速导航 */}
        {CommonBreadcrumb(pathMap, pathname, childPathMap, questionCateId)}
      </Col>

      <Col span={24}>
        <Flex gap="small" wrap>
          <div
            style={{
              display: "inline-block",
              lineHeight: "35px",
              marginRight: "10px",
            }}
          >
            题目类型:{" "}
          </div>
          {
            <Radio.Group
              defaultValue={questionTypeVal}
              buttonStyle="solid"
              onChange={onQuestionTypeChange}
            >
              <Radio.Button key={StringConst.listSelectAll} value={StringConst.listSelectAll}>
                {StringConst.listSelectAllDesc}
              </Radio.Button>
              {questionTypeList.map(item => {
                return (
                  <Radio.Button key={item.id} value={item.id}>
                    {item.itemValue}
                  </Radio.Button>
                );
              })}
            </Radio.Group>
          }
        </Flex>
      </Col>

      <Col span={24}>
        <Flex gap="small" wrap>
          <div
            style={{
              display: "inline-block",
              lineHeight: "35px",
              marginRight: "10px",
            }}
          >
            快速入口:{" "}
          </div>
          <Button color="primary" variant="dashed" onClick={showAddDrawer}>
            添加题目
          </Button>
        </Flex>
      </Col>
    </Row>

    <Divider/>

    {reqQuestListErr}

    {/* 一个选择题的样式 */}
    {
      questionListResp.list?.map(questionInfo => {
        return <div key={questionInfo.id}
                    className="group relative p-4 pb-4 hover:pb-12 border border-transparent hover:border-blue-500 transition-all duration-300 ease-in-out bg-white overflow-hidden"
        >
          {/* 标签 */}
          {CommonTag(questionInfo, questionTypeList, questionTagList)}

          {/* 标题 */}
          <div className="mt-2.5">
            {CommonTitle(questionInfo)}
          </div>

          {/* 选项内容 */}
          <div className="mt-2.5">
            {CommonSelect(questionInfo)}
          </div>

          {/* 题目其它标签, 比如查看答案, 关联题目等 */}
          <div
            className="absolute bottom-3 right-4 translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2"
          >
            {CommonQuickJumpTag(questionInfo, setOpenDrawer, setDrawerTitle, setDrawerContent, setRefreshListNum, questionTypeList, questionTagList, childPathMap)}
          </div>
        </div>
      })
    }

    <Divider size="small"/>

    <Pagination
      total={questListResTotal}
      current={pageNo}
      defaultPageSize={10}
      onChange={onPageChange}
    />

    <Drawer
      title={drawerTitle}
      closable={{'aria-label': 'Close Button'}}
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
}
