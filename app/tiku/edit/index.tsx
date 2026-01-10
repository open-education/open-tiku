// 题目编辑主页
import React, {type Dispatch, type SetStateAction, useState} from "react";
import {useLocation, useOutletContext} from "react-router-dom";
import type {TiKuIndexContext} from "~/type/context";
import {Button, Col, Flex, Row, Splitter, type UploadFile, Watermark} from "antd";
import {CommonBreadcrumb} from "~/tiku/common/breadcrumb";
import Preview from "~/tiku/preview";
import {EditQuestionTypeStyle} from "~/tiku/common/question-type";
import type {Content, QuestionBaseInfo, QuestionInfoResp, QuestionOption} from "~/type/question";
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
import {StringUtil, StringValidator} from "~/util/string";
import type {Textbook, TextbookOtherDict} from "~/type/textbook";

// 编辑组件
export default function Edit(props: any) {
  const {pathMap} = useOutletContext<TiKuIndexContext>();

  const setRefreshListNum: Dispatch<SetStateAction<number>> = props.setRefreshListNum;

  const location = useLocation();
  const pathname = StringUtil.getLastPart(location.pathname, "/");

  const reqQuestionInfo: QuestionInfoResp = props.questionInfo;
  const questionTypeList: TextbookOtherDict[] = props.questionTypeList ?? [];
  const questionTagList: TextbookOtherDict[] = props.questionTagList ?? [];
  const childPathMap: Map<number, Textbook[]> = props.childPathMap ?? [];

  // 题目类型
  const [questionTypeVal, setQuestionTypeVal] = useState<number>(reqQuestionInfo.baseInfo.questionTypeId);

  // 题目标签
  const [tagListVal, setTagListVal] = useState<number[]>(reqQuestionInfo.baseInfo.questionTagIds ?? []);

  const [rateVal, setRateVal] = useState<number>(Number(reqQuestionInfo.baseInfo.difficultyLevel ?? 0));

  const [titleVal, setTitleVal] = useState<string>(reqQuestionInfo.baseInfo.title);

  const [mentionVal, setMentionVal] = useState<string>(reqQuestionInfo.baseInfo.comment ?? "");

  const getImageFileList = (imageNames: string[]): UploadFile[] => {
    let imageFiles: UploadFile[] = [];
    for (let i = 0; i < imageNames.length; i++) {
      imageFiles.push({
        name: imageNames[i],
        status: "done",
        uid: i.toString(),
        url: `/api/file/read/${imageNames[i]}`
      });
    }
    return imageFiles;
  }

  const [imageFileList, setImageFileList] = useState<UploadFile[]>(getImageFileList(reqQuestionInfo.baseInfo.images ?? []));

  // 选项数据
  const options: QuestionOption[] = reqQuestionInfo.baseInfo.options ?? [];
  // 定义一个默认对象，防止访问内部属性时报错
  const defaultOpt = {label: '', content: '', images: [], order: 0};
  const [
    opt0 = defaultOpt,
    opt1 = defaultOpt,
    opt2 = defaultOpt,
    opt3 = defaultOpt,
    opt4 = defaultOpt,
  ] = options;
  const [aVal, setAVal] = useState<string>(opt0.content ?? "");
  const [bVal, setBVal] = useState<string>(opt1.content ?? "");
  const [cVal, setCVal] = useState<string>(opt2.content ?? "");
  const [dVal, setDVal] = useState<string>(opt3.content ?? "");
  const [eVal, setEVal] = useState<string>(opt4.content ?? "");
  const [showSelectVal, setShowSelectVal] = useState<number>(reqQuestionInfo.baseInfo.optionsLayout ?? 1);

  const [answerVal, setAnswerVal] = useState<string>(reqQuestionInfo.extraInfo.answer ?? "");

  const [knowledgeVal, setKnowledgeVal] = useState<string>(reqQuestionInfo.extraInfo.knowledge ?? "");

  const [analyzeVal, setAnalyzeVal] = useState<string>(reqQuestionInfo.extraInfo.analysis?.content ?? "");

  const [processVal, setProcessVal] = useState<string>(reqQuestionInfo.extraInfo.process?.content ?? "");

  const [remarkVal, setRemarkVal] = useState<string>(reqQuestionInfo.extraInfo.remark ?? "");

  // 生成预览对象
  const [openEditPreviewArea, setOpenEditPreviewArea] = useState<boolean>(false);
  let [editPreviewQuestionInfo, setEditPreviewQuestionInfo] = useState<QuestionBaseInfo>({
    analysis: undefined,
    answer: "",
    authorId: 0,
    comment: "",
    contentPlain: "",
    difficultyLevel: 0,
    id: 0,
    images: [],
    knowledge: "",
    options: [],
    optionsLayout: 0,
    process: undefined,
    questionCateId: 0,
    questionTagIds: [],
    questionTypeId: 0,
    remark: "",
    title: ""
  });

  // 首页页面的值用于展示和提交
  const getCurrentQuestionBaseInfo = (): QuestionBaseInfo => {
    const imageFileNames: string[] = [];
    imageFileList.forEach((image) => {
      imageFileNames.push(image.name);
    });

    const analysis: Content = {
      content: analyzeVal,
      images: []
    }

    const process: Content = {
      content: processVal,
      images: [],
    }

    // 将选项依次加入选项组中
    const options: QuestionOption[] = [];
    if (StringValidator.isNonEmpty(aVal)) {
      options.push({
        label: "A",
        content: aVal,
        order: 1
      });
    }
    if (StringValidator.isNonEmpty(bVal)) {
      options.push({
        label: "B",
        content: bVal,
        order: 2
      });
    }
    if (StringValidator.isNonEmpty(cVal)) {
      options.push({
        label: "C",
        content: cVal,
        order: 3
      });
    }
    if (StringValidator.isNonEmpty(dVal)) {
      options.push({
        label: "D",
        content: dVal,
        order: 4
      });
    }
    if (StringValidator.isNonEmpty(eVal)) {
      options.push({
        label: "E",
        content: eVal,
        order: 5
      });
    }

    return {
      analysis: analysis,
      answer: answerVal,
      authorId: 0,
      comment: mentionVal,
      contentPlain: "",
      difficultyLevel: rateVal,
      id: 0,
      images: imageFileNames,
      knowledge: knowledgeVal,
      options: options,
      optionsLayout: showSelectVal,
      process: process,
      questionCateId: reqQuestionInfo.baseInfo.questionCateId,
      questionTagIds: tagListVal,
      questionTypeId: questionTypeVal,
      remark: remarkVal,
      title: titleVal
    }
  }

  // 点击生成题目样式预览
  const onToEditPreview = () => {
    setOpenEditPreviewArea(true);
    setEditPreviewQuestionInfo(getCurrentQuestionBaseInfo());
  };

  return <div>
    <Row>
      <Col span={24}>
        {/* 面包屑快速导航 */}
        {CommonBreadcrumb(pathMap, pathname, childPathMap, reqQuestionInfo.baseInfo.questionCateId)}
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
        {EditQuestionTypeStyle(questionTypeList, questionTypeVal, setQuestionTypeVal, reqQuestionInfo.baseInfo, setRefreshListNum)}

        {/* 题目标签 */}
        {EditTagStyle(questionTagList, tagListVal, setTagListVal, reqQuestionInfo.baseInfo, setRefreshListNum)}

        {/* rate */}
        {EditRateInfoStyle(rateVal, setRateVal, reqQuestionInfo.baseInfo, setRefreshListNum)}

        {/* title */}
        {EditTitleInfoStyle(titleVal, setTitleVal, reqQuestionInfo.baseInfo, setRefreshListNum)}

        {/* mention */}
        {EditMentionInfoStyle(mentionVal, setMentionVal, reqQuestionInfo.baseInfo, setRefreshListNum)}

        {/* image */}
        {UploadImageStyle(reqQuestionInfo.baseInfo.questionCateId, imageFileList, setImageFileList, reqQuestionInfo.baseInfo.id, setRefreshListNum)}

        {/* select */}
        {EditSelectStyle(aVal, setAVal, bVal, setBVal, cVal, setCVal, dVal, setDVal, eVal, setEVal, showSelectVal, setShowSelectVal, reqQuestionInfo.baseInfo, setRefreshListNum)}

        {/* answer */}
        {EditAnswerInfoStyle(answerVal, setAnswerVal, reqQuestionInfo.baseInfo, setRefreshListNum)}

        {/* knowledge */}
        {EditKnowledgeInfoStyle(knowledgeVal, setKnowledgeVal, reqQuestionInfo.baseInfo, setRefreshListNum)}

        {/* analyze */}
        {EditAnalyzeInfoStyle(analyzeVal, setAnalyzeVal, reqQuestionInfo.baseInfo, setRefreshListNum)}

        {/* process */}
        {EditProcessInfoStyle(processVal, setProcessVal, reqQuestionInfo.baseInfo, setRefreshListNum)}

        {/* remark */}
        {EditRemarkInfoStyle(remarkVal, setRemarkVal, reqQuestionInfo.baseInfo, setRefreshListNum)}
      </Splitter.Panel>

      <Splitter.Panel defaultSize="50%">
        <Watermark content="预览区域 仅展示效果">
          <div className="min-h-[1900px] p-5">
            {openEditPreviewArea ? <Preview
              questionInfo={editPreviewQuestionInfo}
              questionTypeList={questionTypeList}
              questionTagList={questionTagList}
            /> : ""}
          </div>
        </Watermark>
      </Splitter.Panel>
    </Splitter>
  </div>
};
