import {Col, Flex, Radio, type RadioChangeEvent, Row, Tag} from "antd";
import type {QuestionInfo, QuestionType} from "~/type/question";
import type {TagInfo} from "~/type/tag";
import {arrayToDict} from "~/util/common";
import React, {type Dispatch, type SetStateAction} from "react";
import {httpClient} from "~/util/http";
import Info from "~/tiku/info";

export function CommonTag(questionInfo: QuestionInfo, questionTypeList: QuestionType[], tagList: TagInfo[]) {
    const questionTypeDict = arrayToDict(questionTypeList, 'key');
    const tagsDict = arrayToDict(tagList, 'key');
    return <Row gutter={[10, 10]}>
        <Col span={24}>
            <Flex gap="small" wrap>
                <Tag color="geekblue"
                     key={questionInfo.questionType}>{questionTypeDict[questionInfo.questionType].label}</Tag>
                {
                    questionInfo.tags?.map(tagKey => {
                        return <Tag color="green" key={tagKey}>{tagsDict[tagKey].label}</Tag>
                    })
                }
            </Flex>
        </Col>
    </Row>
}

export function CommonQuickJumpTag(
    questionInfo: QuestionInfo,
    setOpenDrawer: Dispatch<SetStateAction<boolean>>,
    setDrawerTitle: Dispatch<SetStateAction<string>>,
    setDrawerContent: Dispatch<SetStateAction<React.ReactNode>>
) {
    const quickToolList = [
        {
            "key": "1",
            "value": "info",
            "label": "详情"
        },
        {
            "key": "2",
            "value": "answer",
            "label": "答案"
        },
        {
            "key": "3",
            "value": "knowledge",
            "label": "知识点"
        },
        {
            "key": "4",
            "value": "analyze",
            "label": "解题分析"
        },
        {
            "key": "5",
            "value": "process",
            "label": "解题过程"
        },
        {
            "key": "6",
            "value": "remark",
            "label": "备注"
        },
        {
            "key": "7",
            "value": "edit",
            "label": "编辑"
        },
        {
            "key": "8",
            "value": "delete",
            "label": "删除"
        }
    ];
    const onClickQuickTool = ({target: {value}}: RadioChangeEvent) => {
        let title = "";
        let extList: string[] = [];
        switch (value) {
            case "info": {
                title = "详情";
                break;
            }
            case "answer": {
                title = "答案";
                extList.push("answer")
                break;
            }
            case "knowledge": {
                title = "知识点";
                extList.push("knowledge")
                break;
            }
            case "analyze": {
                title = "解题分析";
                extList.push("analyze")
                break;
            }
            case "process": {
                title = "解题过程";
                extList.push("process")
                break;
            }
            case "remark": {
                title = "备注";
                extList.push("remark")
                break;
            }
            case "edit": {
                title = "编辑"; // todo
                return;
            }
            default: {
                return;
            }
        }

        // 获取题目全部信息
        httpClient.post<QuestionInfo>(`/question/info`, {
            "id": questionInfo.id,
            "textbookKey": questionInfo.textbookKey,
            "catalogKey": questionInfo.catalogKey,
            "ext": extList.length == 0 ? null : extList,
        }).then(res => {
            setOpenDrawer(true);
            setDrawerTitle(title);
            setDrawerContent(<Info questionInfo={res}/>);
        })
    }

    return <Row gutter={[10, 10]} className="m-3">
        <Col span={24}>
            <Flex gap="small" wrap justify={"right"}>
                <Radio.Group size={"small"} defaultValue="0" buttonStyle="solid" onChange={onClickQuickTool}>
                    {
                        quickToolList.map(item => {
                            return <Radio.Button value={item.value} key={item.key}>{item.label}</Radio.Button>
                        })
                    }
                </Radio.Group>
            </Flex>
        </Col>
    </Row>
}
