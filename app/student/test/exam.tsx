import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, HelpCircle, Lightbulb } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { SimpleAlert } from '~/common/alert';
import { SimpleFullContent } from '~/common/content';
import { Loading } from '~/common/load';
import { getGroupName } from '~/common/paper/print';
import { TagShow } from '~/common/paper/tag';
import { MultiOptionSelect } from '~/common/select';
import { TitleShow } from '~/common/title';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '~/components/ui/resizable';
import { Separator } from '~/components/ui/separator';
import { Textarea } from '~/components/ui/textarea';
import { useDelayedLoading } from '~/hooks/delayed-loading';
import { TestMethod, TestResult, TestStatus } from '~/type/enum';
import type { CommonPaperGroupResp, GenPaperQuestionResp, GenPaperResp } from '~/type/paper';
import type { AnswerAddReq, AttemptInfoResp, InProgressLatestAttemptReq, TestAnswerAddReq } from '~/type/test';
import { httpClient } from '~/util/http';

// 默认常量定义
const defaultGenPaperResp: GenPaperResp = {
  common: {
    id: 0,
    relatedId: 0,
    relatedName: '',
    paperType: 0,
    tag: '',
    year: '',
    grade: '',
    semester: '',
    title: '',
    score: 0,
    source: '',
    remark: '',
    authorName: '',
    count: 0,
    status: 0,
    statusDesc: '',
    remarkExt: '',
    createdAt: '',
    updatedAt: '',
  },
  conf: { questionCateIds: [], questionTypes: [] },
  groups: [],
};
const defaultCommonPaperGroupResp: CommonPaperGroupResp = { id: 0, paperId: 0, genId: '', typeName: '', subTitle: '' };
const defaultGenPaperQuestionResp: GenPaperQuestionResp = {
  common: { id: 0, paperId: 0, groupId: 0, genId: '', orderNum: 0, questionId: 0, score: 0 },
  info: {
    baseInfo: {
      id: 0,
      questionCateId: 0,
      questionTypeId: 0,
      relationType: 0,
      originalName: '',
      status: 0,
      title: '',
      contentPlain: '',
      difficultyLevel: 0,
      approveName: '',
      createdAt: '',
      updatedAt: '',
    },
    extraInfo: {},
  },
};
const defaultAttemptInfoResp: AttemptInfoResp = {
  id: 0,
  studentId: 0,
  homeworkId: 0,
  classId: 0,
  paperId: 0,
  attemptNumber: 0,
  method: 0,
  methodDesc: '',
  status: 0,
  statusDesc: '',
  score: 0,
  createdAt: '',
  updatedAt: '',
  completedAt: '',
  answers: [],
};

// 共享的底层布局
interface ExamLayoutProps {
  isReadOnly?: boolean;
  genPaperResp: GenPaperResp;
  attemptResp: AttemptInfoResp;
  answerMap: Map<number, AnswerAddReq>;
  onAnswerChange?: (questionId: number, key: keyof AnswerAddReq, value: any) => void;
  showAnswer: boolean;
  setShowAnswer?: (show: boolean) => void;
  onCheckAnswer?: () => void;
  actionSlot?: React.ReactNode;
}

