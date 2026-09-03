import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/exam";
import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, HelpCircle, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Textarea } from "~/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { useLocation, useParams } from "react-router";
import { httpClient } from "~/util/http";
import type { CommonPaperGroupResp, GenPaperQuestionResp, GenPaperResp } from "~/type/paper";
import { SimpleAlert } from "~/common/alert";
import { TagShow } from "~/common/paper/tag";
import { getGroupName } from "~/common/paper/print";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";
import { TitleShow } from "~/common/title";
import { Separator } from "~/components/ui/separator";
import { SimpleFullContent } from "~/common/content";
import { MultiOptionSelect } from "~/common/select";
import type { AttemptInfoResp, InProgressLatestAttemptReq, TestAnswerAddReq } from "~/type/test";
import { TestMethod, TestResult } from "~/type/enum";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import { Loading } from "~/common/load";

/// 学生做题首页
export function meta({}: Route.MetaArgs) {
  return [
    { title: "开放题库-正在练题" },
    {
      name: "description",
      content:
        "选择你要做的作业，练习模式为快速刷题，可实时查看答案等说明巩固知识；考试模式需要交卷后可查看答案；你可以记录自己做题的感悟或笔记，方便后续复习该题。",
    },
  ];
}

// 初始化试卷信息
const defaultGenPaperResp: GenPaperResp = {
  common: {
    id: 0,
    relatedId: 0,
    relatedName: "",
    paperType: 0,
    tag: "",
    year: "",
    grade: "",
    semester: "",
    title: "",
    score: 0,
    source: "",
    remark: "",
    authorName: "",
    count: 0,
    status: 0,
    statusDesc: "",
    remarkExt: "",
    createdAt: "",
    updatedAt: "",
  },
  conf: {
    questionCateIds: [],
    questionTypes: [],
  },
  groups: [],
};
// 默认组信息
const defaultCommonPaperGroupResp: CommonPaperGroupResp = {
  id: 0,
  paperId: 0,
  genId: "",
  typeName: "",
  subTitle: "",
};

// 默认题目信息
const defaultGenPaperQuestionResp: GenPaperQuestionResp = {
  common: {
    id: 0,
    paperId: 0,
    groupId: 0,
    genId: "",
    orderNum: 0,
    questionId: 0,
    score: 0,
  },
  info: {
    baseInfo: {
      id: 0,
      questionCateId: 0,
      questionTypeId: 0,
      relationType: 0,
      originalName: "",
      status: 0,
      title: "",
      contentPlain: "",
      difficultyLevel: 0,
      approveName: "",
      createdAt: "",
      updatedAt: "",
    },
    extraInfo: {},
  },
};

