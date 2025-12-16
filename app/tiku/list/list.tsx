import {Alert, Button, Col, Divider, Drawer, Flex, Pagination, Radio, type RadioChangeEvent, Row} from "antd";
import type {QuestionListReq, QuestionListResp, QuestionType} from "~/type/question";
import type {TagInfo} from "~/type/tag";
import React, {useEffect, useState} from "react";
import Add from "~/tiku/add";
import {CommonBreadcrumb} from "~/tiku/common/breadcrumb";
import {useLocation, useOutletContext} from "react-router-dom";
import type {TiKuIndexContext} from "~/type/context";
import {StringConst, StringUtil, StringValidator} from "~/util/string";
import {httpClient} from "~/util/http";
import {CommonQuickJumpTag, CommonTag} from "~/tiku/common/tag";
import {CommonTitle} from "~/tiku/common/title";
import {CommonSelect} from "~/tiku/common/select";
import {HierarchicalDict} from "~/util/hierarchical-dict";
import type {Catalog} from "~/type/catalog";
import type {KnowledgeInfo} from "~/type/knowledge-info";

export function ListInfo(props: any) {
  const location = useLocation();
  const pathname = StringUtil.getLastPart(location.pathname, "/");
  const {subjectDict} = useOutletContext<TiKuIndexContext>();

  // get props value
  const questionTypeList: QuestionType[] = props.questionTypeList;
  const tagList: TagInfo[] = props.tagList;
  const leftMenuItemSelectKey: string = props.leftMenuItemSelectKey ?? "";
  const leftMenuItemSelectKeyPath: string[] = props.leftMenuItemSelectKeyPath ?? [];

  const getTextbookKeyAndCatalogKey = (): [string, string] => {
    if (StringValidator.endsWith(pathname, StringConst.chapter)) {
      return [StringUtil.getFirstPart(pathname, StringConst.chapter), leftMenuItemSelectKey];
    }
    if (StringValidator.endsWith(pathname, StringConst.knowledge)) {
      // 知识点的 textbookKey 要从 catalogKey 中获取, 格式为 math_pep_junior_71#1#1_1_1 第一个 # 前为 textbookKey 最后一个 # 后面为 catalogKey
      return [
        StringUtil.getFirstPart(leftMenuItemSelectKey, StringConst.knowledgeCatalogKeySep),
        StringUtil.getLastPart(leftMenuItemSelectKey, StringConst.knowledgeCatalogKeySep)
      ];
    }
    return ["", ""];
  }
  const [initTextbookKey, _] = getTextbookKeyAndCatalogKey();
  const [textbookKey, setTextbookKey] = React.useState<string>(initTextbookKey);

  const catalogDict: HierarchicalDict<Catalog> = props.catalogDict ?? new HierarchicalDict<Catalog>([]);
  const knowledgeInfoDict: HierarchicalDict<KnowledgeInfo> = props.knowledgeInfoDict ?? new HierarchicalDict<KnowledgeInfo>([]);

  const [questionTypeVal, setQuestionTypeVal] = useState<string>(StringConst.listSelectAll)
  const onQuestionsChange = ({target: {value}}: RadioChangeEvent) => {
    setQuestionTypeVal(value);
  };

  const [pageNo, setPageNo] = useState<number>(1);
  const [questListResTotal, setQuestListResTotal] = useState<number>(0);
  const onPageChange = (page: number) => {
    setPageNo(page);
  }

  const [reqQuestListErr, setReqQuestListErr] = useState<React.ReactNode>(null);
  const [refreshListNum, setRefreshListNum] = useState<number>(0);
  const [questionListResp, setQuestionListResp] = useState<QuestionListResp>({
    data: [],
    pageNo: 0,
    pageSize: 0,
    total: 0
  });

  useEffect(() => {
    const [initTextbookKey, catalogKey] = getTextbookKeyAndCatalogKey();
    setTextbookKey(initTextbookKey);

    if (catalogKey.length == 0 || initTextbookKey.length == 0) {
      return;
    }

    // 默认查询第一章第一节的题目列表
    const questionListReq: QuestionListReq = {
      textbookKey: textbookKey,
      catalogKey: catalogKey,
      pageNo: pageNo,
      pageSize: 10
    };
    if (!StringValidator.contains(questionTypeVal, StringConst.listSelectAll)) {
      questionListReq.questionTypeVal = questionTypeVal;
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
  }, [leftMenuItemSelectKey, questionTypeVal, refreshListNum]);

  // Drawer
  const [addDrawerSize, setAddDrawerSize] = useState(1200);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState<string>("");
  const [drawerContent, setDrawerContent] = useState<React.ReactNode>("");
  const drawerExtraInfo = <div className="text-xs text-blue-700">提示: 鼠标触摸边框左右拖动可以调整到适合的宽度</div>
  // 添加题目
  const showAddDrawer = () => {
    if (leftMenuItemSelectKey.length == 0 || leftMenuItemSelectKey.split("_").length < 3) {
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
      tagList={tagList}
      textbookKey={textbookKey}
      catalogKey={leftMenuItemSelectKey}
      catalogKeyPath={leftMenuItemSelectKeyPath}
      catalogDict={catalogDict}
      knowledgeInfoDict={knowledgeInfoDict}
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
        {CommonBreadcrumb(subjectDict, catalogDict, knowledgeInfoDict, pathname, leftMenuItemSelectKey, leftMenuItemSelectKeyPath)}
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
              onChange={onQuestionsChange}
            >
              <Radio.Button key={StringConst.listSelectAll} value={StringConst.listSelectAll}>
                {StringConst.listSelectAllDesc}
              </Radio.Button>
              {questionTypeList.map(item => {
                return (
                  <Radio.Button key={item.key} value={item.key}>
                    {item.label}
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
      questionListResp.data?.map(questionInfo => {
        return <div key={questionInfo.id}
                    className="pt-4 pl-4 pr-4 pb-1 hover:border border-blue-950 border-dashed"
        >
          {/* 标签 */}
          {CommonTag(questionInfo, questionTypeList, tagList)}
          {/* 标题 */}
          {CommonTitle(questionInfo)}
          {/* 选项内容 */}
          {CommonSelect(questionInfo)}
          {/* 题目其它标签, 比如查看答案, 关联题目等 */}
          {CommonQuickJumpTag(questionInfo, setOpenDrawer, setDrawerTitle, setDrawerContent, setRefreshListNum, questionTypeList, tagList, catalogDict, knowledgeInfoDict, leftMenuItemSelectKeyPath)}
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
