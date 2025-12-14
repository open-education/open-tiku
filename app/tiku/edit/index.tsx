// 题目编辑主页
import React, {type Dispatch, type SetStateAction, useEffect, useState} from "react";
import {useLocation, useOutletContext} from "react-router-dom";
import type {TiKuIndexContext} from "~/type/context";
import {Button, Col, Flex, Row, Splitter, type UploadFile, Watermark} from "antd";
import {CommonBreadcrumb} from "~/tiku/common/breadcrumb";
import Preview from "~/tiku/preview";
import {EditQuestionTypeStyle} from "~/tiku/common/question-type";
import type {QuestionInfo} from "~/type/question";
import {EditTagStyle} from "~/tiku/common/tag";
import {EditRateInfoStyle} from "~/tiku/common/rate";
import {EditTitleInfoStyle} from "~/tiku/common/title";
import {EditMentionInfoStyle} from "~/tiku/common/mention";
import {EditSelectStyle} from "~/tiku/common/select";
import {EditAnswerInfoStyle} from "~/tiku/common/answer";
import {EditKnowledgeInfoStyle} from "~/tiku/common/knowledge";
import {EditAnalyzeInfoStyle} from "~/tiku/common/analyze";
import {EditProcessInfoStyle} from "~/tiku/common/process";
import {EditRemarkInfoStyle} from "~/tiku/common/remark";
import {UploadImageStyle} from "~/tiku/common/upload-image";
import {StringUtil} from "~/util/string";

