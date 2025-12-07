// 选项风格
import type {QuestionInfo} from "~/type/question";
import {Col, Flex, Radio, type RadioChangeEvent, Row} from "antd";
import {StringValidator} from "~/util/string";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import React from "react";
import {AddAInfoStyle, EditAInfoStyle} from "~/tiku/common/a";
import {AddBInfoStyle, EditBInfoStyle} from "~/tiku/common/b";
import {AddCInfoStyle, EditCInfoStyle} from "~/tiku/common/c";
import {AddDInfoStyle, EditDInfoStyle} from "~/tiku/common/d";
import {AddEInfoStyle, EditEInfoStyle} from "~/tiku/common/e";

export function CommonSelect(questionInfo: QuestionInfo) {
    const showSelectVal = questionInfo.showSelectVal;
    if (showSelectVal === "1") {
        return <Row gutter={[10, 10]}>
            <Col span={6}>
                {
                    StringValidator.isNonEmpty(questionInfo.aVal) && <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.aVal}
                    </Markdown>
                }
            </Col>
            <Col span={6}>
                {
                    StringValidator.isNonEmpty(questionInfo.bVal) && <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.bVal}
                    </Markdown>
                }
            </Col>
            <Col span={6}>
                {
                    StringValidator.isNonEmpty(questionInfo.cVal) && <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.cVal}
                    </Markdown>
                }
            </Col>
            <Col span={6}>
                {
                    StringValidator.isNonEmpty(questionInfo.dVal) && <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.dVal}
                    </Markdown>
                }
            </Col>
        </Row>
    } else if (showSelectVal === "2") {
        return <Row gutter={[10, 10]}>
            <Col span={24}>
                {
                    StringValidator.isNonEmpty(questionInfo.aVal) && <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.aVal}
                    </Markdown>
                }
            </Col>
            <Col span={24}>
                {
                    StringValidator.isNonEmpty(questionInfo.bVal) && <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.bVal}
                    </Markdown>
                }
            </Col>
            <Col span={24}>
                {
                    StringValidator.isNonEmpty(questionInfo.cVal) && <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.cVal}
                    </Markdown>
                }
            </Col>
            <Col span={24}>
                {
                    StringValidator.isNonEmpty(questionInfo.dVal) && <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {questionInfo.dVal}
                    </Markdown>
                }
            </Col>
        </Row>
    } else {
        return <Row gutter={[10, 10]}>
            <Col span={24}>
                <Row gutter={[10, 10]}>
                    <Col span={12}>
                        {
                            StringValidator.isNonEmpty(questionInfo.aVal) && <Markdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >
                                {questionInfo.aVal}
                            </Markdown>
                        }
                    </Col>
                    <Col span={12}>
                        {
                            StringValidator.isNonEmpty(questionInfo.bVal) && <Markdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >
                                {questionInfo.bVal}
                            </Markdown>
                        }
                    </Col>
                </Row>
            </Col>
            <Col span={24}>
                <Row gutter={[10, 10]}>
                    <Col span={12}>
                        {
                            StringValidator.isNonEmpty(questionInfo.cVal) && <Markdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >
                                {questionInfo.cVal}
                            </Markdown>
                        }
                    </Col>
                    <Col span={12}>
                        {
                            StringValidator.isNonEmpty(questionInfo.dVal) && <Markdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >
                                {questionInfo.dVal}
                            </Markdown>
                        }
                    </Col>
                </Row>
            </Col>
        </Row>
    }
}

export function SelectTopStyle(
    showSelectVal: string,
    setShowSelectVal: React.Dispatch<React.SetStateAction<string>>,
) {
    const onEditSelectChange = (e: RadioChangeEvent) => {
        setShowSelectVal(e.target.value);
    }

    return <Row gutter={[10, 10]}>
        <Col span={24}>
            <div className="text-blue-700 text-[15px] mb-[10px] font-bold">选项</div>
            <Flex vertical gap="small" justify={"right"}>
                <Radio.Group
                    defaultValue={showSelectVal}
                    buttonStyle="solid"
                    onChange={onEditSelectChange}
                    block
                    options={[
                        {
                            value: "1",
                            label: "展示一行",
                        },
                        {
                            value: "2",
                            label: "展示一列",
                        },
                        {
                            value: "3",
                            label: "展示两列",
                        },
                    ]}
                    optionType="button"
                />
            </Flex>
        </Col>
    </Row>
}

export function AddSelectStyle(
    aVal: string,
    setAVal: React.Dispatch<React.SetStateAction<string>>,
    bVal: string,
    setBVal: React.Dispatch<React.SetStateAction<string>>,
    cVal: string,
    setCVal: React.Dispatch<React.SetStateAction<string>>,
    dVal: string,
    setDVal: React.Dispatch<React.SetStateAction<string>>,
    eVal: string,
    setEVal: React.Dispatch<React.SetStateAction<string>>,
    showSelectVal: string,
    setShowSelectVal: React.Dispatch<React.SetStateAction<string>>,
) {
    return <div>
        <div className="p-2.5">
            {SelectTopStyle(showSelectVal, setShowSelectVal)}
        </div>
        <div className="p-2.5">
            {AddAInfoStyle(aVal, setAVal)}
        </div>
        <div className="p-2.5">
            {AddBInfoStyle(bVal, setBVal)}
        </div>
        <div className="p-2.5">
            {AddCInfoStyle(cVal, setCVal)}
        </div>
        <div className="p-2.5">
            {AddDInfoStyle(dVal, setDVal)}
        </div>
        <div className="p-2.5">
            {AddEInfoStyle(eVal, setEVal)}
        </div>
    </div>
}

export function EditSelectStyle(
    aVal: string,
    setAVal: React.Dispatch<React.SetStateAction<string>>,
    bVal: string,
    setBVal: React.Dispatch<React.SetStateAction<string>>,
    cVal: string,
    setCVal: React.Dispatch<React.SetStateAction<string>>,
    dVal: string,
    setDVal: React.Dispatch<React.SetStateAction<string>>,
    eVal: string,
    setEVal: React.Dispatch<React.SetStateAction<string>>,
    showSelectVal: string,
    setShowSelectVal: React.Dispatch<React.SetStateAction<string>>,
    questionInfo: QuestionInfo,
) {
    return <div>
        <div className="p-2.5">
            {SelectTopStyle(showSelectVal, setShowSelectVal)}
        </div>
        {EditAInfoStyle(aVal, setAVal, questionInfo)}
        {EditBInfoStyle(bVal, setBVal, questionInfo)}
        {EditCInfoStyle(cVal, setCVal, questionInfo)}
        {EditDInfoStyle(dVal, setDVal, questionInfo)}
        {EditEInfoStyle(eVal, setEVal, questionInfo)}
    </div>
}
