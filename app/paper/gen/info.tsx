import { TagShow } from "~/common/paper/tag";
import { Separator } from "~/components/ui/separator";
import { useUser } from "~/hooks/use-user";
import type { CommonPaperResp, GenPaperQuestionResp, GenPaperResp, ReplaceQuestionReq } from "~/type/paper";
import type { UserInfoResp } from "~/type/user";
import { StringConst } from "~/util/string";
import { GenSortableQuestionList } from "~/paper/gen/question";
import type { QuestionBaseInfoResp, QuestionInfoResp, QuestionOption } from "~/type/question";
import React, { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ArrayUtil } from "~/util/object";
import { TitleShow } from "~/common/title";
import { MultiOptionShow } from "~/common/select";
import { QuestionInfo } from "~/common/question/info";
import type { TextbookOtherDict } from "~/type/textbook";
import { createPortal } from "react-dom";
import { ReplaceQuestion } from "~/paper/gen/replace";
import { httpClient } from "~/util/http";
import { SimpleAlert } from "~/common/alert";
import { toast } from "sonner";

// 手动组卷试卷详情

// 试卷头信息
interface GenInfoHeadProps {
  commonPaperResp: CommonPaperResp;
}

function GenInfoHead({ commonPaperResp }: GenInfoHeadProps) {
  // 获取用户信息
  const currentUser: UserInfoResp | null = useUser();

  return (
    <>
      {/* 来源和备注, 只展示存在的信息 */}
      <div className="flex flex-col gap-1 text-sm">
        {commonPaperResp.score && <div>分数: {commonPaperResp.score}</div>}
        {currentUser?.username && (
          <div>
            由 <span className="text-sm font-medium text-blue-600">{currentUser.username}</span> 上传
          </div>
        )}
        {commonPaperResp.source && <div>来源: {commonPaperResp.source}</div>}
        {commonPaperResp.remark && <div>备注: {commonPaperResp.remark}</div>}
      </div>

      <div>
        <Separator />
      </div>

      {/* 生成标签 */}
      <div className="flex gap-3 items-center w-full">
        <TagShow
          relatedName={commonPaperResp.relatedName ?? ""}
          tag={commonPaperResp.tag}
          year={commonPaperResp.year}
          grade={commonPaperResp.grade ?? ""}
          semester={commonPaperResp.semester ?? ""}
        />
      </div>

      {/* 标题 */}
      <div className="text-lg font-bold text-center">{commonPaperResp.title}</div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-6 bg-blue-50 rounded-lg p-4">
        <div className="text-center">
          <div className="text-sm text-gray-500">知识点覆盖</div>
          <div className="text-2xl font-bold text-blue-600">78%</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">难度系数</div>
          <div className="text-2xl font-bold text-blue-600">4.2</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">题目总数</div>
          <div className="text-2xl font-bold text-blue-600">17</div>
        </div>
      </div>
    </>
  );
}

// 预览详情
interface GenInfoPreviewProps {
  infoResp: GenPaperResp;
  questionTypeDict: Record<number, TextbookOtherDict>;
  questionTagDict: Record<number, TextbookOtherDict>;
  questionDimensionDict: Record<number, TextbookOtherDict>;
}

