import { TagShow } from "~/common/paper/tag";
import { Separator } from "~/components/ui/separator";
import { useUser } from "~/hooks/use-user";
import type { CommonPaperResp, GenPaperQuestionResp, GenPaperResp } from "~/type/paper";
import type { UserInfoResp } from "~/type/user";
import { StringConst } from "~/util/string";
import { GenSortableQuestionList } from "~/paper/gen/question";
import type { QuestionBaseInfoResp, QuestionInfoResp, QuestionOption } from "~/type/question";
import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ArrayUtil } from "~/util/object";
import { TitleShow } from "~/common/title";
import { MultiOptionShow } from "~/common/select";
import { SimpleSheet } from "~/common/sheet";
import { QuestionInfo } from "~/common/question/info";
import type { TextbookOtherDict } from "~/type/textbook";
import { createPortal } from "react-dom";
import { ReplaceQuestion } from "~/paper/gen/replace";

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

  // Sheet相关操作变量
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [sheetTitle, setSheetTitle] = useState<string>("");
  const [sheetDesc, setSheetDesc] = useState<string>("");
  const [sheetContent, setSheetContent] = useState<React.ReactNode>("");

  // 查看题目详情
  const handleQuestionInfo = (info: QuestionInfoResp) => {
    setOpenSheet(true);
    setSheetTitle("查看题目详情");
    setSheetDesc("");
    setSheetContent(
      <QuestionInfo
        pageSource={{ source: "genPaper" }}
        questionTypeDict={questionTypeDict}
        questionTagDict={questionTagDict}
        questionDimensionDict={questionDimensionDict}
        infoResp={info}
      />,
    );
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

      {/* 试卷页面Sheet内容 */}
      <div>
        <SimpleSheet
          openSheet={openSheet}
          setOpenSheet={setOpenSheet}
          sheetTitle={sheetTitle}
          sheetDesc={sheetDesc}
          sheetContent={sheetContent}
          className="w-[40vw]! max-w-[40vw]! sm:w-[20vw]! md:w-[30vw]! lg:w-[40vw]! overflow-y-auto"
        />
      </div>
    </div>
  );
}

// 题目替换列表
interface GenInfoReplaceListProps {
  listResp: QuestionBaseInfoResp[];
}

function GenInfoReplaceList({ listResp }: GenInfoReplaceListProps) {
  // 生成题目标题
  const getQuestionTitle = (id: number, stem: string, images: string[]) => {
    return <TitleShow id={id} title={stem} comment={""} images={images} />;
  };

  // 生成题目选项
  const getQuestionOptions = (optionsLayout: number, options: QuestionOption[]) => {
    return <MultiOptionShow optionsLayout={optionsLayout} options={options} />;
  };

  // 查看详情需要重新创建全局遮盖层弹框

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-100">
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
              <Button variant="link" onClick={() => {}}>
                详情
              </Button>
              <Button variant="link" onClick={() => {}}>
                替换
              </Button>
            </div>
          </div>
        );
      })}
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

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [questionTypeId, setQuestionTypeId] = useState<number>(0);

  // 替换题目窗口
  const handleReplaceQuestion = (groupId: number, index: number, question: GenPaperQuestionResp) => {
    // 展开替换窗口
    setOpenDialog(true);
    setQuestionTypeId(question.info.baseInfo.questionTypeId);
  };

  // 确定替换题目
  const handleConfirmReplacement = (groupId: number, questionId: number, newQuestion: GenPaperQuestionResp) => {
    setGenPaperInfo((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => {
        if (g.common.id !== groupId) return g;
        return {
          ...g,
          questions: g.questions.map((q) => (q.common.questionId === questionId ? newQuestion : q)),
        };
      }),
    }));
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

  // Sheet相关操作变量
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [sheetTitle, setSheetTitle] = useState<string>("");
  const [sheetDesc, setSheetDesc] = useState<string>("");
  const [sheetContent, setSheetContent] = useState<React.ReactNode>("");

  return (
    <div className="flex flex-col gap-3 pl-4 pb-4 pr-4 bg-gray-100">
      <div className="text-sm">
        <div>1. 拖拽排序仅限同一题型内, 比如选择题, 填空题内, 跨题型不支持题型也不对应;</div>
        <div>2. 同一题型下可重新分配分值, 注意该题型总分数不能发生变化;</div>
        <div>3. 针对不合理的题目, 可以替换为其它题目;</div>
      </div>
      <div>
        <Button className="text-sm" onClick={() => {}}>
          <Save className="mr-2 h-4 w-4" />
          更新
        </Button>
      </div>
      <div>
        <Separator />
      </div>
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
              questionTypeDict={questionTypeDict}
              questionTagDict={questionTagDict}
              questionDimensionDict={questionDimensionDict}
              setOpenSheet={setOpenSheet}
              setSheetTitle={setSheetTitle}
              setSheetDesc={setSheetDesc}
              setSheetContent={setSheetContent}
            />
          </div>
        );
      })}
      {/* 试卷页面Sheet内容 */}
      <div>
        <SimpleSheet
          openSheet={openSheet}
          setOpenSheet={setOpenSheet}
          sheetTitle={sheetTitle}
          sheetDesc={sheetDesc}
          sheetContent={sheetContent}
          className="w-[40vw]! max-w-[40vw]! sm:w-[20vw]! md:w-[30vw]! lg:w-[40vw]! overflow-y-auto"
        />
      </div>
      {/* 题目替换窗口 */}
      {openDialog &&
        createPortal(
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center" onClick={() => setOpenDialog(false)}>
            <div className="bg-white h-[90vh] overflow-y-auto w-[90vw]" onClick={(e) => e.stopPropagation()}>
              <ReplaceQuestion conf={infoResp.conf} questionTypeId={questionTypeId} />
            </div>
          </div>,
          document.body,
        )}
      ;
    </div>
  );
}

export { GenInfoPreview, GenInfoReplaceList, GenInfo };
