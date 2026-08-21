import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Lightbulb, CheckCircle2, Layers, AlertCircle } from "lucide-react";
import type { QuestionInfoResp, QuestionPageSourceProps } from "~/type/question";
import { SimpleFullContent } from "~/common/content";
import { TagShow } from "~/common/question/tag";
import { TitleShow } from "~/common/title";
import { MultiOptionShow } from "~/common/select";
import type { TextbookOtherDict } from "~/type/textbook";
import { DictUtil } from "~/util/object";
import { SimpleAlert } from "~/common/alert";
import { QuestionStatus } from "~/type/enum";

// 题目详情样式-预览和详情均使用该样式
interface QuestionInfoProps {
  pageSource: QuestionPageSourceProps;
  questionTypeDict: Record<number, TextbookOtherDict>;
  questionTagDict: Record<number, TextbookOtherDict>;
  questionDimensionDict: Record<number, TextbookOtherDict>;
  infoResp: QuestionInfoResp;
}
function QuestionInfo({ pageSource, questionTypeDict, questionTagDict, questionDimensionDict, infoResp }: QuestionInfoProps) {
  // 有详情返回时优先详情返回, 否则理解为预览数据
  const { baseInfo, extraInfo } = infoResp;

  return (
    <div className="space-y-4 pl-4 pb-4 pr-4">
      {/* 我的题目审核如果被拒绝要显示拒绝原因, 修改后重新提交审核 */}
      {baseInfo.status === QuestionStatus.Rejected && (
        <SimpleAlert title="你的题目审核被拒绝, 请按拒绝原因修改后重新提交审核" message={baseInfo.rejectReason || ""} />
      )}

      {/* 来源和备注, 只展示存在的信息 */}
      <div className="text-xs flex flex-col gap-1 border p-4">
        <div>创建时间: {baseInfo.createdAt}</div>
        <div>作者昵称: {baseInfo.authorName || ""}</div>
        {baseInfo.originalName && <div>创作者昵称: {baseInfo.originalName}</div>}
        {baseInfo.source && <div>来源: {baseInfo.source}</div>}
        {baseInfo.approveName && <div>审核人: {baseInfo.approveName}</div>}
        {baseInfo.approveAt && <div>审核时间: {baseInfo.approveAt}</div>}
        <div>更新时间: {baseInfo.updatedAt}</div>
      </div>

      {/* 题目 */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <CardContent className="space-y-6">
          {/* 标签 */}
          <div className="flex gap-3 items-center w-full">
            <TagShow
              pageSource={pageSource}
              typeValue={DictUtil.getQuestionTypeName(baseInfo.questionTypeId, questionTypeDict)}
              tagNames={DictUtil.getQuestionTagNames(baseInfo.questionTagIds || [], questionTagDict)}
              dimensionNames={DictUtil.getQuestionDimensionNames(baseInfo.questionDimensionIds || [], questionDimensionDict)}
              difficultyLevelValue={baseInfo.difficultyLevel}
              status={baseInfo.status}
            />
          </div>

          {/* 题干 - 突出显示 */}
          <div className="text-sm">
            <TitleShow id={baseInfo.id} title={baseInfo.title} comment={baseInfo.comment ?? ""} images={baseInfo.images ?? []} />
          </div>

          {/* 选项 */}
          <div className="text-sm">
            <MultiOptionShow optionsLayout={baseInfo.optionsLayout ?? 2} options={baseInfo.options ?? []} />
          </div>

          {/* 2. 知识点 - 胶囊式标签 */}
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Layers className="w-4 h-4" />
              <span className="text-base">涉及知识点</span>
            </div>
            <div className="flex flex-wrap gap-2 pl-1">
              <Badge
                variant="outline"
                className="text-sm px-4 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 border-0 shadow-sm"
              >
                {extraInfo.knowledge ?? ""}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 题目其它信息 */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <CardContent className="space-y-6">
          {/* 参考答案 - 带图标高亮 */}
          <div className="text-base flex items-start gap-4 p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">参考答案</h4>
              <div className=" text-emerald-700 dark:text-emerald-300">
                <SimpleFullContent content={extraInfo.answer ?? ""} />
              </div>
            </div>
          </div>

          <Separator className="bg-gray-100 dark:bg-gray-800" />

          {/* 解题分析 - 左侧强调边框 */}
          <div className="text-base border-l-4 border-l-sky-400 pl-4 py-1 bg-sky-50/30 dark:bg-sky-950/20 rounded-r-lg">
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 mb-1">
              <Lightbulb className="w-4 h-4" />
              <span>解题分析</span>
            </div>
            <div className="leading-relaxed text-gray-700 dark:text-gray-300">
              <SimpleFullContent content={extraInfo.analysis?.content ?? ""} />
            </div>
          </div>

          {/* 解题过程 */}
          <div className="text-base border-l-4 border-l-sky-400 pl-4 py-1 bg-sky-50/30 dark:bg-sky-950/20 rounded-r-lg">
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 mb-1">
              <Lightbulb className="w-4 h-4" />
              <span>解题过程</span>
            </div>
            <div className="leading-relaxed text-gray-700 dark:text-gray-300">
              <SimpleFullContent content={extraInfo.process?.content ?? ""} />
            </div>
          </div>

          {/* 解题过程 - 时间线步骤 */}
          <div className="text-base">
            <h4 className=" text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-gray-300 dark:bg-gray-600"></span>
              推演步骤
              <span className="w-6 h-0.5 bg-gray-300 dark:bg-gray-600"></span>
            </h4>
            <div className="space-y-0 relative">
              {/* 竖向连接线 */}
              <div className="absolute left-4.75 top-3 bottom-3 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

              {baseInfo.steps?.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pb-4 last:pb-0 group">
                  {/* 序号圆点 */}
                  <div className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-gray-900 border-2 border-indigo-200 dark:border-indigo-800 group-hover:border-indigo-500 transition-colors shadow-sm shrink-0">
                    <span className=" text-indigo-600 dark:text-indigo-400">{step.id}</span>
                  </div>
                  {/* 步骤内容 */}
                  <div className="pt-1.5 pb-1 px-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-lg border border-gray-100 dark:border-gray-800 flex-1 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className=" text-gray-700 dark:text-gray-300 leading-relaxed">
                      <SimpleFullContent content={step.content} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-gray-100 dark:bg-gray-800" />

          {/* 备注 - 警告/提示风格 */}
          <div className="text-base flex items-start gap-3 p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-lg border border-amber-200/50 dark:border-amber-800/40">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-0.5">易错备注</h4>
              <div className="text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                <SimpleFullContent content={extraInfo.remark ?? ""} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { QuestionInfo };
