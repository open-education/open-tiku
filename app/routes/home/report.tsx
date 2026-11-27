import { GlobalError } from '@/components/common/error';
import { TitleShow } from '@/components/common/title';
import FileUpload from '@/components/common/upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReportType, UploadFileType } from '@/type/enum';
import type { FileInfo, PaperResp } from '@/type/paper';
import type { QuestionInfoResp } from '@/type/question';
import type { ReportAddReq } from '@/type/report';
import { httpClient } from '@/util/http';
import { ObjectUtil } from '@/util/object';
import { StringUtil } from '@/util/string';
import { cn } from 'cn';
import { AlertCircle, Link2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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

export type ReportLoaderResult =
  { success: true; data: { reportType: ReportType; id: number; title: string; label: string } } | { success: false; error: string };

export async function clientLoader({ request }: Route.ClientLoaderArgs): Promise<ReportLoaderResult> {
  const url = new URL(request.url);
  const id = ObjectUtil.strToNumber(url.searchParams.get('id'));
  const reportType = ObjectUtil.strToNumber(url.searchParams.get('type'));
  const handler = loaderMap[reportType];

  if (!handler || id <= 0) {
    return { success: false, error: '输入信息错误' };
  }

  try {
    const title = await handler.fetchTitle(id);
    if (!title) {
      return { success: false, error: `${handler.label}数据不存在` };
    }
    return {
      success: true,
      data: { reportType, id, title, label: handler.label },
    };
  } catch (err: any) {
    return { success: false, error: err?.message ?? '请求失败' };
  }
}

// 投诉类型
const reportReasons: Record<number, { value: string; label: string; desc: string }[]> = {
  [ReportType.Question]: [
    { value: 'question_answer_error', label: '答案或解析错误', desc: '参考答案有误、解析步骤错误或存在多解漏解' },
    { value: 'question_content_missing', label: '题干/图片/公式缺失', desc: '题目内容不完整、配图裂开或公式显示乱码' },
    { value: 'question_plagiarism', label: '抄袭/版权侵权', desc: '未经授权搬运第三方机构或个人原创题目' },
    { value: 'question_fact_error', label: '不符合事实/考点过时', desc: '存在科学性错误或属于已淘汰的旧考纲内容' },
    { value: 'question_tag_error', label: '科目/难度/标签错误', desc: '所属学科、年级、难度系数或知识点分类不准确' },
    { value: 'question_illegal_ads', label: '广告导流/违规内容', desc: '包含二维码、无关推广链接或违规敏感信息' },
    { value: 'question_other', label: '其他问题', desc: '上述分类未涵盖的其他纠错或投诉建议' },
  ],
  [ReportType.Paper]: [
    { value: 'paper_structure_error', label: '试卷漏题/顺序错乱', desc: '题目数量缺失、题号重复或排版顺序与原卷不符' },
    { value: 'paper_answer_error', label: '部分答案或分值错误', desc: '试卷整体分值计算有误或部分题目答案不准确' },
    { value: 'paper_plagiarism', label: '抄袭/盗用整卷', desc: '未经授权搬运完整试卷或侵犯版权' },
    { value: 'paper_fact_error', label: '年份/地区/考纲不符', desc: '试卷标注的年份、考试地区或真题/模拟属性有误' },
    { value: 'paper_illegal_ads', label: '广告水印/违规内容', desc: '包含无关引流水印、广告或违规信息' },
    { value: 'paper_other', label: '其他问题', desc: '上述分类未涵盖的其他试卷问题' },
  ],
};

export default function Report({ loaderData }: Route.ComponentProps) {
  const [addReq, setAddReq] = useState<ReportAddReq>(() => ({
    reportType: loaderData.success ? loaderData.data.reportType : ReportType.None,
    reportId: loaderData.success ? loaderData.data.id : 0,
    value: '',
    label: '',
    desc: '',
    content: '',
    sourceUrl: '',
    fileList: [],
  }));

  const updateAddReq = (key: keyof ReportAddReq, val: string | FileInfo[] | number) => {
    setAddReq((prev) => ({ ...prev, [key]: val }));
  };

  const [addIng, setAddIng] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!loaderData.success) {
    return <GlobalError message="400" details={loaderData.error} />;
  }

  const { reportType, id, title, label } = loaderData.data;
  const reasons = reportReasons[reportType];

  // 提交投诉
  const handleSubmit = () => {
    if (addReq.reportType <= 0) {
      toast.error(<div className="text-red-700">投诉来源不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (addReq.reportId <= 0) {
      toast.error(<div className="text-red-700">投诉对象不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringUtil.isNonEmpty(addReq.value)) {
      toast.error(<div className="text-red-700">投诉类型不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringUtil.isNonEmpty(addReq.desc)) {
      toast.error(<div className="text-red-700">具体内容不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }

    setAddIng(true);

    alert('暂未实现');
  };

  return (
    <Card className="py-3">
      <CardHeader>
        <CardTitle className="text-base font-semibold">我要投诉{label}</CardTitle>
        <CardDescription>{`${label}编号：#${id}`}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-3">
          <div className="border border-dotted border-blue-600 bg-green-50 p-3">
            <TitleShow title={title} comment="" images={[]} className="text-sm" />
          </div>

          <Label className="text-sm">
            投诉类型 <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {reasons.map((item) => {
              const selected = addReq.value === item.value;
              return (
                <div
                  key={item.value}
                  onClick={() => {
                    updateAddReq('value', item.value);
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
            投诉内容 <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="report-desc"
            rows={5}
            value={addReq.desc}
            onChange={(e) => {
              updateAddReq('desc', e.target.value);
            }}
            placeholder={
              addReq.value === 'question_plagiarism'
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
              value={addReq.sourceUrl}
              onChange={(e) => updateAddReq('sourceUrl', e.target.value)}
              placeholder="https://... （原始网站、教材参考或权威出处链接）"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm flex items-center justify-between">
              <span>
                佐证截图 <span className="text-xs font-normal text-muted-foreground">（选填，最多 5 张）</span>
              </span>
              <span className="text-xs text-muted-foreground">{addReq.fileList.length}/5</span>
            </Label>

            <div className="flex items-center gap-3 flex-wrap">
              <FileUpload
                fileType={UploadFileType.Image}
                defaultList={[]}
                onChange={(values) => {
                  if (!values) return;
                  updateAddReq(
                    'fileList',
                    values
                      .filter((item) => item.resp && item.resp.size > 0)
                      .map(({ resp }, idx) => ({
                        id: idx + 1,
                        name: resp.originalName,
                        url: resp.url,
                        size: resp.size,
                      })),
                  );
                }}
              />
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
        <Button onClick={handleSubmit} disabled={addIng}>
          {addIng && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          提交投诉
        </Button>
      </CardFooter>
    </Card>
  );
}
