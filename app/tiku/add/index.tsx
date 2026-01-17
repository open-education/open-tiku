// 题目添加主页
import React, {useState} from "react";
import {Alert, Button, Col, Divider, Flex, Row, Splitter, type UploadFile, Watermark} from "antd";
import Preview from "~/tiku/preview";
import type {CreateQuestionReq, QuestionBaseInfo, QuestionInfoResp, QuestionOption} from "~/type/question";
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
import {AddUploadImageStyle} from "~/tiku/common/upload-image";
import {AddSelectOptionLayout} from "~/tiku/common/select";
import {AddAnswerInfoStyle} from "~/tiku/common/answer";
import {AddKnowledgeInfoStyle} from "~/tiku/common/knowledge";
import {AddAnalyzeInfoStyle} from "~/tiku/common/analyze";
import {AddProcessInfoStyle} from "~/tiku/common/process";
import {AddRemarkInfoStyle} from "~/tiku/common/remark";
import type {Textbook, TextbookOtherDict} from "~/type/textbook";
import Info from "~/tiku/info";
import {AddOptions} from "~/tiku/common/options";

// 添加题目
export default function Add(props: any) {
  const {pathMap} = useOutletContext<TiKuIndexContext>();

  const location = useLocation();
  const pathname = StringUtil.getLastPart(location.pathname, "/");

  const questionTypeList: TextbookOtherDict[] = props.questionTypeList ?? [];
  const questionTagList: TextbookOtherDict[] = props.questionTagList ?? [];
  const childPathMap: Map<number, Textbook[]> = props.childPathMap ?? [];
  const questionCateId: number = Number(props.questionCateId ?? 0);

  // 添加变式题时有上一层级标识
  const sourceId: number = Number(props.sourceId ?? 0);
  const [questionTypeVal, setQuestionTypeVal] = useState<number>(questionTypeList.length > 0 ? questionTypeList[0].id : 0);
  const [tagVal, setTagVal] = useState<number[]>([]);
  const [rateVal, setRateVal] = useState<number>(1);
  const [titleVal, setTitleVal] = useState<string>("");
  const [mentionVal, setMentionVal] = useState<string>("");
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
  const [showSelectVal, setShowSelectVal] = useState<number>(1);
  const [aVal, setAVal] = useState<string>("");
  const [aImageFileList, setAImageFileList] = useState<UploadFile[]>([]);
  const [bVal, setBVal] = useState<string>("");
  const [bImageFileList, setBImageFileList] = useState<UploadFile[]>([]);
  const [cVal, setCVal] = useState<string>("");
  const [cImageFileList, setCImageFileList] = useState<UploadFile[]>([]);
  const [dVal, setDVal] = useState<string>("");
  const [dImageFileList, setDImageFileList] = useState<UploadFile[]>([]);
  const [eVal, setEVal] = useState<string>("");
  const [eImageFileList, setEImageFileList] = useState<UploadFile[]>([]);
  const [answerVal, setAnswerVal] = useState<string>("");
  const [knowledgeVal, setKnowledgeVal] = useState<string>("");
  const [analyzeVal, setAnalyzeVal] = useState<string>("");
  const [analyzeImageFileList, setAnalyzeImageFileList] = useState<UploadFile[]>([]);
  const [processVal, setProcessVal] = useState<string>("");
  const [processImageFileList, setProcessImageFileList] = useState<UploadFile[]>([]);
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
    // 将选项依次加入选项组中
    const options: QuestionOption[] = [];
    if (StringValidator.isNonEmpty(aVal) || aImageFileList.length > 0) {
      options.push({
        label: "A",
        content: aVal,
        images: aImageFileList.map(image => image.name),
        order: 1
      });
    }
    if (StringValidator.isNonEmpty(bVal) || bImageFileList.length > 0) {
      options.push({
        label: "B",
        content: bVal,
        images: bImageFileList.map(image => image.name),
        order: 2
      });
    }
    if (StringValidator.isNonEmpty(cVal) || cImageFileList.length > 0) {
      options.push({
        label: "C",
        content: cVal,
        images: cImageFileList.map(image => image.name),
        order: 3
      });
    }
    if (StringValidator.isNonEmpty(dVal) || dImageFileList.length > 0) {
      options.push({
        label: "D",
        content: dVal,
        images: dImageFileList.map(image => image.name),
        order: 4
      });
    }
    if (StringValidator.isNonEmpty(eVal) || eImageFileList.length > 0) {
      options.push({
        label: "E",
        content: eVal,
        images: eImageFileList.map(image => image.name),
        order: 5
      });
    }

    return {
      analysis: {
        content: analyzeVal,
        images: analyzeImageFileList.map(image => image.name),
      },
      answer: answerVal,
      authorId: 0,
      comment: mentionVal,
      contentPlain: "",
      difficultyLevel: rateVal,
      id: 0,
      images: imageFileList.map(image => image.name),
      knowledge: knowledgeVal,
      options: options,
      optionsLayout: showSelectVal,
      process: {
        content: processVal,
        images: processImageFileList.map(image => image.name),
      },
      questionCateId: questionCateId,
      sourceId: sourceId,
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
      if (currentInfo.sourceId && currentInfo.sourceId > 0) {
        uploadReq.sourceId = currentInfo.sourceId;
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
      if (currentInfo.analysis) {
        uploadReq.analysis = currentInfo.analysis;
      }
      if (currentInfo.process) {
        uploadReq.process = currentInfo.process;
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
          {<AddQuestionTypeStyle
            typeList={questionTypeList}
            typeVal={questionTypeVal}
            setTypeVal={setQuestionTypeVal}
          />}
        </div>

        <Divider
          size="small"
          variant="dashed"
          style={{borderColor: "#7cb305"}}
          dashed
        />

        <div className="p-2.5">
          {<AddTagStyle tagList={questionTagList} tags={tagVal} setTags={setTagVal}/>}
        </div>

        <Divider
          size="small"
          variant="dashed"
          style={{borderColor: "#7cb305"}}
          dashed
        />

        <div className="p-2.5">
          {<AddRateInfoStyle val={rateVal} setVal={setRateVal}/>}
        </div>

        <Divider
          size="small"
          variant="dashed"
          style={{borderColor: "#7cb305"}}
          dashed
        />

        <div className="p-2.5">
          {<AddTitleInfoStyle val={titleVal} setVal={setTitleVal}/>}
        </div>

        <Divider
          size="small"
          variant="dashed"
          style={{borderColor: "#7cb305"}}
          dashed
        />

        <div className="p-2.5">
          {<AddMentionInfoStyle val={mentionVal} setVal={setMentionVal}/>}
        </div>

        <Divider
          size="small"
          variant="dashed"
          style={{borderColor: "#7cb305"}}
          dashed
        />

        <div className="p-2.5">
          {<AddUploadImageStyle images={imageFileList} setImages={setImageFileList} showTitle={true}/>}
        </div>

        <Divider
          size="small"
          variant="dashed"
          style={{borderColor: "#7cb305"}}
          dashed
        />

        <div className="p-2.5">
          {<AddSelectOptionLayout val={showSelectVal} setVal={setShowSelectVal}/>}
        </div>

        <Divider
          size="small"
          variant="dashed"
          style={{borderColor: "#7cb305"}}
          dashed
        />

        <div className="p-2.5">
          {<AddOptions
            aVal={aVal}
            setAVal={setAVal}
            aImages={aImageFileList}
            setAImages={setAImageFileList}
            bVal={bVal}
            setBVal={setBVal}
            bImages={bImageFileList}
            setBImages={setBImageFileList}
            cVal={cVal}
            setCVal={setCVal}
            cImages={cImageFileList}
            setCImages={setCImageFileList}
            dVal={dVal}
            setDVal={setDVal}
            dImages={dImageFileList}
            setDImages={setDImageFileList}
            eVal={eVal}
            setEVal={setEVal}
            eImages={eImageFileList}
            setEImages={setEImageFileList}
          />}
        </div>

        <Divider
          size="small"
          variant="dashed"
          style={{borderColor: "#7cb305"}}
          dashed
        />

        <div className="p-2.5">
          {<AddAnswerInfoStyle val={answerVal} setVal={setAnswerVal}/>}
        </div>

        <Divider
          size="small"
          variant="dashed"
          style={{borderColor: "#7cb305"}}
          dashed
        />

        <div className="p-2.5">
          {<AddKnowledgeInfoStyle val={knowledgeVal} setVal={setKnowledgeVal}/>}
        </div>

        <Divider
          size="small"
          variant="dashed"
          style={{borderColor: "#7cb305"}}
          dashed
        />

        <div className="p-2.5">
          {<AddAnalyzeInfoStyle val={analyzeVal} setVal={setAnalyzeVal}/>}
          {<AddUploadImageStyle images={analyzeImageFileList} setImages={setAnalyzeImageFileList} showTitle={false}/>}
        </div>

        <Divider
          size="small"
          variant="dashed"
          style={{borderColor: "#7cb305"}}
          dashed
        />

        <div className="p-2.5">
          {<AddProcessInfoStyle val={processVal} setVal={setProcessVal}/>}
          {<AddUploadImageStyle images={processImageFileList} setImages={setProcessImageFileList} showTitle={false}/>}
        </div>

        <Divider
          size="small"
          variant="dashed"
          style={{borderColor: "#7cb305"}}
          dashed
        />

        <div className="p-2.5">
          {<AddRemarkInfoStyle val={remarkVal} setVal={setRemarkVal}/>}
        </div>
      </Splitter.Panel>

      <Splitter.Panel defaultSize="50%">
        <Watermark content="预览区域 仅展示效果">
          <div className="min-h-475 p-5">
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
