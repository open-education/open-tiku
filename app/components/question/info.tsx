import { SimpleAlert } from '@/components/common/alert';
import { SimpleFullContent } from '@/components/common/content';
import type { QuestionInfoResp } from '@/type/question';

// 答案解析
interface AnswerInfoProps {
  infoResp: QuestionInfoResp | null;
}
function AnswerInfo({ infoResp }: AnswerInfoProps) {
  if (infoResp === null) {
    return <SimpleAlert title="查询答案解析为空" message="题目未维护答案信息" variant="default" />;
  }

  // 有详情返回时优先详情返回, 否则理解为预览数据
  const { baseInfo, extraInfo } = infoResp;

  // 来源和备注, 只展示存在的信息
  const otherInfo = (
    <div className="text-xs flex flex-col gap-1 pt-1">
      <div>创建时间: {baseInfo.createdAt}</div>
      <div>作者昵称: {baseInfo.authorName || ''}</div>
      {baseInfo.originalName && <div>创作者昵称: {baseInfo.originalName}</div>}
      {baseInfo.source && <div>来源: {baseInfo.source}</div>}
      {baseInfo.approveName && <div>审核人: {baseInfo.approveName}</div>}
      {baseInfo.approveAt && <div>审核时间: {baseInfo.approveAt}</div>}
      <div>更新时间: {baseInfo.updatedAt}</div>
    </div>
  );

  // 特殊值
  const otherInfoId = 4;
  const sections = [
    { id: 1, title: '参考答案', content: extraInfo.answer || '未维护', color: 'text-emerald-600', dot: 'bg-emerald-500' },
    { id: 2, title: '解题分析', content: extraInfo.analysis?.content || '未维护', color: 'text-sky-600', dot: 'bg-sky-500' },
    { id: 3, title: '解题过程', content: extraInfo.process?.content || '未维护', color: 'text-violet-600', dot: 'bg-violet-500' },
    { id: otherInfoId, title: '其它信息', content: '', color: 'text-amber-600', dot: 'bg-amber-500' }, // id下面用了相等值修改时注意
  ];

  return (
    <div className="space-y-3 text-sm">
      {sections.map(({ id, title, content, color, dot }) => (
        <div key={id} className="space-y-1">
          <div className={`flex items-center gap-1.5 font-bold ${color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {title}
          </div>
          <div className="pl-3 text-slate-700">{id === otherInfoId ? otherInfo : <SimpleFullContent content={content} />}</div>
        </div>
      ))}
    </div>
  );
}

export { AnswerInfo };
