import { GlobalError } from '@/components/common/error';
import { TitleShow } from '@/components/common/title';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReportType } from '@/type/enum';
import type { PaperResp } from '@/type/paper';
import type { QuestionInfoResp } from '@/type/question';
import { httpClient } from '@/util/http';
import { ObjectUtil } from '@/util/object';
import { cn } from 'cn';
import { AlertCircle, ImagePlus, Link2, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import type { Route } from './+types/report';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '我要投诉' },
    {
      name: 'description',
      content: '提交我的投诉信息',
    },
  ];
}

// 查询详情
const loaderMap: Record<number, { label: string; fetchTitle: (id: number) => Promise<string | undefined> }> = {
  [ReportType.Paper]: {
    label: '试卷',
    fetchTitle: async (id) => {
      const res = await httpClient.get<PaperResp>(`/paper/info/${id}`);
      return res?.id > 0 ? res.title : undefined;
    },
  },
  [ReportType.Question]: {
    label: '题目',
    fetchTitle: async (id) => {
      const res = await httpClient.get<QuestionInfoResp>(`/question/info/${id}`);
      return res?.baseInfo?.id > 0 ? res.baseInfo.title : undefined;
    },
  },
};

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const id = ObjectUtil.strToNumber(url.searchParams.get('id'));
  const reportType = ObjectUtil.strToNumber(url.searchParams.get('type'));
  const handler = loaderMap[reportType];

  if (!handler) {
    return { success: false, error: '输入信息错误', reportType: ReportType.None, id, title: '', label: '' };
  }

  try {
    const title = await handler.fetchTitle(id);
    if (!title) {
      return { success: false, error: `${handler.label}数据不存在`, reportType: ReportType.None, id, title: '', label: '' };
    }
    return {
      success: true,
      error: '',
      reportType,
      id,
      title,
      label: handler.label,
    };
  } catch (err: any) {
    return { success: false, error: err?.message ?? '请求失败', reportType: ReportType.None, id, title: '', label: '' };
  }
}

// 投诉类型
const reportReasons: Record<number, { value: string; label: string; desc: string }[]> = {
  [ReportType.Question]: [
    { value: 'answer_error', label: '答案或解析错误', desc: '参考答案有误、解析步骤错误或存在多解漏解' },
    { value: 'content_missing', label: '题干/图片/公式缺失', desc: '题目内容不完整、配图裂开或公式显示乱码' },
    { value: 'plagiarism', label: '抄袭/版权侵权', desc: '未经授权搬运第三方机构或个人原创题目' },
    { value: 'fact_error', label: '不符合事实/考点过时', desc: '存在科学性错误或属于已淘汰的旧考纲内容' },
    { value: 'tag_error', label: '科目/难度/标签错误', desc: '所属学科、年级、难度系数或知识点分类不准确' },
    { value: 'illegal_ads', label: '广告导流/违规内容', desc: '包含二维码、无关推广链接或违规敏感信息' },
    { value: 'other', label: '其他问题', desc: '上述分类未涵盖的其他纠错或投诉建议' },
  ],
  [ReportType.Paper]: [
    { value: 'structure_error', label: '试卷漏题/顺序错乱', desc: '题目数量缺失、题号重复或排版顺序与原卷不符' },
    { value: 'answer_error', label: '部分答案或分值错误', desc: '试卷整体分值计算有误或部分题目答案不准确' },
    { value: 'plagiarism', label: '抄袭/盗用整卷', desc: '未经授权搬运完整试卷或侵犯版权' },
    { value: 'fact_error', label: '年份/地区/考纲不符', desc: '试卷标注的年份、考试地区或真题/模拟属性有误' },
    { value: 'illegal_ads', label: '广告水印/违规内容', desc: '包含无关引流水印、广告或违规信息' },
    { value: 'other', label: '其他问题', desc: '上述分类未涵盖的其他试卷问题' },
  ],
};

export default function Report({ loaderData }: Route.ComponentProps) {
  const { success, error, reportType, id, title, label } = loaderData;

  const [errorMsg, setErrorMsg] = useState('');
  const [reasonType, setReasonType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const reasons = reportReasons[reportType];

  // 失败页面
  if (!success) {
    return <GlobalError message="400" details={error} />;
  }

  return (
    <Card className="p-3">
      <CardHeader className="">
        <CardTitle className="text-base font-semibold">我要投诉{label}</CardTitle>
        <CardDescription>{`${label}编号：#${id}`}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-3">
          <div className="p-3 border border-dotted border-blue-600 bg-green-50">
            <TitleShow title={title} comment="" images={[]} className="text-sm" />
          </div>

          <Label className="text-sm">
            投诉类型 <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {reasons.map((item) => {
              const selected = reasonType === item.value;
              return (
                <div
                  key={item.value}
                  onClick={() => {
                    setReasonType(item.value);
                    setErrorMsg('');
                  }}
                  className={cn(
                    'p-3 text-left rounded-lg border transition-all space-y-1',
                    selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-background hover:bg-accent/50',
                  )}
                >
                  <div className={cn('text-sm', selected ? 'text-primary' : 'text-foreground')}>{item.label}</div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-desc" className="text-sm">
            具体内容 <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="report-desc"
            rows={5}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder={
              reasonType === 'plagiarism'
                ? '请详细说明抄袭的出处、原题特征或侵权情况...'
                : `请详细描述该${label}存在的问题（如哪一题/哪一步出错、正确结论是什么）...`
            }
          />
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="report-url" className="text-sm flex items-center gap-1.5">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              原始内容链接 <span className="text-xs font-normal text-muted-foreground">（选填）</span>
            </Label>
            <Input
              id="report-url"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://... （原始网站、教材参考或权威出处链接）"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm flex items-center justify-between">
              <span>
                佐证截图 <span className="text-xs font-normal text-muted-foreground">（选填，最多 5 张）</span>
              </span>
              <span className="text-xs text-muted-foreground">{images.length}/5</span>
            </Label>

            <div className="flex items-center gap-3 flex-wrap">
              {previews.map((src, idx) => (
                <div key={src} className="relative h-24 w-24 rounded-lg border border-border overflow-hidden group">
                  <img src={src} alt="佐证截图" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {}}
                    className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label className="h-24 w-24 rounded-lg border border-dashed border-border hover:border-primary hover:bg-accent/50 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-muted-foreground hover:text-primary transition-colors">
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-xs">上传截图</span>
                  <input type="file" accept="image/*" multiple onChange={() => {}} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-1.5 text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-md">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-border pt-4 flex justify-end gap-3">
        <Button type="button">
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          提交投诉
        </Button>
      </CardFooter>
    </Card>
  );
}
