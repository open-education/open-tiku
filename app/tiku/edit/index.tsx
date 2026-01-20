// 题目编辑主页
import React, {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useState,
} from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import type { TiKuIndexContext } from "~/type/context";
import {
  Button,
  Col,
  Flex,
  Row,
  Splitter,
  type UploadFile,
  Watermark,
} from "antd";
import { CommonBreadcrumb } from "~/tiku/common/breadcrumb";
import Preview from "~/tiku/preview";
import { EditQuestionTypeStyle } from "~/tiku/common/question-type";
import type {
  QuestionBaseInfo,
  QuestionInfoResp,
  QuestionOption,
} from "~/type/question";
import { EditTagStyle } from "~/tiku/common/tag";
import { EditRateInfoStyle } from "~/tiku/common/rate";
import { EditTitleInfoStyle } from "~/tiku/common/title";
import { EditMentionInfoStyle } from "~/tiku/common/mention";
import { EditAnswerInfoStyle } from "~/tiku/common/answer";
import { EditKnowledgeInfoStyle } from "~/tiku/common/knowledge";
import { EditAnalyzeInfoStyle } from "~/tiku/common/analyze";
import { EditProcessInfoStyle } from "~/tiku/common/process";
import { EditRemarkInfoStyle } from "~/tiku/common/remark";
import { EditUploadImageStyle } from "~/tiku/common/upload-image";
import { StringUtil, StringValidator } from "~/util/string";
import type { Textbook, TextbookOtherDict } from "~/type/textbook";
import { EditOptions } from "~/tiku/common/options";
import { EditSelectOptionLayout } from "~/tiku/common/select";
import { arrayToDict } from "~/util/common";

