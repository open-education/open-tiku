import {Alert, Button, Checkbox, Col, Flex, Radio, type RadioChangeEvent, Row, Tag} from "antd";
import type {QuestionInfo, QuestionType} from "~/type/question";
import type {TagInfo} from "~/type/tag";
import {arrayToDict} from "~/util/common";
import React, {type Dispatch, type SetStateAction, useState} from "react";
import {httpClient} from "~/util/http";
import Info from "~/tiku/info";
import Edit from "~/tiku/edit";
import type {EditQuestionTags} from "~/type/edit";

// 题目列表展示标签样式 题目类型在前 标签依次在后
export function CommonTag(
    questionInfo: QuestionInfo,
    questionTypeList: QuestionType[],
    tagList: TagInfo[]
) {
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

// 题目列表右下快速操作区域
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
                title = "编辑";
                break;
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
            if (value === "edit") {
                setDrawerContent(<Edit questionInfo={res}/>);
            } else {
                setDrawerContent(<Info questionInfo={res}/>);
            }
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

// 题目标签基础样式
export function EditTag(
    tagList: TagInfo[] = [],
    tagListVal: string[],
    setTagListVal: Dispatch<SetStateAction<string[]>>,
    setShowTagEdit?: Dispatch<SetStateAction<boolean>>,
) {
    if (!tagList.length) {
        return <Alert
            title="Warning"
            description="标签类型为空"
            type="warning"
            showIcon
            closable
        />
    }

    // @ts-ignore
    const onEditTagsChange: GetProp<typeof Checkbox.Group, "onChange"> = (
        checkedValues: string[]
    ) => {
        setTagListVal(checkedValues);
        if (setShowTagEdit) {
            setShowTagEdit(true);
        }
    };

    return <Checkbox.Group
        defaultValue={tagListVal}
        style={{width: "100%"}}
        onChange={onEditTagsChange}
    >
        <Row>
            {tagList.map(item => {
                return (
                    <Col span={6} key={item.key}>
                        <Checkbox value={item.key}>{item.label}</Checkbox>
                    </Col>
                );
            })}
        </Row>
    </Checkbox.Group>
}

// 添加题目时标签样式
export function AddTagStyle(
    tagList: TagInfo[],
    tagListVal: string[],
    setTagListVal: Dispatch<SetStateAction<string[]>>,
    setShowTagEdit?: Dispatch<SetStateAction<boolean>>,
) {
    return <Row gutter={[10, 10]}>
        <Col span={24}>
            <div className="text-blue-700 text-[15px] mb-[10px] font-bold">标签</div>
            {EditTag(tagList, tagListVal, setTagListVal, setShowTagEdit)}
        </Col>
    </Row>
}

// 编辑题目时标签样式
export function EditTagStyle(
    tagList: TagInfo[] = [],
    tagListVal: string[],
    setTagListVal: Dispatch<SetStateAction<string[]>>,
    questionInfo: QuestionInfo
) {
    const [showTagEdit, setShowTagEdit] = useState<boolean>(false);
    const [showTagEditErr, setShowTagEditErr] = useState<React.ReactNode>("");

    const updateQuestionTags = () => {
        const req: EditQuestionTags = {
            textbookKey: questionInfo.textbookKey,
            catalogKey: questionInfo.catalogKey,
            id: questionInfo.id,
            tags: tagListVal,
        }
        httpClient.post("/edit/tags", req).then(res => {
            setShowTagEditErr("")
            setShowTagEdit(false);
        }).catch(err => {
            setShowTagEditErr(<div>
                <Alert title={`更新标签出错: ${err.message}`} type={"error"}/>
            </div>);
        })
    }

    const showTagEditArea = <div className="mt-2.5">
        <Flex gap="small" wrap justify={"right"}>
            <Button color="cyan" variant="dashed" onClick={updateQuestionTags}>更新</Button>
        </Flex>
    </div>;

    return <div className="p-2.5 pt-2.5 hover:border border-red-700 border-dashed">
        <div>
            {AddTagStyle(tagList, tagListVal, setTagListVal, setShowTagEdit)}
        </div>
        {showTagEditErr}
        {showTagEdit && showTagEditArea}
    </div>
}
