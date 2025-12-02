// 根据选择的导航标识处理展示列表
import {Alert, Button, Col, Divider, Drawer, Flex, Pagination, Radio, type RadioChangeEvent, Row} from "antd";
import "katex/dist/katex.min.css";

import type {QuestionListReq, QuestionListResp} from "~/type/question";
import {CommonTitle} from "~/tiku/common/title";
import {CommonSelect} from "~/tiku/common/select";
import {CommonBreadcrumb} from "~/tiku/common/breadcrumb";
import React, {useEffect, useState} from "react";
import {CommonQuickJumpTag, CommonTag} from "~/tiku/common/tag";
import {useOutletContext} from "react-router-dom";
import type {TiKuIndexContext} from "~/type/context";
import {httpClient} from "~/util/http";
import Add from "~/tiku/add";

export default function List() {
    const {
        textbookKey,
        catalogKey,
        catalogKeyChange,
        subjectList,
        catalogList,
        questionTypeList,
        tagList
    } = useOutletContext<TiKuIndexContext>();

    const [pageNo, setPageNo] = useState<number>(1);
    const [questListResTotal, setQuestListResTotal] = useState<number>(0);
    const onPageChange = (page: number) => {
        setPageNo(page);
    }

    // 如果父级书籍栏目发生变化要将分页页码恢复为首页
    useEffect(() => {
        setPageNo(1);
    }, [catalogKeyChange]);

    const [reqQuestListErr, setReqQuestListErr] = useState<React.ReactNode>(null);
    const [refreshListNum, setRefreshListNum] = useState<number>(0);
    const [questionListResp, setQuestionListResp] = useState<QuestionListResp>({
        data: [],
        pageNo: 0,
        pageSize: 0,
        total: 0
    });
    // textbookKey, catalogKey, refreshListNum, pageNo 任何一个发生变化说明需要重新请求列表页
    useEffect(() => {
        // 默认查询第一章第一节的题目列表
        const questionListReq: QuestionListReq = {
            textbookKey: textbookKey,
            catalogKey: catalogKey,
            pageNo: pageNo,
            pageSize: 10
        };
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
    }, [textbookKey, catalogKey, refreshListNum, pageNo]);

    const [questionTypeVal, setQuestionTypeVal] = useState("")

    const onQuestionsChange = ({target: {value}}: RadioChangeEvent) => {
        setQuestionTypeVal(value);
    };

    // Drawer
    const [addDrawerSize, setAddDrawerSize] = useState(1200);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [drawerTitle, setDrawerTitle] = useState<string>("");
    const [drawerContent, setDrawerContent] = useState<React.ReactNode>("");
    const drawerExtraInfo = <div className="text-xs text-blue-700">提示: 鼠标触摸边框左右拖动可以调整到适合的宽度</div>
    // 添加题目
    const showAddDrawer = () => {
        setOpenDrawer(true);
        setDrawerTitle("添加题目");
        setDrawerContent(<Add setDrawerTitle={setDrawerTitle}
                              setDrawerContent={setDrawerContent}
                              setRefreshListNum={setRefreshListNum}
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
                {CommonBreadcrumb(subjectList, catalogList, textbookKey, catalogKey)}
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
                            className="pt-4 pl-4 pr-4 pb-1 hover:border border-blue-950 border-dashed">
                    {/* 标签 */}
                    {CommonTag(questionInfo, questionTypeList, tagList)}
                    {/* 标题 */}
                    {CommonTitle(questionInfo)}
                    {/* 选项内容 */}
                    {CommonSelect(questionInfo)}
                    {/* 题目其它标签, 比如查看答案, 关联题目等 */}
                    {CommonQuickJumpTag(questionInfo, setOpenDrawer, setDrawerTitle, setDrawerContent)}
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