export default function Edit(props: any) {
    const {subjectList} = useOutletContext<TiKuIndexContext>();

    const setRefreshListNum: Dispatch<SetStateAction<number>> = props.setRefreshListNum;

    const location = useLocation();
    const pathname = StringUtil.getLastPart(location.pathname, "/");

    const reqQuestionInfo: QuestionInfo = props.questionInfo;
    const questionTypeList = props.questionTypeList ?? [];
    const tagList = props.tagList ?? [];
    const catalogList = props.catalogList ?? [];
    const knowledgeInfoList = props.knowledgeInfoList ?? [];

    // 题目类型
    const [questionTypeVal, setQuestionTypeVal] = useState<string>(reqQuestionInfo.questionType);

    // 题目标签
    const [tagListVal, setTagListVal] = useState<string[]>(reqQuestionInfo.tags ?? []);

    const [rateVal, setRateVal] = useState<number>(Number(reqQuestionInfo.rateVal ?? 0));

    const [titleVal, setTitleVal] = useState<string>(reqQuestionInfo.titleVal);

    const [mentionVal, setMentionVal] = useState<string>(reqQuestionInfo.mentionVal ?? "");

    const getImageFileList = (imageNames: string[]): UploadFile[] => {
        let imageFiles: UploadFile[] = [];
        for (let i = 0; i < imageNames.length; i++) {
            imageFiles.push({
                name: imageNames[i],
                status: "done",
                uid: i.toString(),
                url: `/api/file/read/${reqQuestionInfo.textbookKey}/${reqQuestionInfo.catalogKey}/${imageNames[i]}`
            });
        }
        return imageFiles;
    }

    const [imageFileList, setImageFileList] = useState<UploadFile[]>(getImageFileList(reqQuestionInfo.imageNames ?? []));
    const [showImageVal, setShowImageVal] = useState<string>(reqQuestionInfo.showImageVal ?? "0");

    const [aVal, setAVal] = useState<string>(reqQuestionInfo.aVal ?? "");
    const [bVal, setBVal] = useState<string>(reqQuestionInfo.bVal ?? "");
    const [cVal, setCVal] = useState<string>(reqQuestionInfo.cVal ?? "");
    const [dVal, setDVal] = useState<string>(reqQuestionInfo.dVal ?? "");
    const [eVal, setEVal] = useState<string>(reqQuestionInfo.eVal ?? "");
    const [showSelectVal, setShowSelectVal] = useState<string>(reqQuestionInfo.showSelectVal ?? "1");

    const [answerVal, setAnswerVal] = useState<string>(reqQuestionInfo.answerVal ?? "");

    const [knowledgeVal, setKnowledgeVal] = useState<string>(reqQuestionInfo.knowledgeVal ?? "");

    const [analyzeVal, setAnalyzeVal] = useState<string>(reqQuestionInfo.analyzeVal ?? "");

    const [processVal, setProcessVal] = useState<string>(reqQuestionInfo.processVal ?? "");

    const [remarkVal, setRemarkVal] = useState<string>(reqQuestionInfo.remarkVal ?? "");

    // 上面所有属性值被维护了状态, 但是不刷新页面会被认为该组件没有发生变化, 所以要主动 set 一次
    useEffect(() => {
        setQuestionTypeVal(reqQuestionInfo.questionType ?? "");
        setTagListVal(reqQuestionInfo.tags ?? []);
        setRateVal(Number(reqQuestionInfo.rateVal ?? 0));
        setTitleVal(reqQuestionInfo.titleVal);
        setMentionVal(reqQuestionInfo.mentionVal ?? "");
        setImageFileList(getImageFileList(reqQuestionInfo.imageNames ?? []));
        setShowImageVal(reqQuestionInfo.showImageVal ?? "0");
        setAVal(reqQuestionInfo.aVal ?? "");
        setBVal(reqQuestionInfo.bVal ?? "");
        setCVal(reqQuestionInfo.cVal ?? "");
        setDVal(reqQuestionInfo.dVal ?? "");
        setEVal(reqQuestionInfo.eVal ?? "");
        setShowSelectVal(reqQuestionInfo.showSelectVal ?? "1");
        setAnswerVal(reqQuestionInfo.answerVal ?? "");
        setKnowledgeVal(reqQuestionInfo.knowledgeVal ?? "");
        setAnalyzeVal(reqQuestionInfo.analyzeVal ?? "");
        setProcessVal(reqQuestionInfo.processVal ?? "");
        setRemarkVal(reqQuestionInfo.remarkVal ?? "");

        setOpenEditPreviewArea(false);
    }, [reqQuestionInfo]);

    // 生成预览对象
    const [openEditPreviewArea, setOpenEditPreviewArea] = useState<boolean>(false);
    let [editPreviewQuestionInfo, setEditPreviewQuestionInfo] = useState<QuestionInfo>({
        aVal: "",
        analyzeVal: "",
        answerVal: "",
        bVal: "",
        cVal: "",
        catalogKey: "",
        dVal: "",
        eVal: "",
        id: "",
        imageNames: [],
        knowledgeVal: "",
        mentionVal: "",
        processVal: "",
        questionType: "",
        rateVal: "",
        remarkVal: "",
        showImageVal: "",
        showSelectVal: "",
        tags: [],
        textbookKey: "",
        titleVal: ""
    });
    // 点击生成题目样式预览
    const onToEditPreview = () => {
        const imageFileNames: string[] = [];
        imageFileList.forEach((image) => {
            imageFileNames.push(image.name);
        });

        let previewQuestionInfo: QuestionInfo = {
            id: "",
            textbookKey: reqQuestionInfo.textbookKey,
            catalogKey: reqQuestionInfo.catalogKey,
            questionType: questionTypeVal,
            tags: tagListVal,
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
        setOpenEditPreviewArea(true);
        setEditPreviewQuestionInfo(previewQuestionInfo);
    };

    return <div>
        <Row>
            <Col span={24}>
                {/* 面包屑快速导航 */}
                {CommonBreadcrumb(subjectList, catalogList, knowledgeInfoList, pathname, reqQuestionInfo.catalogKey)}
            </Col>
        </Row>

        <div className="mt-2.5 text-blue-700">
            <p>编辑方式： </p>
            <p>1. 鼠标移动到区块上会浮动出虚线边框表示该块内容的范围，直接调整要变更的内容后单击更新即可;</p>
            <p>2. 如果变更了内容但是又不想更新, 不点击 更新 按钮即可, 但是预览还是你当前选择的效果，不会主动保存;</p>
            <p>3. 图片没有这个效果，上传新图片或者删除旧图片都是立即生效.</p>
        </div>

        <Row style={{marginTop: "20px"}}>
            <Col>
                <Flex gap="small" wrap>
                    <Button type="dashed" onClick={onToEditPreview}>
                        预览
                    </Button>
                </Flex>
            </Col>
        </Row>

        <Splitter
            style={{boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", marginTop: "10px"}}
        >
            <Splitter.Panel defaultSize={"50%"}>
                {/* 题目类型 */}
                {EditQuestionTypeStyle(questionTypeList, questionTypeVal, setQuestionTypeVal, reqQuestionInfo, setRefreshListNum)}

                {/* 题目标签 */}
                {EditTagStyle(tagList, tagListVal, setTagListVal, reqQuestionInfo, setRefreshListNum)}

                {/* rate */}
                {EditRateInfoStyle(rateVal, setRateVal, reqQuestionInfo, setRefreshListNum)}

                {/* title */}
                {EditTitleInfoStyle(titleVal, setTitleVal, reqQuestionInfo, setRefreshListNum)}

                {/* mention */}
                {EditMentionInfoStyle(mentionVal, setMentionVal, reqQuestionInfo, setRefreshListNum)}

                {/* image */}
                {UploadImageStyle(reqQuestionInfo.textbookKey, reqQuestionInfo.catalogKey, imageFileList, setImageFileList, showImageVal, setShowImageVal, reqQuestionInfo.id)}

                {/* select */}
                {EditSelectStyle(aVal, setAVal, bVal, setBVal, cVal, setCVal, dVal, setDVal, eVal, setEVal, showSelectVal, setShowSelectVal, reqQuestionInfo, setRefreshListNum)}

                {/* answer */}
                {EditAnswerInfoStyle(answerVal, setAnswerVal, reqQuestionInfo, setRefreshListNum)}

                {/* knowledge */}
                {EditKnowledgeInfoStyle(knowledgeVal, setKnowledgeVal, reqQuestionInfo, setRefreshListNum)}

                {/* analyze */}
                {EditAnalyzeInfoStyle(analyzeVal, setAnalyzeVal, reqQuestionInfo, setRefreshListNum)}

                {/* process */}
                {EditProcessInfoStyle(processVal, setProcessVal, reqQuestionInfo, setRefreshListNum)}

                {/* remark */}
                {EditRemarkInfoStyle(remarkVal, setRemarkVal, reqQuestionInfo, setRefreshListNum)}
            </Splitter.Panel>

            <Splitter.Panel defaultSize="50%">
                <Watermark content="预览区域 仅展示效果">
                    <div className="min-h-[1900px] p-5">
                        {openEditPreviewArea ? <Preview
                            questionInfo={editPreviewQuestionInfo}
                            questionTypeList={questionTypeList}
                            tagList={tagList}/> : ""}
                    </div>
                </Watermark>
            </Splitter.Panel>
        </Splitter>
    </div>
};
