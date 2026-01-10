// 题目添加主页
import React, {useState} from "react";
import {Alert, Button, Col, Flex, Row, Splitter, type UploadFile, Watermark} from "antd";

import Preview from "~/tiku/preview";

import type {Content, CreateQuestionReq, QuestionBaseInfo, QuestionInfoResp, QuestionOption} from "~/type/question";
import {CommonBreadcrumb} from "~/tiku/common/breadcrumb";
import type {TiKuIndexContext} from "~/type/context";
import {useLocation, useOutletContext} from "react-router-dom";
import {httpClient} from "~/util/http";
import {StringUtil, StringValidator} from "~/util/string";
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
import type {Textbook, TextbookOtherDict} from "~/type/textbook";
import Info from "~/tiku/info";

// 添加题目
export default function Add(props: any) {
  const {pathMap} = useOutletContext<TiKuIndexContext>();

  const location = useLocation();
  const pathname = StringUtil.getLastPart(location.pathname, "/");

  const questionTypeList: TextbookOtherDict[] = props.questionTypeList ?? [];
  const questionTagList: TextbookOtherDict[] = props.questionTagList ?? [];
  const childPathMap: Map<number, Textbook[]> = props.childPathMap ?? [];
  const questionCateId: number = Number(props.questionCateId ?? 0);

  const [questionTypeVal, setQuestionTypeVal] = useState<number>(questionTypeList.length > 0 ? questionTypeList[0].id : 0);

  const [tagVal, setTagVal] = useState<number[]>([]);

  const [rateVal, setRateVal] = useState<number>(1);

  const [titleVal, setTitleVal] = useState<string>("");

  const [mentionVal, setMentionVal] = useState<string>("");

  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);

  const [aVal, setAVal] = useState<string>("");
  const [bVal, setBVal] = useState<string>("");
  const [cVal, setCVal] = useState<string>("");
  const [dVal, setDVal] = useState<string>("");
  const [eVal, setEVal] = useState<string>("");
  const [showSelectVal, setShowSelectVal] = useState<number>(0);

  const [answerVal, setAnswerVal] = useState<string>("");

  const [knowledgeVal, setKnowledgeVal] = useState<string>("");

  const [analyzeVal, setAnalyzeVal] = useState<string>("");

  const [processVal, setProcessVal] = useState<string>("");

  const [remarkVal, setRemarkVal] = useState<string>("");

  // 生成预览对象
  const [openPreviewArea, setOpenPreviewArea] = useState<boolean>(false);
  let [questionInfo, setQuestionInfo] = useState<QuestionBaseInfo>({
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
      questionCateId: questionCateId,
      questionTagIds: tagVal,
      questionTypeId: questionTypeVal,
      remark: remarkVal,
      title: titleVal
    }
  }

  // 点击生成题目样式预览
  const onToPreview = () => {
    setOpenPreviewArea(true);
    setQuestionInfo(getCurrentQuestionBaseInfo());
  };

  // Notice
  const [uploadQuestionIng, setUploadQuestionIng] = useState<React.ReactNode>("");
  const [uploadQuestionErr, setUploadQuestionErr] = useState<React.ReactNode>("");
  const [reqQuestionInfoErr, setReqQuestionInfoErr] = useState<React.ReactNode>("");

  // 保存
  const onToUploadQuestion = () => {
    // 题目不能为空
    if (!StringValidator.isNonWhitespace(titleVal)) {
      return false;
    }

    if (confirm("确定要上传题目吗？")) {
      setUploadQuestionIng(<Alert title="题目上传中..." type="info"/>);

      const currentInfo = getCurrentQuestionBaseInfo();

      const uploadReq: CreateQuestionReq = {
        questionCateId: questionCateId,
        questionTypeId: currentInfo.questionTypeId,
        title: currentInfo.title,
        difficultyLevel: currentInfo.difficultyLevel,
      }
      if (currentInfo.questionTagIds && currentInfo.questionTagIds.length > 0) {
        uploadReq.questionTagIds = currentInfo.questionTagIds;
      }
      if (currentInfo.images && currentInfo.images.length > 0) {
        uploadReq.images = currentInfo.images;
      }
      if (currentInfo.options && currentInfo.options.length > 0) {
        uploadReq.options = currentInfo.options;
      }
      if (currentInfo.optionsLayout) {
        uploadReq.optionsLayout = currentInfo.optionsLayout;
      }
      if (StringValidator.isNonEmpty(currentInfo.answer)) {
        uploadReq.answer = currentInfo.answer;
      }
      if (StringValidator.isNonEmpty(currentInfo.knowledge)) {
        uploadReq.knowledge = currentInfo.knowledge;
      }
      if (currentInfo.analysis && currentInfo.analysis?.content) {
        uploadReq.analysis = currentInfo.analysis;
      }
      if (StringValidator.isNonEmpty(currentInfo.remark)) {
        uploadReq.remark = currentInfo.remark;
      }

      httpClient.post<number>("/question/add", uploadReq).then(addId => {
        setUploadQuestionIng("");

        // 获取题目全部信息
        httpClient.get<QuestionInfoResp>(`/question/info/${addId}`).then(res => {
          props.setDrawerTitle("详情");
          props.setDrawerContent(<Info
            questionInfo={res}
            questionTypeList={questionTypeList}
            questionTagList={questionTagList}
            childPathMap={childPathMap}
          />);

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
        {CommonBreadcrumb(pathMap, pathname, childPathMap, questionCateId)}
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
          {AddTagStyle(questionTagList, tagVal, setTagVal)}
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
        {UploadImageStyle(questionCateId, imageFileList, setImageFileList)}
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
            {openPreviewArea ? <Preview
              questionInfo={questionInfo}
              questionTypeList={questionTypeList}
              questionTagList={questionTagList}/> : ""}
          </div>
        </Watermark>
      </Splitter.Panel>
    </Splitter>
  </div>
}
