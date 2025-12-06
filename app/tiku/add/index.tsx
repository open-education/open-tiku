// 题目添加主页
import React, {useState} from "react";
import {Alert, Button, Col, Flex, Row, Splitter, type UploadFile, Watermark} from "antd";

import Preview from "../preview";

import type {QuestionInfo, QuestionUploadResp} from "~/type/question";
import {CommonBreadcrumb} from "~/tiku/common/breadcrumb";
import type {TiKuIndexContext} from "~/type/context";
import {useOutletContext} from "react-router-dom";
import {httpClient} from "~/util/http";
import Info from "~/tiku/info";
import {StringUtil} from "~/util/string";
import {AddQuestionTypeStyle} from "~/tiku/common/question-type";
import {AddTagStyle} from "~/tiku/common/tag";
import {AddRateInfoStyle} from "~/tiku/common/rate";
import {AddTitleInfoStyle} from "~/tiku/common/title";
import {AddMentionInfoStyle} from "~/tiku/common/mention";
import {UploadImageStyle} from "~/tiku/common/upload-image";
import {AddSelectStyle} from "~/tiku/common/select";
import {AddAnswerInfoStyle} from "~/tiku/common/answer";
import {AddKnowledgeInfoStyle} from "~/tiku/common/knowledge";
import {AddAnalyzeInfoStyle} from "~/tiku/common/analyze";
import {AddProcessInfoStyle} from "~/tiku/common/process";
import {AddRemarkInfoStyle} from "~/tiku/common/remark";

