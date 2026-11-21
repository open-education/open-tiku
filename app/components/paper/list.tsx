import { ListSelect } from '@/components/common/list';
import { SimpleTooltip } from '@/components/common/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { CityResp } from '@/type/city';
import { PaperDifficultyType, PaperLevelType, PaperPageSource, PaperStatus, UploadFileType } from '@/type/enum';
import type { CountPaperResp, PaperApproveReq, PaperDeleteReq, PaperListResp, PaperResp } from '@/type/paper';
import { httpClient } from '@/util/http';
import { ObjectUtil } from '@/util/object';
import { StringConst } from '@/util/string';
import {
  ArrowUpRight,
  BookOpenCheck,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Crown,
  ExternalLink,
  Eye,
  FileCode2,
  FileText,
  FileType2,
  Image as ImageIcon,
  Layers,
  MapPin,
  NotebookText,
  School,
  User,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import type { KeyedMutator } from 'swr';

// 试卷列表

// 文件类型视觉映射配置
const fileTypeConfig: Record<
  UploadFileType,
  {
    label: string;
    icon: LucideIcon;
    bgClass: string;
    textClass: string;
    borderClass: string;
    badgeBgClass: string;
  }
> = {
  [UploadFileType.None]: {
    label: '在线组卷',
    icon: Layers,
    bgClass: 'bg-indigo-50 dark:bg-indigo-950/50',
    textClass: 'text-indigo-600 dark:text-indigo-400',
    borderClass: 'border-indigo-200/60 dark:border-indigo-800/60',
    badgeBgClass: 'bg-indigo-600',
  },
  [UploadFileType.Pdf]: {
    label: 'PDF',
    icon: FileText,
    bgClass: 'bg-rose-50 dark:bg-rose-950/50',
    textClass: 'text-rose-600 dark:text-rose-400',
    borderClass: 'border-rose-200/60 dark:border-rose-800/60',
    badgeBgClass: 'bg-rose-600',
  },
  [UploadFileType.Word]: {
    label: 'Word',
    icon: FileType2,
    bgClass: 'bg-blue-50 dark:bg-blue-950/50',
    textClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-200/60 dark:border-blue-800/60',
    badgeBgClass: 'bg-blue-600',
  },
  [UploadFileType.Image]: {
    label: 'Image',
    icon: ImageIcon,
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-200/60 dark:border-emerald-800/60',
    badgeBgClass: 'bg-emerald-600',
  },
  [UploadFileType.Markdown]: {
    label: 'Markdown',
    icon: FileCode2,
    bgClass: 'bg-slate-100 dark:bg-slate-800',
    textClass: 'text-slate-700 dark:text-slate-300',
    borderClass: 'border-slate-200 dark:border-slate-700',
    badgeBgClass: 'bg-slate-700',
  },
};

// 难度等级
const difficultyConfig: Record<PaperDifficultyType, { label: string; badgeClass: string }> = {
  [PaperDifficultyType.Easy]: {
    label: '容易',
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  },
  [PaperDifficultyType.Medium]: {
    label: '适中',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  },
  [PaperDifficultyType.Hard]: {
    label: '困难',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
  },
};

// 主体信息展示
interface CommonPartProps {
  item: PaperResp;
  cityMap: Record<number, CityResp>;
}

function CommonPart({ item, cityMap }: CommonPartProps) {
  const typeInfo = fileTypeConfig[item.fileType];
  const diffInfo = difficultyConfig[item.difficultyType ? item.difficultyType : PaperDifficultyType.Easy];
  const TypeIcon = typeInfo.icon;
  const fileCount = item.fileList.length;

  return (
    <div className="p-3 flex items-center gap-4">
      {/* 左侧载体图标, 带多附件角标 */}
      <div className="relative shrink-0">
        <div className={`flex flex-col items-center justify-center w-17 h-17 border select-none ${typeInfo.bgClass} ${typeInfo.borderClass}`}>
          <TypeIcon className={`w-5 h-5 mb-1 ${typeInfo.textClass}`} />
          <span className={`text-xs font-semibold tracking-tight leading-none ${typeInfo.textClass}`}>{typeInfo.label}</span>
        </div>

        <span
          title={`包含 ${fileCount} 个文件`}
          className={`absolute -top-1 -right-1.5 min-w-4.5 h-4.5 px-1 rounded-full text-xs font-bold text-white flex items-center justify-center shadow-xs ring-2 ring-background ${typeInfo.badgeBgClass}`}
        >
          {fileCount}
        </span>
      </div>

      {/* 右侧标题与结构化属性 */}
      <div className="flex flex-col gap-2.5 min-w-0 flex-1">
        {/* 第一行：精品角标 + 完整标题（不再被右侧按钮挤压） */}
        <div className="flex items-start gap-2">
          {item.levelType === PaperLevelType.Premium && (
            <Badge className="mt-0.5 bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 px-1.5 py-0.5 text-[11px] font-medium gap-1 shrink-0 shadow-2xs">
              <Crown className="w-3 h-3 fill-current" />
              精品
            </Badge>
          )}
          <div
            className="text-sm font-semibold group-hover:text-primary transition-colors cursor-pointer leading-snug line-clamp-2"
            title={item.title}
          >
            {item.title}
          </div>
        </div>

        {/* 教育属性标签 难度 年份 省市 学校 */}
        <div className="flex items-center flex-wrap gap-x-3 text-xs">
          <Badge variant="outline" className={`px-1.5 py-0 text-xs font-normal ${diffInfo.badgeClass}`}>
            难度 · {diffInfo.label}
          </Badge>

          <span className="inline-flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            {item.year}年
          </span>

          <span>|</span>

          <span className="inline-flex items-center gap-1 font-medium">
            <BookOpenCheck className="w-3.5 h-3.5" />
            {StringConst.examTypeNames.get(item.examType) || ''}
          </span>

          {item.provinceId && item.provinceId > 0 && (
            <>
              <span>|</span>

              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {cityMap[item.provinceId]?.name} · {cityMap[item.cityId || 0]?.name}
              </span>
            </>
          )}

          {item.schoolName && (
            <>
              <span>|</span>
              <span className="inline-flex items-center gap-1 truncate max-w-65">
                <School className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{item.schoolName}</span>
              </span>
            </>
          )}

          {item.remark && (
            <>
              <span>|</span>
              <div className="inline-flex items-center gap-1">
                <NotebookText className="w-3.5 h-3.5 shrink-0" />
                <SimpleTooltip tip={item.remark} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 扩展信息部分
interface ExtPartProps {
  item: PaperResp;
}
function ExtPart({ item }: ExtPartProps) {
  return (
    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs">
      <span className="inline-flex items-center gap-1.5">
        <User className="w-3.5 h-3.5" />
        {item.authorName}
      </span>

      <SimpleTooltip
        tip={
          <span className="inline-flex items-center gap-1.5 cursor-help hover:text-foreground transition-colors">
            <Clock className="w-3.5 h-3.5" />
            创建于 {item.createdAt}
          </span>
        }
        content={
          <div className="space-y-2">
            <div>创建时间：{item.createdAt}</div>
            {item.approveAt && (
              <>
                <div>审核人: {item.approveName}</div>
                <div>审核通过：{item.approveAt}</div>
              </>
            )}
            <div>更新时间：{item.updatedAt}</div>
          </div>
        }
      />

      {/* 显示拒绝原因, 不用判读来源和状态, 只有我的题目能看到该状态 */}
      {item.status === PaperStatus.Rejected && item.rejectReason && (
        <SimpleTooltip tip={<div className="text-xs font-semibold text-red-700">拒绝原因: ${item.rejectReason}</div>} />
      )}

      {item.fileList && item.fileList.length > 0 && (
        <span className="text-xs px-1.5 py-0.2 bg-background border border-border/60">
          文件约 {ObjectUtil.formatFileSize(item.fileList.reduce((sum, item) => sum + (item.size ?? 0), 0))}
        </span>
      )}
    </div>
  );
}

// 操作部分
interface OperatePartProps {
  source: PaperPageSource;
  item: PaperResp;
  selectedIds: Record<number, boolean>;
  onPreview: (val: PaperResp) => void;
  paperListRespMutate?: KeyedMutator<PaperListResp>; // 审核删除等操作需要重置列表接口重新请求数据
  countListRespMutate?: KeyedMutator<CountPaperResp[]>; // 我的试卷提交审核等操作需要重置列表状态计数接口重新请求数据
}
function OperatePart({ source, item, selectedIds, onPreview, paperListRespMutate, countListRespMutate }: OperatePartProps) {
  const isExpanded = !!selectedIds[item.id];

  // 提交审核
  const [openSubmitApprove, setOpenSubmitApprove] = useState<boolean>(false);
  const [submitApproving, setSubmitApproving] = useState<boolean>(false);

  const handleSubmitApprove = () => {
    setSubmitApproving(true);

    const req: PaperApproveReq = {
      id: item.id,
      status: PaperStatus.Pending,
      rejectReason: '',
    };
    httpClient
      .post('/edit/paper/status', req)
      .then((_) => {
        paperListRespMutate?.().then((_) => {});
        countListRespMutate?.();
        setOpenSubmitApprove(false);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">提交审核操作出错: {err.message}</div>);
      })
      .finally(() => {
        setSubmitApproving(false);
      });
  };

  // 审核试卷
  const [openConfirmApprove, setOpenConfirmApprove] = useState<boolean>(false);
  const [confirmApproving, setConfirmApproving] = useState<boolean>(false);

  const [approveReq, setApproveReq] = useState<PaperApproveReq>({
    id: item.id,
    status: PaperStatus.Drafting,
    rejectReason: '',
  });
  const updateApproveReq = (key: keyof PaperApproveReq, value: number | string) => {
    setApproveReq((prev) => ({ ...prev, [key]: value }));
  };

  const handleApprove = () => {
    setConfirmApproving(true);

    httpClient
      .post('/edit/paper/status', approveReq)
      .then((_) => {
        paperListRespMutate?.().then((_) => {});
        countListRespMutate?.();
        setOpenConfirmApprove(false);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">审核操作出错: {err.message}</div>);
      })
      .finally(() => {
        setConfirmApproving(false);
      });
  };

  // 删除试卷
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleDelete = () => {
    setDeleting(true);

    const req: PaperDeleteReq = {
      id: item.id,
    };

    httpClient
      .post('/paper/delete', req)
      .then((_) => {
        paperListRespMutate?.().then((_) => {});
        countListRespMutate?.();
        setOpenDelete(false);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">删除题目出错: {err.message}</div>);
      })
      .finally(() => {
        setDeleting(false);
      });
  };

  return (
    <div className="flex items-center justify-end gap-2 shrink-0">
      {/* 详情和预览 */}
      {item.fileType === UploadFileType.None ? (
        <Button
          size="sm"
          onClick={() => {
            alert('在线试卷查看详情待设计');
          }}
          className="text-xs gap-1.5"
        >
          详情
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Button>
      ) : (
        <Button variant={isExpanded ? 'default' : 'outline'} size="sm" onClick={() => onPreview(item)} className="text-xs gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          <span>预览 ({item.fileList.length})</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </Button>
      )}

      {/* 编辑和提交审核 */}
      {source === PaperPageSource.MyPaper && item.status === PaperStatus.Drafting && (
        <>
          <Link to={`/ops/my/paper/edit?id=${item.id}`} target="_blank">
            <Button size="sm" variant="outline">
              编辑
            </Button>
          </Link>

          <Dialog open={openSubmitApprove} onOpenChange={setOpenSubmitApprove}>
            <DialogTrigger
              render={
                <Button size="sm" variant="outline">
                  提交审核
                </Button>
              }
            />
            <DialogContent className="w-200! max-w-[90vw]! flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold">提交审核</DialogTitle>
                <DialogDescription>请确认试卷没有包含违规, 涉黄, 侵权和法律法规不允许传播的信息等内容</DialogDescription>
              </DialogHeader>

              <Separator />

              <div className="space-y-3 px-4">
                <div className="font-semibold">检查步骤</div>
                <div className="text-xs space-y-2">
                  <p>1. 试卷不能是抄袭的, 避免投诉和版权纠纷</p>
                  <p>2. 试卷本身信息要完整</p>
                  <p>3. 图片等信息如果有不能缺失</p>
                  <p>4. 试卷和答案本身如果有要符合常识</p>
                </div>
              </div>

              <Separator />

              <DialogFooter>
                <DialogClose render={<Button variant="outline">关闭</Button>} />
                <Button onClick={handleSubmitApprove} disabled={submitApproving}>
                  {submitApproving ? '提交审核中' : '提交审核'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={openDelete} onOpenChange={setOpenDelete}>
            <DialogTrigger
              render={
                <Button size="sm" variant="destructive">
                  删除
                </Button>
              }
            />
            <DialogContent className="w-auto! max-w-[90vw]! min-w-75">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold">删除试卷</DialogTitle>
                <DialogDescription>试卷删除后不可恢复, 如果不确定, 可以保留等后续确认后再删除</DialogDescription>
              </DialogHeader>

              <Separator />

              <DialogFooter>
                <DialogClose render={<Button variant="outline">关闭</Button>} />
                <Button onClick={handleDelete} disabled={deleting} variant="destructive">
                  {deleting ? '删除中' : '删除'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
      {/* 撤回草稿 */}
      {source === PaperPageSource.MyPaper && item.status === PaperStatus.Published && (
        <Button size="sm" variant="destructive">
          退回草稿
        </Button>
      )}

      {/* 审核 */}
      {source === PaperPageSource.MyReview && item.status === PaperStatus.Pending && (
        <Dialog open={openConfirmApprove} onOpenChange={setOpenConfirmApprove}>
          <DialogTrigger
            render={
              <Button size="sm" variant="destructive">
                审核
              </Button>
            }
          />
          <DialogContent className="w-200! max-w-[90vw]! flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">试卷审核</DialogTitle>
              <DialogDescription>请确认试卷没有包含违规, 涉黄, 侵权和法律法规不允许传播的信息等内容</DialogDescription>
            </DialogHeader>

            <Separator />

            <div className="space-y-3 px-4">
              <div className="font-semibold">检查步骤</div>
              <div className="text-xs space-y-2">
                <p>1. 试卷不能是抄袭的, 避免投诉和版权纠纷</p>
                <p>2. 试卷本身信息要完整</p>
                <p>3. 图片等信息如果有不能缺失</p>
                <p>4. 题目和答案本身如果有要符合常识</p>
                <p className="text-red-500 font-bold">5. 若你审核通过的试卷后续被投诉等纠纷较多, 我们有权利降低你的账号等级</p>
              </div>
            </div>

            <Separator />

            <div className="flex-1 overflow-y-auto px-4 space-y-3">
              <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                <span className="text-xs font-semibold text-right">审核状态:</span>
                <ListSelect
                  options={StringConst.paperStatusList}
                  defaultValue={approveReq.status}
                  onSelect={(val) => updateApproveReq('status', val)}
                />

                <span className="text-xs font-semibold text-right">拒绝理由:</span>
                <Textarea
                  value={approveReq.rejectReason}
                  onChange={(e) => updateApproveReq('rejectReason', e.target.value)}
                  placeholder="拒绝时需要说明拒绝原因"
                />
              </div>
            </div>

            <Separator />

            <DialogFooter>
              <DialogClose render={<Button variant="outline">关闭</Button>} />
              <Button onClick={handleApprove} disabled={confirmApproving}>
                {confirmApproving ? '审核中' : '审核'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// 预览内容区部分
interface PreviewPartProps {
  item: PaperResp;
}
function PreviewPart({ item }: PreviewPartProps) {
  /**
   * 文件预览分流逻辑：
   * 1. 图片, 普通文档比如 Markdown PDF 等浏览器内置支持预览和下载
   * 2. Word 文档不支持, 由 a 标签去触发下载
   * 否则直接 window.open(..., '_blank') 交由浏览器原生查看及自行下载
   */
  const handlePreview = (fileType: UploadFileType, url: string, name: string) => {
    if (fileType === UploadFileType.Word) {
      return;
    }
    window.open(fileType === UploadFileType.Image ? `/images/${url}` : `/files/${url}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="px-4 sm:px-5 py-3 bg-muted/40 border-t border-border/60 animate-in fade-in slide-in-from-top-1 duration-150">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs">共包含 {item.fileList.length} 份文件, 普通文档将在新标签页打开; Word 文档浏览器自动下载</span>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {item.fileList.map((file, idx) => (
          <div
            key={file.id}
            className="flex items-center justify-between gap-3 px-3 py-2 border border-border/70 hover:border-primary/40 transition-colors"
          >
            {/* 文件序号与名称 */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="w-5 h-5 bg-muted text-xs font-semibold flex items-center justify-center shrink-0">{idx + 1}. </span>
              <span
                onClick={() => handlePreview(item.fileType, file.url, file.name)}
                className="text-xs font-medium hover:text-primary truncate cursor-pointer"
                title={file.name}
              >
                {file.name}
              </span>
              <span className="text-xs shrink-0">({ObjectUtil.formatFileSize(file.size)})</span>
            </div>

            {/* 单文件独立操作, Word 需要下载, 其它浏览器支持浏览 */}
            <div className="flex items-center gap-1.5 shrink-0">
              {item.fileType === UploadFileType.Word ? (
                <a target="_blank" download={file.name} href={`/files/${file.url}`}>
                  <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10">
                    <ExternalLink className="w-3.5 h-3.5" />
                    预览
                  </Button>
                </a>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePreview(item.fileType, file.url, file.name)}
                  className="h-7 px-2.5 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Eye className="w-3.5 h-3.5" />
                  预览
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface PaperListProps {
  source: PaperPageSource;
  items: PaperResp[];
  cityMap: Record<number, CityResp>;
  paperListRespMutate?: KeyedMutator<PaperListResp>; // 审核删除等操作需要重置列表接口重新请求数据
  countListRespMutate?: KeyedMutator<CountPaperResp[]>; // 我的试卷提交审核等操作需要重置列表状态计数接口重新请求数据
}

export function PaperList({ source, items, cityMap, paperListRespMutate, countListRespMutate }: PaperListProps) {
  // 记录当前展开/隐藏预览抽屉 的试卷 ID, 可同时展开多个
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /**
   * 点击脚部主“预览”按钮时的响应
   */
  const handlePreview = (item: PaperResp) => {
    // 在线组卷预览后续支持
    if (item.fileType === UploadFileType.None) {
      alert('在线预览后续支持');
      return;
    }

    // 展开/收起底部隐藏附件列表
    toggleExpand(item.id);
  };

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isExpanded = !!expandedIds[item.id];

        return (
          <div
            key={item.id}
            className={`group border bg-card shadow-xs transition-all duration-200 overflow-hidden ${
              isExpanded ? 'border-primary/40 shadow-md ring-1 ring-primary/10' : 'border-border/80 hover:shadow-md hover:border-primary/30'
            }`}
          >
            {/* 核心内容展示区 */}
            <CommonPart item={item} cityMap={cityMap} />

            {/* 统一脚部栏 元数据 + 操作按钮 */}
            <div className="px-4 sm:px-5 py-2.5 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* 脚部左侧：作者、双时间 Tooltip、热度统计 */}
              <ExtPart item={item} />

              {/* 统一操作按钮组 */}
              <OperatePart
                source={source}
                item={item}
                selectedIds={expandedIds}
                onPreview={(val) => handlePreview(val)}
                paperListRespMutate={paperListRespMutate}
                countListRespMutate={countListRespMutate}
              />
            </div>

            {/* 底部隐藏展开区 多文件预览明细 */}
            {isExpanded && <PreviewPart item={item} />}
          </div>
        );
      })}
    </div>
  );
}

export default PaperList;