function GenInfoPreview({ infoResp, questionTypeDict, questionTagDict, questionDimensionDict }: GenInfoPreviewProps) {
  // 生成题型样式
  const getGroupName = (index: number, typeName: string, subTitle: string) => {
    const groupName = subTitle
      ? `${StringConst.groupNumberMap[index]}、${typeName} (${subTitle})`
      : `${StringConst.groupNumberMap[index]}、${typeName}`;
    return <div className="text-base">{groupName}</div>;
  };

  // 生成题目标题
  const getQuestionTitle = (orderNum: number, stem: string, images: string[]) => {
    return <TitleShow no={orderNum} title={stem} comment={""} images={images} />;
  };

  // 生成题目选项
  const getQuestionOptions = (optionsLayout: number, options: QuestionOption[]) => {
    return <MultiOptionShow optionsLayout={optionsLayout} options={options} />;
  };

  // 遮盖层弹框查看试卷详情
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const [viewQuestionInfo, setViewQuestionInfo] = useState<QuestionInfoResp | null>(null);

  // 查看题目详情
  const handleQuestionInfo = (info: QuestionInfoResp) => {
    setOpenDialog(true);
    setViewQuestionInfo(info);
  };

  return (
    <div className="flex flex-col gap-3 pl-4 pb-4 pr-4 bg-gray-100">
      <div>
        <Separator />
      </div>

      {/* 试卷头 */}
      <GenInfoHead commonPaperResp={infoResp.common} />

      {/* 试卷内容 */}
      {infoResp.groups?.map((group, idx) => {
        return (
          <div key={group.common.genId}>
            {/* 题型名称 */}
            <div className="mt-2.5 mb-2.5 font-bold">{getGroupName(idx, group.common.typeName, group.common.subTitle)}</div>

            {/* 小题列表, 需要支持排序和替换 */}
            {group.questions.map((question, idx) => {
              return (
                <div
                  key={question.common.genId}
                  className="flex text-base mt-4 p-3 bg-white transition-all duration-200 hover:shadow-lg hover:border-primary/10 border-border/60"
                >
                  {/* 题目主体 */}
                  <div className="flex-[0_0_95%]">
                    <div>{getQuestionTitle(question.common.orderNum, question.info.baseInfo.title, question.info.baseInfo.images || [])}</div>
                    <div className="mt-2.5">
                      {getQuestionOptions(question.info.baseInfo.optionsLayout || 1, question.info.baseInfo.options || [])}
                    </div>
                  </div>

                  <div className="flex flex-[0_0_5%]">
                    <Button variant="link" onClick={() => handleQuestionInfo(question.info)}>
                      详情
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* 查看详情 */}
      {openDialog &&
        viewQuestionInfo &&
        createPortal(
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center" onClick={() => setOpenDialog(false)}>
            <div className="bg-white h-[70vh] w-[70vw] flex flex-col rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
                <div className="text-base font-semibold text-gray-800">题目详情</div>
                <button className="text-gray-400 hover:text-gray-600 focus:outline-none" onClick={() => setOpenDialog(false)} aria-label="关闭">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pt-4">
                <QuestionInfo
                  pageSource={{ source: "genPaper" }}
                  questionTypeDict={questionTypeDict}
                  questionTagDict={questionTagDict}
                  questionDimensionDict={questionDimensionDict}
                  infoResp={viewQuestionInfo}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

// 试卷详情样式
interface GenInfoProps {
  infoResp: GenPaperResp;
  questionTypeDict: Record<number, TextbookOtherDict>;
  questionTagDict: Record<number, TextbookOtherDict>;
  questionDimensionDict: Record<number, TextbookOtherDict>;
}
function GenInfo({ infoResp, questionTypeDict, questionTagDict, questionDimensionDict }: GenInfoProps) {
  // 需要在这里维护这个变量状态, 考虑获取到数据后再打开抽屉因此接口请求放在上一步
  const [genPaperInfo, setGenPaperInfo] = useState<GenPaperResp>(infoResp);

  // 生成题型样式
  const getGroupName = (index: number, typeName: string, subTitle: string) => {
    const groupName = subTitle
      ? `${StringConst.groupNumberMap[index]}、${typeName} (${subTitle})`
      : `${StringConst.groupNumberMap[index]}、${typeName}`;
    return <div className="text-base">{groupName}</div>;
  };

  // 拖拽分组下一个题目到新位置
  const handleDragQuestion = (groupId: number, oldIndex: number, newIndex: number) => {
    setGenPaperInfo((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.common.id !== groupId) return g;
        return {
          ...g,
          // 移动数组并更新题目的序号
          questions: ArrayUtil.moveArrayItem<GenPaperQuestionResp>(g.questions, oldIndex, newIndex).map((q, index) => ({
            ...q,
            common: { ...q.common, orderNum: index + 1 },
          })),
        };
      }),
    }));
  };

  // 展示遮盖层显示详情和替换窗口
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogTitle, setDialogTitle] = useState<string>("");

  const [showViewQuestionInfo, setShowViewQuestionInfo] = useState<boolean>(false);
  const [showReplaceQuestion, setShowReplaceQuestion] = useState<boolean>(false);

  // 查看详情窗口
  const [viewQuestionInfo, setViewQuestionInfo] = useState<QuestionInfoResp | null>(null);
  const handleViewQuestionInfo = (info: QuestionInfoResp) => {
    setDialogTitle("题目详情");
    setShowReplaceQuestion(false);
    setOpenDialog(true);
    setShowViewQuestionInfo(true);
    setViewQuestionInfo(info);
  };

  // 替换题目窗口和待替换掉的原题目信息
  const defaultReplaceQuestionReq: ReplaceQuestionReq = {
    questionTypeId: 0,
    groupId: 0,
    index: 0,
    questionId: 0,
  };
  const [replaceQuestionReq, setReplaceQuestionReq] = useState<ReplaceQuestionReq>(defaultReplaceQuestionReq);

  const handleReplaceQuestion = (groupId: number, index: number, question: GenPaperQuestionResp) => {
    setDialogTitle("题目替换");
    setShowViewQuestionInfo(false);
    setOpenDialog(true);
    setShowReplaceQuestion(true);
    setReplaceQuestionReq({
      questionTypeId: question.info.baseInfo.questionTypeId,
      groupId,
      index,
      questionId: question.info.baseInfo.id,
    });
  };

  // 确定替换题目
  const handleConfirmReplacement = (info: QuestionInfoResp) => {
    // 待替换的原始对象为空
    const { groupId, index, questionId } = replaceQuestionReq;
    if (groupId <= 0 || index < 0 || questionId <= 0) {
      return;
    }

    setGenPaperInfo((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.common.id !== groupId) return g;

        // 找到这个题目
        const orgQuestion = g.questions[index];
        // 题目不匹配则无法替换, 其实应该抛出提示
        if (orgQuestion.info.baseInfo.id !== questionId) {
          toast.error(<div className="text-red-700">题目指定位置不匹配, 不能进行替换</div>, {
            duration: Infinity,
            action: {
              label: "关闭",
              onClick: () => {},
            },
          });
          return g;
        }
        // 可以替换, 更新题目公共信息
        const newQuestion: GenPaperQuestionResp = {
          // 公共信息中仅仅替换题目标识为新的题目标识即可
          common: { ...orgQuestion.common, questionId: info.baseInfo.id },
          // 题目信息用新的题目信息覆盖
          info,
        };

        const newQuestions = [...g.questions];
        newQuestions[index] = newQuestion;

        return { ...g, questions: newQuestions };
      }),
    }));

    // 替换成功后主动关闭替换题目弹窗, 并清空替换数据
    setOpenDialog(false);
    setShowReplaceQuestion(false);
    setReplaceQuestionReq(defaultReplaceQuestionReq);
  };

  // 更新分组下题目分数, 分数是否合规提交时校验
  const handleUpdateQuestionScore = (groupId: number, questionId: number, newScore: number) => {
    setGenPaperInfo((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.common.id !== groupId) return g;
        return {
          ...g,
          questions: g.questions.map((q) => (q.common.questionId === questionId ? { ...q, common: { ...q.common, ["score"]: newScore } } : q)),
        };
      }),
    }));
  };

  const [warnInfo, setWarnInfo] = useState<React.ReactNode>(null);

  // 更新试卷
  const handleEdit = () => {};

  return (
    <div className="flex flex-col gap-3 pl-4 pb-4 pr-4 bg-gray-100">
      <div className="text-sm mt-3">
        <div>1. 拖拽排序仅限同一题型内, 比如选择题, 填空题内, 跨题型不支持题型也不对应;</div>
        <div>2. 同一题型下可重新分配分值, 注意该题型总分数不能发生变化;</div>
        <div>3. 针对不合理的题目, 可以替换为其它题目;</div>
        <div>4. 替换后如果存在重复的题目, 仅在提交更新时检查;</div>
        <div>5. 替换后如果不满意需要撤销, 关闭窗口后重新刷新页面再展开详情即可;</div>
      </div>

      <div>
        <Button className="text-sm" onClick={handleEdit}>
          <Save className="mr-2 h-4 w-4" />
          更新
        </Button>
      </div>

      <div>
        <Separator />
      </div>

      <div>{warnInfo}</div>

      {/* 试卷头 */}
      <GenInfoHead commonPaperResp={infoResp.common} />

      {/* 试卷内容 */}
      {genPaperInfo.groups?.map((group, idx) => {
        return (
          <div key={`${genPaperInfo.common.id}-${group.common.id}`}>
            {/* 题型名称 */}
            <div className="mt-2.5 mb-2.5 font-bold">{getGroupName(idx, group.common.typeName, group.common.subTitle)}</div>

            {/* 小题列表, 需要支持排序和替换 */}
            <GenSortableQuestionList
              groupId={group.common.id}
              questions={group.questions}
              onDrag={handleDragQuestion}
              onReplace={handleReplaceQuestion}
              onUpdateScore={handleUpdateQuestionScore}
              onViewInfo={handleViewQuestionInfo}
            />
          </div>
        );
      })}

      {/* 题目替换窗口 */}
      {openDialog &&
        createPortal(
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center" onClick={() => setOpenDialog(false)}>
            <div className="bg-white h-[90vh] w-[90vw] flex flex-col rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
                <div className="text-base font-semibold text-gray-800">{dialogTitle}</div>
                <button className="text-gray-400 hover:text-gray-600 focus:outline-none" onClick={() => setOpenDialog(false)} aria-label="关闭">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* 题目替换 */}
                {showReplaceQuestion && (
                  <ReplaceQuestion
                    conf={infoResp.conf}
                    questionTypeId={replaceQuestionReq.questionTypeId}
                    questionTypeDict={questionTypeDict}
                    questionTagDict={questionTagDict}
                    questionDimensionDict={questionDimensionDict}
                    onConfirmReplace={handleConfirmReplacement}
                  />
                )}

                {/* 查看详情 */}
                {showViewQuestionInfo && viewQuestionInfo && (
                  <div className="mt-3">
                    <QuestionInfo
                      pageSource={{ source: "genPaper" }}
                      questionTypeDict={questionTypeDict}
                      questionTagDict={questionTagDict}
                      questionDimensionDict={questionDimensionDict}
                      infoResp={viewQuestionInfo}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

// 题目替换列表
interface GenInfoReplaceListProps {
  listResp: QuestionBaseInfoResp[];
  questionTypeDict: Record<number, TextbookOtherDict>;
  questionTagDict: Record<number, TextbookOtherDict>;
  questionDimensionDict: Record<number, TextbookOtherDict>;
  onConfirmReplace: (value: QuestionInfoResp) => void;
}

function GenInfoReplaceList({ listResp, questionTypeDict, questionTagDict, questionDimensionDict, onConfirmReplace }: GenInfoReplaceListProps) {
  // 生成题目标题
  const getQuestionTitle = (id: number, stem: string, images: string[]) => {
    return <TitleShow id={id} title={stem} comment={""} images={images} />;
  };

  // 生成题目选项
  const getQuestionOptions = (optionsLayout: number, options: QuestionOption[]) => {
    return <MultiOptionShow optionsLayout={optionsLayout} options={options} />;
  };

  // 遮盖层弹框查看试卷详情
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const [viewQuestionInfo, setViewQuestionInfo] = useState<QuestionInfoResp | null>(null);

  const [warnInfo, setWarnInfo] = useState<React.ReactNode>(null);

  // 查看题目详情
  const handleQuestionInfo = (id: number) => {
    httpClient
      .get<QuestionInfoResp>(`/question/info/${id}`)
      .then((res) => {
        setOpenDialog(true);
        setViewQuestionInfo(res);
      })
      .catch((err) => {
        setWarnInfo(<SimpleAlert title="查看题目详情查询出错" message={err.message} />);
      })
      .finally(() => {});
  };

  // 执行题目替换, 需要查询详情
  const handleReplaceQuestion = (id: number) => {
    if (!confirm("确认替换该题?")) {
      return;
    }

    httpClient
      .get<QuestionInfoResp>(`/question/info/${id}`)
      .then((res) => {
        onConfirmReplace(res);
      })
      .catch((err) => {
        setWarnInfo(<SimpleAlert title="替换题目时详情查询出错" message={err.message} />);
      })
      .finally(() => {});
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-100">
      <div>{warnInfo}</div>

      {/* 题目列表 */}
      {listResp.map((question, idx) => {
        return (
          <div
            key={question.id}
            className="flex text-base p-3 bg-white transition-all duration-200 hover:shadow-lg hover:border-primary/10 border-border/60"
          >
            {/* 题目主体 */}
            <div className="flex-[0_0_90%]">
              <div>{getQuestionTitle(question.id, question.title, question.images || [])}</div>
              <div className="mt-2.5">{getQuestionOptions(question.optionsLayout || 1, question.options || [])}</div>
            </div>

            <div className="flex flex-[0_0_10%] justify-center">
              <Button variant="link" onClick={() => handleQuestionInfo(question.id)}>
                详情
              </Button>
              <Button
                variant="link"
                onClick={() => {
                  handleReplaceQuestion(question.id);
                }}
              >
                替换
              </Button>
            </div>
          </div>
        );
      })}

      {/* 查看详情 */}
      {openDialog &&
        viewQuestionInfo &&
        createPortal(
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center" onClick={() => setOpenDialog(false)}>
            <div className="bg-white h-[70vh] w-[70vw] flex flex-col rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
                <div className="text-base font-semibold text-gray-800">题目详情</div>
                <button className="text-gray-400 hover:text-gray-600 focus:outline-none" onClick={() => setOpenDialog(false)} aria-label="关闭">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pt-4">
                <QuestionInfo
                  pageSource={{ source: "genPaper" }}
                  questionTypeDict={questionTypeDict}
                  questionTagDict={questionTagDict}
                  questionDimensionDict={questionDimensionDict}
                  infoResp={viewQuestionInfo}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export { GenInfoPreview, GenInfo, GenInfoReplaceList };