export default function Add(props: any) {
    const {
        textbookKey,
        catalogKey,
        subjectList,
        catalogList,
        questionTypeList,
        tagList
    } = useOutletContext<TiKuIndexContext>();

    const questionType = questionTypeList[0];
    const [questionTypeVal, setQuestionTypeVal] = useState(questionType.key);

    const tag = tagList[0];
    const [tagVal, setTagVal] = useState([tag.key]);

    const [rateVal, setRateVal] = useState(0);

    const [titleVal, setTitleVal] = useState("");

    const [mentionVal, setMentionVal] = useState("");

    const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
    const [showImageVal, setShowImageVal] = useState("0");

    const [aVal, setAVal] = useState("");
    const [bVal, setBVal] = useState("");
    const [cVal, setCVal] = useState("");
    const [dVal, setDVal] = useState("");
    const [eVal, setEVal] = useState("");
    const [showSelectVal, setShowSelectVal] = useState("1");

    const [answerVal, setAnswerVal] = useState("");

    const [knowledgeVal, setKnowledgeVal] = useState("");

    const [analyzeVal, setAnalyzeVal] = useState("");

    const [processVal, setProcessVal] = useState("");

    const [remarkVal, setRemarkVal] = useState("");

    // 生成预览对象
    const [openPreviewArea, setOpenPreviewArea] = useState(false);
    let [questionInfo, setQuestionInfo] = useState({});

    // 点击生成题目样式预览
    const onToPreview = () => {
        const imageFileNames: string[] = [];
        imageFileList.forEach((image) => {
            imageFileNames.push(image.name);
        });

        let previewQuestionInfo: QuestionInfo = {
            id: "",
            textbookKey: textbookKey,
            catalogKey: catalogKey,
            questionType: questionTypeVal,
            tags: tagVal,
            rateVal: rateVal.toString(),
            titleVal: titleVal,
            mentionVal: mentionVal,
            imageNames: imageFileNames,
            showImageVal: showImageVal,
            aVal: aVal,
            bVal: bVal,
            cVal: cVal,
            dVal: dVal,
            eVal: eVal,
            showSelectVal: showSelectVal,
            answerVal: answerVal,
            knowledgeVal: knowledgeVal,
            analyzeVal: analyzeVal,
            processVal: processVal,
            remarkVal: remarkVal,
        }
        setOpenPreviewArea(true);
        setQuestionInfo(previewQuestionInfo);
    };

    // Notice
    const [uploadQuestionIng, setUploadQuestionIng] = useState<React.ReactNode>("");
    const [uploadQuestionErr, setUploadQuestionErr] = useState<React.ReactNode>("");
    const [reqQuestionInfoErr, setReqQuestionInfoErr] = useState<React.ReactNode>("");

    // 保存
    const onToUploadQuestion = () => {
        if (confirm("确定要上传题目吗？")) {
            setUploadQuestionIng(<Alert title="题目上传中..." type="info"/>);

            const imageFileNames: string[] = [];
            imageFileList.forEach((image) => {
                imageFileNames.push(image.name);
            });

            const uploadReq = {
                textbookKey,
                catalogKey,
                questionType: questionTypeVal,
                tags: tagVal,
                rateVal: rateVal.toString(),
                titleVal,
                imageNames: imageFileNames,
                mentionVal,
                showImageVal,
                aVal,
                bVal,
                cVal,
                dVal,
                eVal,
                showSelectVal,
                answerVal,
                knowledgeVal,
                analyzeVal,
                processVal,
                remarkVal,
            }

            httpClient.post<QuestionUploadResp>("/question/upload", uploadReq).then(uploadRes => {
                setUploadQuestionIng("");

                // 获取题目全部信息
                httpClient.post<QuestionInfo>(`/question/info`, {
                    "id": uploadRes.id,
                    "textbookKey": textbookKey,
                    "catalogKey": catalogKey,
                }).then(readRes => {
                    props.setDrawerTitle("详情");
                    props.setDrawerContent(<Info questionInfo={readRes}/>);

                    props.setRefreshListNum(StringUtil.getRandomInt());
                }).catch(err => {
                    setReqQuestionInfoErr(<Alert
                        title="Error"
                        description={`读取题目详情出错: ${err.message}`}
                        type="error"
                        showIcon
                    />)
                })
            }).catch(err => {
                setUploadQuestionErr(<Alert
                    title="Error"
                    description={`上传题目出错: ${err.message}`}
                    type="error"
                    showIcon
                />);
            });
        }
    };

    return <div>
        <Row>
            <Col span={24}>
                {/* 面包屑快速导航 */}
                {CommonBreadcrumb(subjectList, catalogList, textbookKey, catalogKey)}
            </Col>
        </Row>

        <Row gutter={[20, 20]}>
            <Col span={24}>
                {uploadQuestionIng}
                {uploadQuestionErr}
                {reqQuestionInfoErr}
            </Col>
        </Row>

        <Row style={{marginTop: "20px"}}>
            <Col>
                <Flex gap="small" wrap>
                    <Button type="dashed" onClick={onToPreview}>
                        预览
                    </Button>
                    <Button type="primary" onClick={onToUploadQuestion}>
                        保存
                    </Button>
                </Flex>
            </Col>
        </Row>

        <Splitter style={{boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", marginTop: "10px"}}>
            <Splitter.Panel defaultSize={"50%"}>
                <div className="p-2.5">
                    {AddQuestionTypeStyle(questionTypeList, questionTypeVal, setQuestionTypeVal)}
                </div>
                <div className="p-2.5">
                    {AddTagStyle(tagList, tagVal, setTagVal)}
                </div>
                <div className="p-2.5">
                    {AddRateInfoStyle(rateVal, setRateVal)}
                </div>
                <div className="p-2.5">
                    {AddTitleInfoStyle(titleVal, setTitleVal)}
                </div>
                <div className="p-2.5">
                    {AddMentionInfoStyle(mentionVal, setMentionVal)}
                </div>
                {UploadImageStyle(textbookKey, catalogKey, imageFileList, setImageFileList, showImageVal, setShowImageVal)}
                {AddSelectStyle(aVal, setAVal, bVal, setBVal, cVal, setCVal, dVal, setDVal, eVal, setEVal, showSelectVal, setShowSelectVal)}
                <div className="p-2.5">
                    {AddAnswerInfoStyle(answerVal, setAnswerVal)}
                </div>
                <div className="p-2.5">
                    {AddKnowledgeInfoStyle(knowledgeVal, setKnowledgeVal)}
                </div>
                <div className="p-2.5">
                    {AddAnalyzeInfoStyle(analyzeVal, setAnalyzeVal)}
                </div>
                <div className="p-2.5">
                    {AddProcessInfoStyle(processVal, setProcessVal)}
                </div>
                <div className="p-2.5">
                    {AddRemarkInfoStyle(remarkVal, setRemarkVal)}
                </div>
            </Splitter.Panel>

            <Splitter.Panel defaultSize="50%">
                <Watermark content="预览区域 仅展示效果">
                    <div className="min-h-[1900px] p-5">
                        {openPreviewArea ? <Preview questionInfo={questionInfo}/> : ""}
                    </div>
                </Watermark>
            </Splitter.Panel>
        </Splitter>
    </div>
}