export default function Index() {
  // 试卷和做题模式
  const { paperId, examMethod } = useParams();

  const location = useLocation();
  const { hId } = location.state || {};

  const [warnInfo, setWarnInfo] = useState<React.ReactNode>("");

  // 试卷详情
  const [genPaperResp, setGenPaperResp] = useState<GenPaperResp>(defaultGenPaperResp);
  const [genPaperLoading, setGenPaperLoading] = useState<boolean>(false);

  // 进行中的最新做题记录, 没有后台初始化默认的做题记录
  const [latestAttemptResp, setLatestAttemptResp] = useState<AttemptInfoResp | null>(null);
  const [attemptLoading, setAttemptLoading] = useState<boolean>(false);

  // 是否显示题目答案
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  useEffect(() => {
    // 试卷详情
    setGenPaperLoading(true);
    httpClient
      .get<GenPaperResp>(`/paper/gen/info/${paperId}`)
      .then((res) => {
        setGenPaperResp(res);
      })
      .catch((err) => {
        setWarnInfo(<SimpleAlert title="获取试卷详情失败" message={err.message} />);
      })
      .finally(() => {
        setGenPaperLoading(false);
      });

    // 进行中的做题记录
    setAttemptLoading(true);
    let attemptReq: InProgressLatestAttemptReq = {
      id: hId,
      method: Number(examMethod),
    };
    httpClient
      .post<AttemptInfoResp>("/test/attempt/latest", attemptReq)
      .then((res) => {
        setLatestAttemptResp(res);
      })
      .catch((err) => {
        setWarnInfo(<SimpleAlert title="获取进行中的做题记录失败" message={err.message} />);
      })
      .finally(() => {
        setAttemptLoading(false);
      });
  }, [paperId, examMethod, hId]);

  const [groupCommonMap, questionMap, indexToQuestionIdMap, questionIdToIndexMap] = useMemo(() => {
    // Group ID -> GenPaperGroupResp
    const gMap = new Map<number, CommonPaperGroupResp>();
    // questionId -> GenPaperQuestionResp
    const qMap = new Map<number, GenPaperQuestionResp>();
    // index -> questionId
    const indexToQuestionIdMap = new Map<number, number>();
    // questionId -> index
    const questionIdToIndexMap = new Map<number, number>();
    let index = 0;

    if (genPaperResp.common.id === 0) return [gMap, qMap, indexToQuestionIdMap, questionIdToIndexMap];

    genPaperResp.groups.forEach((group) => {
      if (group.common?.id) {
        gMap.set(group.common.id, group.common);
      }

      group.questions.forEach((question) => {
        const qId = question.common.questionId;
        if (qId) {
          qMap.set(qId, question);
          indexToQuestionIdMap.set(index, qId);
          questionIdToIndexMap.set(qId, index);
          index++;
        }
      });
    });

    return [gMap, qMap, indexToQuestionIdMap, questionIdToIndexMap];
  }, [genPaperResp]);

  // 当前选择的问题标识
  const [currentQuestionId, setCurrentQuestionId] = useState<number>(0);
  // 当前选择的索引
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // 更新默认展示的第一题, 否则需要同步更新 currentIndex
  useEffect(() => {
    if (indexToQuestionIdMap.size > 0 && currentQuestionId === 0) {
      const firstQuestionId = indexToQuestionIdMap.get(0) || 0;
      setCurrentQuestionId(firstQuestionId);
    }
  }, [indexToQuestionIdMap, currentQuestionId]);

  // 在组件渲染的第一时间，直接从 Map 中取出当前题目的数据
  // 它会随着 currentQuestionId 或 questionMap 的任何变动而自动、同步更新
  const getCurrentQuestionInfo = (currentQuestionId ? questionMap.get(currentQuestionId) : null) ?? defaultGenPaperQuestionResp;

  // 如果需要获取对应的题型分组信息，也可以直接在下方链式反查
  const getCurrentGroupInfo =
    (getCurrentQuestionInfo.common.id > 0 ? groupCommonMap.get(getCurrentQuestionInfo.common.groupId) : null) ?? defaultCommonPaperGroupResp;

  // 当前选中的选项
  const [selectedOpt, setSelectedOpt] = useState<string>("");
  // 易错提示
  const [showErrorTip, setShowErrorTip] = useState<boolean>(false);

  const handlePrev = () => {
    if (currentIndex > 0) {
      const nextIndex = currentIndex - 1;
      const nextId = indexToQuestionIdMap.get(nextIndex) || 0;
      setCurrentIndex(nextIndex);
      setCurrentQuestionId(nextId);
      setSelectedOpt("");
      setShowAnswer(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < indexToQuestionIdMap.size - 1) {
      const nextIndex = currentIndex + 1;
      const nextId = indexToQuestionIdMap.get(nextIndex) || 0;
      setCurrentIndex(nextIndex);
      setCurrentQuestionId(nextId);
      setSelectedOpt("");
      setShowAnswer(false);
    }
  };

  // 记录用户提交的答案
  const [answerMap, setAnswerMap] = useState<Map<number, TestAnswerAddReq>>(new Map());

  // 当前问题作答信息
  const currentAnswerReq = answerMap.get(currentQuestionId) || {
    attemptId: hId,
    questionId: currentQuestionId,
    answer: "",
    result: TestResult.Unanswered,
    note: "",
  };

  // 更新答案明细信息
  const updateAnswerField = <K extends keyof TestAnswerAddReq>(questionId: number, key: K, value: TestAnswerAddReq[K]) => {
    setAnswerMap((prevMap) => {
      const newMap = new Map(prevMap);
      const existing = newMap.get(questionId) || {
        attemptId: hId,
        questionId,
        answer: "",
        result: 0,
        note: "",
      };

      newMap.set(questionId, {
        ...existing,
        [key]: value,
      });

      return newMap;
    });
  };

  // 提交记录, 最后校验答案
  const handleSubmit = () => {};

  return (
    <div className="px-4 py-4 sm:px-16 sm:py-4">
      {useDelayedLoading(genPaperLoading || attemptLoading) && <Loading />}

      {warnInfo}

      <ResizablePanelGroup orientation="horizontal" className="min-h-50 border bg-white">
        <ResizablePanel defaultSize="40%">
          <div className="p-4">
            <Card className="border-slate-200/80">
              <CardHeader className="space-y-3">
                <div className="flex gap-3">
                  <Badge variant="default" className="tracking-wide">
                    {latestAttemptResp?.methodDesc}
                  </Badge>
                  <div>
                    {latestAttemptResp?.method === TestMethod.Exercise
                      ? "每做完一道题就可以核对答案, 不保存结果, 请记得保存"
                      : "需要最后交卷后才会保存并查看答案"}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 items-center w-full">
                  <TagShow
                    relatedName={genPaperResp.common.relatedName ?? ""}
                    tag={genPaperResp.common.tag}
                    year={genPaperResp.common.year}
                    grade={genPaperResp.common.grade ?? ""}
                    semester={genPaperResp.common.semester ?? ""}
                  />
                </div>
                <CardTitle className="text-base font-bold leading-snug text-slate-900">{genPaperResp.common.title}</CardTitle>
                <CardDescription>当前进度: 10 / {genPaperResp.common.count}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {genPaperResp.groups.map((group, gIdx) => {
                    return (
                      <div key={group.common.genId} className="space-y-2">
                        {/* 题型名称 */}
                        <div>{getGroupName(gIdx, group.common.typeName, group.common.subTitle)}</div>
                        {/* 生成题号 */}
                        <div className="flex gap-3">
                          {group.questions.map((question) => {
                            // 是否是当前题目
                            const isCurrent = question.common.questionId === currentQuestionId;
                            // 已经做完的题目怎么记录, 换一个非默认强调颜色

                            return (
                              <Button
                                key={question.info.baseInfo.id}
                                className="w-10"
                                variant={isCurrent ? "default" : "outline"}
                                onClick={() => {
                                  setSelectedOpt("");
                                  setShowAnswer(false);
                                  setCurrentQuestionId(question.common.questionId);
                                  setCurrentIndex(questionIdToIndexMap.get(question.common.questionId) || 0);
                                }}
                              >
                                {question.common.orderNum}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>

              {/* 考试模式交卷 */}
              <div className="p-4 space-y-3">
                <Button className="w-50" onClick={handleSubmit}>
                  {latestAttemptResp?.method === TestMethod.Exercise ? "保存" : "交卷"}
                </Button>
                <div className="text-blue-700 text-sm font-bold">在此之前你的操作记录都仅记录在浏览器，请记得保存或者交卷，否则你的记录会丢失</div>
              </div>
            </Card>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="60%">
          <div className="p-4">
            <Card className="flex-1 flex flex-col justify-between shadow-sm border-slate-200/80 overflow-y-auto">
              <CardContent className="space-y-3">
                {/* 题目头部状态 */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-sm bg-blue-50 text-blue-700 border-blue-100">
                    {getCurrentGroupInfo.typeName}
                  </Badge>
                  <span className="text-sm font-medium text-slate-400">
                    题目位置
                    <span className="text-slate-800 ml-3">
                      {currentIndex + 1 >= genPaperResp.common.count ? genPaperResp.common.count : currentIndex + 1}
                    </span>{" "}
                    / {genPaperResp.common.count}
                  </span>
                </div>

                <Separator />

                {/* 题干 */}
                <div>
                  <TitleShow
                    no={getCurrentQuestionInfo.common.orderNum}
                    title={getCurrentQuestionInfo.info.baseInfo.title}
                    comment={getCurrentQuestionInfo.info.baseInfo.comment || ""}
                    images={getCurrentQuestionInfo.info.baseInfo.images || []}
                  />
                </div>

                {/* 选项组 */}
                <div>
                  {getCurrentQuestionInfo.info.baseInfo.options && getCurrentQuestionInfo.info.baseInfo.options.length > 0 ? (
                    <MultiOptionSelect
                      options={getCurrentQuestionInfo.info.baseInfo.options || []}
                      selectedOpt={currentAnswerReq.answer}
                      setSelectedOpt={(val) => updateAnswerField(getCurrentQuestionInfo.common.questionId, "answer", val)}
                      showAnswer={showAnswer}
                      referAnswer={getCurrentQuestionInfo.info.extraInfo.answer || ""}
                    />
                  ) : (
                    <Textarea
                      value={currentAnswerReq.answer}
                      onChange={(e) => {
                        updateAnswerField(getCurrentQuestionInfo.common.questionId, "answer", e.target.value);
                      }}
                      placeholder="请填写你的答案..."
                      className="min-h-25 resize-y bg-slate-50/30 focus-visible:bg-white transition-colors duration-150 border-slate-200"
                    />
                  )}
                </div>

                <Separator />

                {/* 易错提示 */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowErrorTip(!showErrorTip)}
                    className="text-amber-600 border-amber-200 hover:bg-amber-50 bg-amber-50/20"
                  >
                    <AlertTriangle className="w-4 h-4 mr-1.5" />
                    {showErrorTip ? "隐藏易错提示" : "查看易错提示"}
                  </Button>

                  {showErrorTip && (
                    <Alert variant="destructive" className="bg-amber-50/40 border-amber-200 text-amber-900 animate-in fade-in duration-200">
                      <HelpCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="font-bold text-amber-800">易错点拨</AlertTitle>
                      <AlertDescription className="text-amber-700 text-sm mt-1">
                        {getCurrentQuestionInfo.info.extraInfo.remark || "暂无易错提示"}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* 推演步骤提示*/}
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-slate-400" />
                    结构化推演引导 (点击展开提示)
                  </div>
                  <Accordion className="w-full border border-slate-100 divide-y divide-slate-100">
                    {getCurrentQuestionInfo.info.baseInfo.steps?.map((step, sIdx) => (
                      <AccordionItem value={`step-${sIdx}`} key={sIdx} className="border-none px-4 hover:bg-slate-50/30">
                        <AccordionTrigger className="text-slate-500 hover:text-slate-800 font-medium text-sm py-3.5 hover:no-underline">
                          第{step.id}个提示
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-600 text-sm pb-4 pt-1 pl-2 border-l-2 border-indigo-500 bg-indigo-50/30 p-3">
                          <span className="font-bold text-indigo-700">引导建议: </span>
                          {step.content}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                {/* 附加功能1：答案记录与自我的解题分析和过程 */}
                <div className="space-y-2 pt-2">
                  <label className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                    <span>✍️ 个人解题过程与分析记录</span>
                    <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
                      便于日后复习
                    </Badge>
                  </label>
                  <Textarea
                    value={currentAnswerReq.note}
                    onChange={(e) => {
                      updateAnswerField(getCurrentQuestionInfo.common.questionId, "answer", e.target.value);
                    }}
                    placeholder="在此记录您的推导公式、解题思路或错因分析，系统将随答案一并保存归档..."
                    className="min-h-25 resize-y bg-slate-50/30 focus-visible:bg-white transition-colors duration-150 border-slate-200"
                  />
                </div>

                {/* 经典微渐变题目解析面板 */}
                {showAnswer && (
                  <Alert className="bg-slate-50 border-slate-200/80 p-6 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-6 text-sm font-semibold border-b border-slate-200/60 pb-3">
                      <div className="flex items-center">
                        <span className="text-slate-400 mr-2 font-normal">正确答案</span>
                        <div>
                          <SimpleFullContent content={getCurrentQuestionInfo.info.extraInfo.answer || ""} />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-blue-600 mr-2 font-bold">您的答案</span>
                        <div>
                          <SimpleFullContent content={currentAnswerReq.answer} />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm leading-relaxed text-slate-600">
                      <span className="font-bold text-slate-800 block mb-1.5 items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 解题分析
                      </span>
                      <div>
                        <SimpleFullContent content={getCurrentQuestionInfo.info.extraInfo.analysis?.content || ""} />
                      </div>
                    </div>
                    <div className="text-sm leading-relaxed text-slate-600">
                      <span className="font-bold text-slate-800 block mb-1.5 items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 解题过程
                      </span>
                      <div>
                        <SimpleFullContent content={getCurrentQuestionInfo.info.extraInfo.process?.content || ""} />
                      </div>
                    </div>
                  </Alert>
                )}
              </CardContent>

              {/* 控制栏 */}
              <div className="border-t border-slate-100 p-6 bg-white flex items-center justify-between">
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 bg-white hover:border-slate-400 hover:bg-slate-50 font-medium"
                  disabled={currentIndex <= 0}
                  onClick={handlePrev}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> 上一题
                </Button>

                {latestAttemptResp?.method === TestMethod.Exercise && (
                  <Button
                    onClick={() => {
                      setShowAnswer(true);
                    }}
                    className="px-6 bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm shadow-amber-100"
                  >
                    核对本题答案
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50 font-semibold shadow-sm"
                  disabled={currentIndex >= indexToQuestionIdMap.size - 1}
                  onClick={handleNext}
                >
                  下一题 <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
