import {
  Alert,
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Drawer,
  Flex,
  type GetProp,
  Pagination,
  Radio,
  type RadioChangeEvent,
  Row,
  type GetProps,
  Input,
} from "antd";
import type { QuestionListReq, QuestionListResp } from "~/type/question";
import React, { useEffect, useRef, useState } from "react";
import Add from "~/tiku/add";
import { CommonBreadcrumb } from "~/tiku/common/breadcrumb";
import { useLocation, useOutletContext } from "react-router-dom";
import type { TiKuIndexContext } from "~/type/context";
import { StringConst, StringUtil } from "~/util/string";
import { CommonTitle } from "~/common/title";
import { CommonSelect } from "~/common/select";
import type { Textbook, TextbookOtherDict } from "~/type/textbook";
import { httpClient } from "~/util/http";
import { CommonQuickJumpTag } from "~/tiku/common/tag";
import { CommonTag } from "~/common/tag";
import { UploadQuestion } from "~/tiku/upload/question/index";
import { TaskList } from "~/tiku/upload/question/task";
import "katex/dist/katex.min.css";

type SearchProps = GetProps<typeof Input.Search>;

const { Search } = Input;

// 列表信息
export function ListInfo(props: any) {
  const location = useLocation();
  const pathname = StringUtil.getLastPart(location.pathname, "/");

  const { pathMap } = useOutletContext<TiKuIndexContext>();

  // 获取属性中的数据
  const questionTypeList: TextbookOtherDict[] = props.questionTypeList ?? [];
  const questionTagList: TextbookOtherDict[] = props.questionTagList ?? [];
  const childPathMap: Map<string, Textbook[]> = props.childPathMap ?? {};
  const questionCateId: number = Number(props.questionCateId ?? 0);
  const cateKeyPath: string[] = props.cateKeyPath ?? [];
  const textbookId: number = props.textbookId ?? 0;

  const [questionTypeVal, setQuestionTypeVal] = useState<number>(StringConst.listSelectAll);
  const onQuestionTypeChange = ({ target: { value } }: RadioChangeEvent) => {
    setQuestionTypeVal(Number(value));
  };

  // 选择题目标签
  const [tagsVal, setTagsVal] = useState<number[]>([]);
  const onSelectQuestionTagChange: GetProp<typeof Checkbox.Group, "onChange"> = (checkedValues) => {
    setTagsVal(checkedValues as number[]);
  };

  // 搜索标题
  const [titleVal, setTitleVal] = useState<string>("");
  const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
    setTitleVal(value);
  };

  // 搜索ID标题
  const [titleId, setTitleId] = useState<string>("");
  const onIdSearch: SearchProps["onSearch"] = (value, _e, info) => {
    setTitleId(value);
  };

  const [pageNo, setPageNo] = useState<number>(1);
  const onPageChange = (page: number) => {
    setPageNo(page);
  };

  const [reqQuestListErr, setReqQuestListErr] = useState<React.ReactNode>(null);
  const [refreshListNum, setRefreshListNum] = useState<number>(0);
  const [questionListResp, setQuestionListResp] = useState<QuestionListResp>({
    list: [],
    pageNo: 0,
    pageSize: 0,
    total: 0,
  });

  // 监听分类是否发生变化
  const prevCateIdRef = useRef(questionCateId);

  useEffect(() => {
    // 如果不是第三层级则不请求题目列表
    if (cateKeyPath.length != 3) {
      setQuestionListResp({
        list: [],
        pageNo: 0,
        pageSize: 0,
        total: 0,
      });
      return;
    }

    const isCateChanged = prevCateIdRef.current !== questionCateId;
    prevCateIdRef.current = questionCateId;

    // 分类变化且当前不是第1页 → 重置到第1页，本次不发请求
    if (isCateChanged && pageNo !== 1) {
      setPageNo(1);
      return;
    }

    // 默认查询第一章第一节的题目列表
    const questionListReq: QuestionListReq = {
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
    if (titleVal && titleVal.length > 0) {
      questionListReq.titleVal = titleVal;
    }
    if (titleId && titleId.length > 0) {
      questionListReq.ids = [Number(titleId)];
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
  }, [questionCateId, questionTypeVal, tagsVal, titleVal, titleId, pageNo, refreshListNum]);

  // Drawer
  const [addDrawerSize, setAddDrawerSize] = useState(1200);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState<string>("");
  const [drawerContent, setDrawerContent] = useState<React.ReactNode>("");
  const drawerExtraInfo = <div className="text-xs text-blue-700">提示: 鼠标触摸边框左右拖动可以调整到适合的宽度</div>;

  // 检查入口是否层级正确
  const checkPathLevel = (msg: string): boolean => {
    if (cateKeyPath.length != 3) {
      setReqQuestListErr(<Alert title="Error" description={msg} type="error" showIcon />);
      return false;
    } else {
      setReqQuestListErr("");
      return true;
    }
  };

  // 添加题目
  const showAddDrawer = () => {
    // 目录应该是3层才可以添加题目
    if (!checkPathLevel("目前仅支持在题型下添加题目")) {
      return;
    }

    setOpenDrawer(true);
    setDrawerTitle("添加题目");
    setDrawerContent(
      <Add
        setDrawerTitle={setDrawerTitle}
        setDrawerContent={setDrawerContent}
        setRefreshListNum={setRefreshListNum}
        questionTypeList={questionTypeList}
        questionTagList={questionTagList}
        childPathMap={childPathMap}
        questionCateId={questionCateId}
        cateKeyPath={cateKeyPath}
      />,
    );
  };

  // 刷新任务列表
  const [refreshTaskListNum, setRefreshTaskListNum] = useState<number>(0);

  // 显示上传题目抽屉
  const onUploadQuestionDrawer = () => {
    // 目录应该是3层才可以上传题目
    if (!checkPathLevel("目前仅支持在题型下上传题目")) {
      return;
    }

    setOpenDrawer(true);
    setDrawerTitle("上传题目");

    setDrawerContent(<UploadQuestion questionCateId={questionCateId} textbookId={textbookId} setRefreshTaskListNum={setRefreshTaskListNum} />);
  };

  // 查看上传题目任务列表
  const showTaskListDrawer = () => {
    // 目录应该是3层才可以查看上传任务
    if (!checkPathLevel("目前仅支持在题型下查看任务")) {
      return;
    }

    setOpenDrawer(true);
    setDrawerTitle("查看任务");
    setDrawerContent(<TaskList questionCateId={questionCateId} refreshTaskListNum={refreshTaskListNum} />);
  };

  const onCloseDrawer = () => {
    setOpenDrawer(false);
  };

  return (
    <div>
      {/* 顶部管理工具栏 */}
      <Row gutter={[15, 15]} align={"middle"}>
        <Col span={24}>
          {/* 面包屑快速导航 */}
          {CommonBreadcrumb(pathMap, pathname, childPathMap, questionCateId, cateKeyPath)}
        </Col>

        <Col span={24}>
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

            <Form.Item label="标题搜索">
              <Search placeholder="请输入标题关键字" onSearch={onSearch} style={{ width: "50%" }} />
            </Form.Item>

            <Form.Item label="标识搜索">
              <Search placeholder="请输入标题ID" onSearch={onIdSearch} style={{ width: "50%" }} />
            </Form.Item>
          </Form>
        </Col>

        <Col span={24}>
          <Flex gap="small" wrap>
            <div className="inline-block leading-8.75 mr-2.5">快速入口:</div>
            <Button color="primary" variant="dashed" onClick={showAddDrawer}>
              添加题目
            </Button>
            <Button color="primary" variant="dashed" onClick={onUploadQuestionDrawer}>
              上传题目
            </Button>
            <Button color="primary" variant="dashed" onClick={showTaskListDrawer}>
              查看任务
            </Button>
          </Flex>
        </Col>
      </Row>

      <Divider />

      {reqQuestListErr}

      {/* 一个选择题的样式 */}
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
              {CommonQuickJumpTag(
                questionInfo,
                setOpenDrawer,
                setDrawerTitle,
                setDrawerContent,
                setRefreshListNum,
                questionTypeList,
                questionTagList,
                childPathMap,
                cateKeyPath,
              )}
            </div>
          </div>
        );
      })}

      <Divider size="small" />

      <Pagination total={questionListResp.total} current={pageNo} defaultPageSize={10} onChange={onPageChange} />

      <Drawer
        title={drawerTitle}
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