function ExamLayout({
  isReadOnly = false,
  genPaperResp,
  attemptResp,
  answerMap,
  onAnswerChange,
  showAnswer,
  setShowAnswer,
  onCheckAnswer,
  actionSlot,
}: ExamLayoutProps) {
  // 核心路由与索引反查 Map
  const [groupCommonMap, questionMap, indexToQuestionIdMap, questionIdToIndexMap] = useMemo(() => {
    const gMap = new Map<number, CommonPaperGroupResp>();
    const qMap = new Map<number, GenPaperQuestionResp>();
    const indexToQIdMap = new Map<number, number>();
    const qIdToIndexMap = new Map<number, number>();
    let index = 0;

    if (genPaperResp.common.id === 0) return [gMap, qMap, indexToQIdMap, qIdToIndexMap];

    genPaperResp.groups.forEach((group) => {
      if (group.common?.id) gMap.set(group.common.id, group.common);
      group.questions.forEach((question) => {
        const qId = question.common.questionId;
        if (qId) {
          qMap.set(qId, question);
          indexToQIdMap.set(index, qId);
          qIdToIndexMap.set(qId, index);
          index++;
        }
      });
    });
    return [gMap, qMap, indexToQIdMap, qIdToIndexMap];
  }, [genPaperResp]);

  const [currentQuestionId, setCurrentQuestionId] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showErrorTip, setShowErrorTip] = useState<boolean>(false);

  // 联动初始化默认展示第一题
  useEffect(() => {
    if (indexToQuestionIdMap.size > 0 && currentQuestionId === 0) {
      setCurrentQuestionId(indexToQuestionIdMap.get(0) || 0);
    }
  }, [indexToQuestionIdMap, currentQuestionId]);

  const currentQuestionInfo = questionMap.get(currentQuestionId) ?? defaultGenPaperQuestionResp;
  const currentGroupInfo = groupCommonMap.get(currentQuestionInfo.common.groupId) ?? defaultCommonPaperGroupResp;

  const currentAnswerReq = answerMap.get(currentQuestionId) || {
    attemptId: attemptResp.id,
    questionId: currentQuestionId,
    answer: '',
    result: TestResult.Unanswered,
    note: '',
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const nextIndex = currentIndex - 1;
      setCurrentIndex(nextIndex);
      setCurrentQuestionId(indexToQuestionIdMap.get(nextIndex) || 0);
      setShowAnswer?.(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < indexToQuestionIdMap.size - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentQuestionId(indexToQuestionIdMap.get(nextIndex) || 0);
      setShowAnswer?.(false);
    }
  };

  return (
    <ResizablePanelGroup orientation="horizontal" className="min-h-50 border bg-white">
      {/* 左侧控制台 */}
      <ResizablePanel defaultSize="40%">
        <div className="p-4">
          <Card className="border-slate-200/80">
            <CardHeader className="space-y-3">
              <div className="space-y-3">
                <div>
                  <Badge variant="default" className="tracking-wide">
                    {attemptResp.methodDesc}
                  </Badge>
                </div>
                <div>
                  <Badge variant="outline" className="tracking-wide text-blue-600">
                    该试卷当前累计是第 {attemptResp.attemptNumber} 次尝试
                  </Badge>
                </div>
                {!isReadOnly && (
                  <div className="text-blue-600 text-sm">
                    {attemptResp.method === TestMethod.Exercise
                      ? '每做完一道题就可以核对答案, 不保存结果, 请记得保存'
                      : '需要最后交卷后才会保存并查看答案'}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3 items-center w-full">
                <TagShow
                  relatedName={genPaperResp.common.relatedName ?? ''}
                  tag={genPaperResp.common.tag}
                  year={genPaperResp.common.year}
                  grade={genPaperResp.common.grade ?? ''}
                  semester={genPaperResp.common.semester ?? ''}
                />
              </div>
              <CardTitle className="text-base font-bold leading-snug text-slate-900">{genPaperResp.common.title}</CardTitle>
              <CardDescription>
                当前进度: {answerMap.size} / {genPaperResp.common.count}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {genPaperResp.groups.map((group, gIdx) => (
                  <div key={group.common.genId} className="space-y-2">
                    <div>{getGroupName(gIdx, group.common.typeName, group.common.subTitle)}</div>
                    <div className="flex gap-3 flex-wrap">
                      {group.questions.map((question) => {
                        const isCurrent = question.common.questionId === currentQuestionId;
                        return (
                          <Button
                            key={question.info.baseInfo.id}
                            className="w-10"
                            variant={isCurrent ? 'default' : 'outline'}
                            onClick={() => {
                              setShowAnswer?.(false);
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
                ))}
              </div>
            </CardContent>
            {actionSlot && <div className="flex p-4 space-y-3 gap-3">{actionSlot}</div>}
          </Card>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* 右侧做题/查看区 */}
      <ResizablePanel defaultSize="60%">
        <div className="p-4">
          <Card className="flex-1 flex flex-col justify-between shadow-sm border-slate-200/80 overflow-y-auto">
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-sm bg-blue-50 text-blue-700 border-blue-100">
                  {currentGroupInfo.typeName}
                </Badge>
                <span className="text-sm font-medium text-slate-400">
                  题目位置{' '}
                  <span className="text-slate-800 ml-3">
                    {currentIndex + 1 >= genPaperResp.common.count ? genPaperResp.common.count : currentIndex + 1}
                  </span>{' '}
                  / {genPaperResp.common.count}
                </span>
              </div>

              <Separator />

              {/* 题干 */}
              <TitleShow
                no={currentQuestionInfo.common.orderNum}
                title={currentQuestionInfo.info.baseInfo.title}
                comment={currentQuestionInfo.info.baseInfo.comment || ''}
                images={currentQuestionInfo.info.baseInfo.images || []}
              />

              {/* 选项组 / 填空文本域 */}
              <div>
                {currentQuestionInfo.info.baseInfo.options && currentQuestionInfo.info.baseInfo.options.length > 0 ? (
                  <MultiOptionSelect
                    options={currentQuestionInfo.info.baseInfo.options || []}
                    selectedOpt={currentAnswerReq.answer}
                    setSelectedOpt={(val) => !isReadOnly && onAnswerChange?.(currentQuestionId, 'answer', val)}
                    showAnswer={showAnswer}
                    referAnswer={currentQuestionInfo.info.extraInfo.answer || ''}
                  />
                ) : (
                  <Textarea
                    value={currentAnswerReq.answer}
                    disabled={isReadOnly}
                    onChange={(e) => onAnswerChange?.(currentQuestionId, 'answer', e.target.value)}
                    placeholder="请填写你的答案..."
                    className="min-h-25 resize-y bg-slate-50/30 focus-visible:bg-white border-slate-200"
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
                  {showErrorTip ? '隐藏易错提示' : '查看易错提示'}
                </Button>
                {showErrorTip && (
                  <Alert variant="destructive" className="bg-amber-50/40 border-amber-200 text-amber-900 animate-in fade-in duration-200">
                    <HelpCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="font-bold text-amber-800">易错点拨</AlertTitle>
                    <AlertDescription className="text-amber-700 text-sm mt-1">
                      {currentQuestionInfo.info.extraInfo.remark || '暂无易错提示'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* 结构化推演 */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-slate-400" />
                  结构化推演引导 (点击展开提示)
                </div>
                <Accordion className="w-full border border-slate-100 divide-y divide-slate-100">
                  {currentQuestionInfo.info.baseInfo.steps?.map((step, sIdx) => (
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

              {/* 笔记记录 */}
              <div className="space-y-2 pt-2">
                <label className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                  <span>✍️ 个人解题过程与分析记录</span>
                  <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
                    便于日后复习
                  </Badge>
                </label>
                <Textarea
                  value={currentAnswerReq.note}
                  disabled={isReadOnly}
                  onChange={(e) => onAnswerChange?.(currentQuestionId, 'note', e.target.value)}
                  placeholder="在此记录您的推导公式、解题思路或错因分析..."
                  className="min-h-25 resize-y bg-slate-50/30 focus-visible:bg-white border-slate-200"
                />
              </div>

              {/* 解析面板 */}
              {showAnswer && (
                <Alert className="bg-slate-50 border-slate-200/80 p-6 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-6 text-sm font-semibold border-b border-slate-200/60 pb-3">
                    <div className="flex items-center">
                      <span className="text-slate-400 mr-2 font-normal">正确答案</span>
                      <SimpleFullContent content={currentQuestionInfo.info.extraInfo.answer || ''} />
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-2 font-bold">您的答案</span>
                      <SimpleFullContent content={currentAnswerReq.answer} />
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed text-slate-600">
                    <span className="font-bold text-slate-800 block mb-1.5 items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 解题分析
                    </span>
                    <SimpleFullContent content={currentQuestionInfo.info.extraInfo.analysis?.content || ''} />
                  </div>
                  <div className="text-sm leading-relaxed text-slate-600">
                    <span className="font-bold text-slate-800 block mb-1.5 items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 解题过程
                    </span>
                    <SimpleFullContent content={currentQuestionInfo.info.extraInfo.process?.content || ''} />
                  </div>
                </Alert>
              )}
            </CardContent>

            {/* 底部导航栏 */}
            <div className="border-t border-slate-100 p-6 bg-white flex items-center justify-between">
              <Button variant="outline" disabled={currentIndex <= 0} onClick={handlePrev}>
                <ChevronLeft className="w-4 h-4 mr-1" /> 上一题
              </Button>

              {!isReadOnly && attemptResp.method === TestMethod.Exercise && onCheckAnswer && (
                <Button onClick={onCheckAnswer} className="px-6 bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm">
                  核对本题答案
                </Button>
              )}

              <Button
                variant="outline"
                className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold"
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
  );
}

// 编辑/做题模式
interface EditEaxmProps {
  hId: number;
  paperId: number;
  examMethod: number;
}

function EditEaxm({ hId, paperId, examMethod }: EditEaxmProps) {
  const navigate = useNavigate();

  const [warnInfo, setWarnInfo] = useState<React.ReactNode>('');

  const [genPaperResp, setGenPaperResp] = useState<GenPaperResp>(defaultGenPaperResp);
  const [genPaperLoading, setGenPaperLoading] = useState<boolean>(false);
  const [latestAttemptResp, setLatestAttemptResp] = useState<AttemptInfoResp>(defaultAttemptInfoResp);
  const [attemptLoading, setAttemptLoading] = useState<boolean>(false);

  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [answerMap, setAnswerMap] = useState<Map<number, AnswerAddReq>>(new Map());
  const [saveDrafting, setSaveDrafting] = useState<boolean>(false);
  const [saveSubmitting, setSaveSubmitting] = useState<boolean>(false);

  // 初始化获取试卷和做题记录
  useEffect(() => {
    setGenPaperLoading(true);
    httpClient
      .get<GenPaperResp>(`/paper/gen/info/${paperId}`)
      .then(setGenPaperResp)
      .catch((err) => setWarnInfo(<SimpleAlert title="获取试卷详情失败" message={err.message} />))
      .finally(() => setGenPaperLoading(false));

    setAttemptLoading(true);
    httpClient
      .post<AttemptInfoResp>('/test/attempt/latest', { id: hId, method: Number(examMethod) })
      .then((res) => {
        setLatestAttemptResp(res);
        const newMap = new Map<number, AnswerAddReq>();
        res.answers.forEach((ans) => {
          newMap.set(ans.questionId, { questionId: ans.questionId, answer: ans.answer, result: ans.result, note: ans.note });
        });
        setAnswerMap(newMap);
      })
      .catch((err) => setWarnInfo(<SimpleAlert title="获取进行中的做题记录失败" message={err.message} />))
      .finally(() => setAttemptLoading(false));
  }, [paperId, examMethod, hId]);

  // 更新某题作答数据
  const handleAnswerChange = (questionId: number, key: keyof AnswerAddReq, value: any) => {
    setAnswerMap((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(questionId) || { questionId, answer: '', result: 0, note: '' };
      newMap.set(questionId, { ...existing, [key]: value });
      return newMap;
    });
  };

  // 提交/存草稿
  const handleSubmit = (status: number) => {
    if (answerMap.size === 0) {
      toast.error(<div className="text-red-700">参数错误: 没有记录过任何答案</div>, {
        duration: Infinity,
        action: { label: '关闭', onClick: () => {} },
      });
      return;
    }
    status === TestStatus.InProgress ? setSaveDrafting(true) : setSaveSubmitting(true);

    const list = Array.from(answerMap.values());
    const addReq: TestAnswerAddReq = { attemptId: hId, status, list };

    httpClient
      .post('/test/answer/add', addReq)
      .then((res) => {
        // 成功后跳转到历史记录列表
        navigate('/student/attempt', {
          state: {
            hId: hId,
            paperId: paperId,
          },
        });
      })
      .catch((err) => setWarnInfo(<SimpleAlert title="保存做题记录失败" message={err.message} />))
      .finally(() => {
        status === TestStatus.InProgress ? setSaveDrafting(false) : setSaveSubmitting(false);
      });
  };

  return (
    <div className="px-4 py-4 sm:px-16 sm:py-4">
      {useDelayedLoading(genPaperLoading || attemptLoading) && <Loading />}

      {warnInfo}

      <ExamLayout
        genPaperResp={genPaperResp}
        attemptResp={latestAttemptResp}
        answerMap={answerMap}
        showAnswer={showAnswer}
        setShowAnswer={setShowAnswer}
        onAnswerChange={handleAnswerChange}
        onCheckAnswer={() => setShowAnswer(true)}
        actionSlot={
          <>
            <Button variant="outline" className="w-30" onClick={() => handleSubmit(TestStatus.InProgress)} disabled={saveDrafting}>
              {saveDrafting ? '存入草稿中...' : '存入草稿'}
            </Button>
            <Button className="w-30" onClick={() => handleSubmit(TestStatus.Done)} disabled={saveSubmitting}>
              {latestAttemptResp.method === TestMethod.Exercise ? (saveSubmitting ? '保存中...' : '保存') : saveSubmitting ? '交卷中...' : '交卷'}
            </Button>
          </>
        }
      />
    </div>
  );
}

// 预览/只读查看详情模式
interface PreviewEaxmProps {
  attemptResp: AttemptInfoResp;
  genPaperResp: GenPaperResp;
}

function PreviewEaxm({ genPaperResp, attemptResp }: PreviewEaxmProps) {
  const answerMap = useMemo(() => {
    const newMap = new Map<number, AnswerAddReq>();
    if (attemptResp?.answers) {
      attemptResp.answers.forEach((ans) => {
        newMap.set(ans.questionId, { questionId: ans.questionId, answer: ans.answer, result: ans.result, note: ans.note });
      });
    }
    return newMap;
  }, [attemptResp]);

  return (
    <div className="p-4">
      <ExamLayout isReadOnly={true} genPaperResp={genPaperResp} attemptResp={attemptResp} answerMap={answerMap} showAnswer={true} />
    </div>
  );
}

export { EditEaxm, PreviewEaxm };