// 编辑组件
export default function Edit(props: any) {
  const { pathMap } = useOutletContext<TiKuIndexContext>();

  const setRefreshListNum: Dispatch<SetStateAction<number>> =
    props.setRefreshListNum;
  const location = useLocation();
  const pathname = StringUtil.getLastPart(location.pathname, "/");

  const reqQuestionInfo: QuestionInfoResp = props.questionInfo;
  const questionTypeList: TextbookOtherDict[] = props.questionTypeList ?? [];
  const questionTagList: TextbookOtherDict[] = props.questionTagList ?? [];
  const childPathMap: Map<number, Textbook[]> = props.childPathMap ?? [];

  // 题目类型
  const [questionTypeVal, setQuestionTypeVal] = useState<number>(
    reqQuestionInfo.baseInfo.questionTypeId,
  );

  // 监听题型类型是否为选择题
  const questionTypeDict = arrayToDict(questionTypeList, "id");
  // 是否显示选择题选项
  const [showOptions, setShowOptions] = useState<boolean>(
    questionTypeDict[reqQuestionInfo.baseInfo.questionTypeId]?.isSelect ??
      false,
  );
  useEffect(() => {
    setShowOptions(questionTypeDict[questionTypeVal]?.isSelect ?? false);
  }, [questionTypeVal]);

  // 题目标签
  const [tagListVal, setTagListVal] = useState<number[]>(
    reqQuestionInfo.baseInfo.questionTagIds ?? [],
  );
  const [rateVal, setRateVal] = useState<number>(
    Number(reqQuestionInfo.baseInfo.difficultyLevel ?? 0),
  );
  const [titleVal, setTitleVal] = useState<string>(
    reqQuestionInfo.baseInfo.title,
  );
  const [mentionVal, setMentionVal] = useState<string>(
    reqQuestionInfo.baseInfo.comment ?? "",
  );

  const getImageFileList = (imageNames: string[]): UploadFile[] => {
    return imageNames?.map((name, i) => ({
      name,
      status: "done",
      uid: i.toString(),
      url: `/api/file/read/${name}`,
    }));
  };
  const [imageFileList, setImageFileList] = useState<UploadFile[]>(
    getImageFileList(reqQuestionInfo.baseInfo.images ?? []),
  );

  const [showSelectVal, setShowSelectVal] = useState<number>(
    reqQuestionInfo.baseInfo.optionsLayout ?? 1,
  );

  // 选项数据
  const options: QuestionOption[] = reqQuestionInfo.baseInfo.options ?? [];
  // 定义一个默认对象，防止访问内部属性时报错
  const defaultOpt = { label: "", content: "", images: [], order: 0 };
  const [
    opt0 = defaultOpt,
    opt1 = defaultOpt,
    opt2 = defaultOpt,
    opt3 = defaultOpt,
    opt4 = defaultOpt,
  ] = options;
  const [aVal, setAVal] = useState<string>(opt0.content ?? "");
  const [aImageFileList, setAImageFileList] = useState<UploadFile[]>(
    getImageFileList(opt0.images ?? []),
  );
  const [bVal, setBVal] = useState<string>(opt1.content ?? "");
  const [bImageFileList, setBImageFileList] = useState<UploadFile[]>(
    getImageFileList(opt1.images ?? []),
  );
  const [cVal, setCVal] = useState<string>(opt2.content ?? "");
  const [cImageFileList, setCImageFileList] = useState<UploadFile[]>(
    getImageFileList(opt2.images ?? []),
  );
  const [dVal, setDVal] = useState<string>(opt3.content ?? "");
  const [dImageFileList, setDImageFileList] = useState<UploadFile[]>(
    getImageFileList(opt3.images ?? []),
  );
  const [eVal, setEVal] = useState<string>(opt4.content ?? "");
  const [eImageFileList, setEImageFileList] = useState<UploadFile[]>(
    getImageFileList(opt4.images ?? []),
  );

  const [answerVal, setAnswerVal] = useState<string>(
    reqQuestionInfo.extraInfo.answer ?? "",
  );
  const [knowledgeVal, setKnowledgeVal] = useState<string>(
    reqQuestionInfo.extraInfo.knowledge ?? "",
  );
  const [analyzeVal, setAnalyzeVal] = useState<string>(
    reqQuestionInfo.extraInfo.analysis?.content ?? "",
  );
  const [analyzeImageFileList, setAnalyzeImageFileList] = useState<
    UploadFile[]
  >(getImageFileList(reqQuestionInfo.extraInfo.analysis?.images ?? []));
  const [processVal, setProcessVal] = useState<string>(
    reqQuestionInfo.extraInfo.process?.content ?? "",
  );
  const [processImageFileList, setProcessImageFileList] = useState<
    UploadFile[]
  >(getImageFileList(reqQuestionInfo.extraInfo.process?.images ?? []));
  const [remarkVal, setRemarkVal] = useState<string>(
    reqQuestionInfo.extraInfo.remark ?? "",
  );

  // 生成预览对象
  const [openEditPreviewArea, setOpenEditPreviewArea] =
    useState<boolean>(false);

  let [editPreviewQuestionInfo, setEditPreviewQuestionInfo] =
    useState<QuestionBaseInfo>({
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
      title: "",
    });

  // 首页页面的值用于展示和提交
  const getCurrentQuestionBaseInfo = (): QuestionBaseInfo => {
    // 将选项依次加入选项组中
    const options: QuestionOption[] = [];
    if (showOptions) {
      if (StringValidator.isNonEmpty(aVal) || aImageFileList.length > 0) {
        options.push({
          label: "A",
          content: aVal,
          images: aImageFileList.map((image) => image.name),
          order: 1,
        });
      }
      if (StringValidator.isNonEmpty(bVal) || bImageFileList.length > 0) {
        options.push({
          label: "B",
          content: bVal,
          images: bImageFileList.map((image) => image.name),
          order: 2,
        });
      }
      if (StringValidator.isNonEmpty(cVal) || cImageFileList.length > 0) {
        options.push({
          label: "C",
          content: cVal,
          images: cImageFileList.map((image) => image.name),
          order: 3,
        });
      }
      if (StringValidator.isNonEmpty(dVal) || dImageFileList.length > 0) {
        options.push({
          label: "D",
          content: dVal,
          images: dImageFileList.map((image) => image.name),
          order: 4,
        });
      }
      if (StringValidator.isNonEmpty(eVal) || eImageFileList.length > 0) {
        options.push({
          label: "E",
          content: eVal,
          images: eImageFileList.map((image) => image.name),
          order: 5,
        });
      }
    }

    return {
      analysis: {
        content: analyzeVal,
        images: analyzeImageFileList.map((image) => image.name),
      },
      answer: answerVal,
      authorId: 0,
      comment: mentionVal,
      contentPlain: "",
      difficultyLevel: rateVal,
      id: 0,
      images: imageFileList.map((image) => image.name),
      knowledge: knowledgeVal,
      options: options,
      optionsLayout: showSelectVal,
      process: {
        content: processVal,
        images: processImageFileList.map((image) => image.name),
      },
      questionCateId: reqQuestionInfo.baseInfo.questionCateId,
      questionTagIds: tagListVal,
      questionTypeId: questionTypeVal,
      remark: remarkVal,
      title: titleVal,
    };
  };

  // 点击生成题目样式预览
  const onToEditPreview = () => {
    setOpenEditPreviewArea(true);
    setEditPreviewQuestionInfo(getCurrentQuestionBaseInfo());
  };

  return (
    <div>
      <Row>
        <Col span={24}>
          {/* 面包屑快速导航 */}
          {CommonBreadcrumb(
            pathMap,
            pathname,
            childPathMap,
            reqQuestionInfo.baseInfo.questionCateId,
          )}
        </Col>
      </Row>

      <div className="mt-2.5 text-blue-700">
        <p>编辑方式： </p>
        <p>
          1.
          鼠标移动到区块上会浮动出虚线边框表示该块内容的范围，直接调整要变更的内容后单击更新即可;
        </p>
        <p>
          2. 如果变更了内容但是又不想更新, 不点击 更新 按钮即可,
          但是预览还是你当前选择的效果，不会主动保存;
        </p>
        <p>
          3.
          题型类型编辑从选择题变为非选择题时不会自动清除原有的选项内容(除非后面是强需求才会支持清空),
          如果要编辑需要先手动清空选项后再调整题型;
        </p>
      </div>

      <Row style={{ marginTop: "20px" }}>
        <Col>
          <Flex gap="small" wrap>
            <Button type="dashed" onClick={onToEditPreview}>
              预览
            </Button>
          </Flex>
        </Col>
      </Row>

      <Splitter
        style={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", marginTop: "10px" }}
      >
        <Splitter.Panel defaultSize={"50%"}>
          {/* 题目类型 */}
          {
            <EditQuestionTypeStyle
              typeList={questionTypeList}
              typeVal={questionTypeVal}
              setTypeVal={setQuestionTypeVal}
              id={reqQuestionInfo.baseInfo.id}
              setRefreshListNum={setRefreshListNum}
            />
          }

          {/* 题目标签 */}
          {
            <EditTagStyle
              tagList={questionTagList}
              tags={tagListVal}
              setTags={setTagListVal}
              id={reqQuestionInfo.baseInfo.id}
              setRefreshListNum={setRefreshListNum}
            />
          }

          {/* rate */}
          {
            <EditRateInfoStyle
              val={rateVal}
              setVal={setRateVal}
              id={reqQuestionInfo.baseInfo.id}
              setRefreshListNum={setRefreshListNum}
            />
          }

          {/* title */}
          {
            <EditTitleInfoStyle
              val={titleVal}
              setVal={setTitleVal}
              id={reqQuestionInfo.baseInfo.id}
              setRefreshListNum={setRefreshListNum}
            />
          }

          {/* mention */}
          {
            <EditMentionInfoStyle
              val={mentionVal}
              setVal={setMentionVal}
              id={reqQuestionInfo.baseInfo.id}
              setRefreshListNum={setRefreshListNum}
            />
          }

          {/* image */}
          {
            <EditUploadImageStyle
              images={imageFileList}
              setImages={setImageFileList}
              showTitle={true}
              id={reqQuestionInfo.baseInfo.id}
              setRefreshListNum={setRefreshListNum}
            />
          }

          {/* 题型为选择题类型时才有选项列表 */}
          {showOptions && (
            <div>
              {/* options layout */}
              {
                <EditSelectOptionLayout
                  val={showSelectVal}
                  setVal={setShowSelectVal}
                  id={reqQuestionInfo.baseInfo.id}
                  setRefreshListNum={setRefreshListNum}
                />
              }

              {/* select */}
              {
                <EditOptions
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
                  id={reqQuestionInfo.baseInfo.id}
                  setRefreshListNum={setRefreshListNum}
                />
              }
            </div>
          )}

          {/* answer */}
          {
            <EditAnswerInfoStyle
              val={answerVal}
              setVal={setAnswerVal}
              id={reqQuestionInfo.baseInfo.id}
              setRefreshListNum={setRefreshListNum}
            />
          }

          {/* knowledge */}
          {
            <EditKnowledgeInfoStyle
              val={knowledgeVal}
              setVal={setKnowledgeVal}
              id={reqQuestionInfo.baseInfo.id}
              setRefreshListNum={setRefreshListNum}
            />
          }

          {/* analyze */}
          {
            <EditAnalyzeInfoStyle
              val={analyzeVal}
              setVal={setAnalyzeVal}
              images={analyzeImageFileList}
              setImages={setAnalyzeImageFileList}
              id={reqQuestionInfo.baseInfo.id}
              setRefreshListNum={setRefreshListNum}
            />
          }

          {/* process */}
          {
            <EditProcessInfoStyle
              val={processVal}
              setVal={setProcessVal}
              images={processImageFileList}
              setImages={setProcessImageFileList}
              id={reqQuestionInfo.baseInfo.id}
              setRefreshListNum={setRefreshListNum}
            />
          }

          {/* remark */}
          {
            <EditRemarkInfoStyle
              val={remarkVal}
              setVal={setRemarkVal}
              id={reqQuestionInfo.baseInfo.id}
              setRefreshListNum={setRefreshListNum}
            />
          }
        </Splitter.Panel>

        <Splitter.Panel defaultSize="50%">
          <Watermark content="预览区域 仅展示效果">
            <div className="min-h-475 p-5">
              {openEditPreviewArea ? (
                <Preview
                  questionInfo={editPreviewQuestionInfo}
                  questionTypeList={questionTypeList}
                  questionTagList={questionTagList}
                />
              ) : (
                ""
              )}
            </div>
          </Watermark>
        </Splitter.Panel>
      </Splitter>
    </div>
  );
}
