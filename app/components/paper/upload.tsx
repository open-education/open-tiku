import { Eye, FileText, Upload, X } from 'lucide-react';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { UploadFileType } from '@/type/enum';
import { cn } from 'cn';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface FileUploadProps {
  /** 允许上传的文件类型 */
  fileType: UploadFileType;
  /** 单文件大小上限（MB），默认 20 */
  maxSizeMB?: number;
  /** 禁用 */
  disabled?: boolean;
  /** 文件列表变化回调（可选） */
  onChange?: (files: File[]) => void;
  className?: string;
}

/** 内部维护的上传项 */
interface UploadedItem {
  id: string;
  file: File;
  /** 本地预览地址（objectURL） */
  url: string;
  isImage: boolean;
}

const TYPE_CONFIG: Record<UploadFileType, { accept: string; title: string; hint: string }> = {
  [UploadFileType.Pdf]: {
    accept: '.pdf,application/pdf',
    title: '点击或拖拽 PDF 文件上传',
    hint: '支持 PDF 格式',
  },
  [UploadFileType.Word]: {
    accept: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    title: '点击或拖拽 Word 文件上传',
    hint: '支持 DOC / DOCX 格式',
  },
  [UploadFileType.Image]: {
    accept: 'image/*',
    title: '点击或拖拽图片上传',
    hint: '支持 JPG / PNG / WEBP 等图片格式',
  },
};

function isFileMatched(file: File, fileType: UploadFileType): boolean {
  const name = file.name.toLowerCase();
  const mime = (file.type || '').toLowerCase();

  switch (fileType) {
    case UploadFileType.Pdf:
      return mime === 'application/pdf' || name.endsWith('.pdf');
    case UploadFileType.Word:
      return (
        mime === 'application/msword' ||
        mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        name.endsWith('.doc') ||
        name.endsWith('.docx')
      );
    case UploadFileType.Image:
      return mime.startsWith('image/') || /\.(jpe?g|png|gif|webp|bmp|svg|heic)$/i.test(name);
    default:
      return false;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function FileUpload({ fileType, maxSizeMB = 2, disabled = false, onChange, className }: FileUploadProps) {
  const config = TYPE_CONFIG[fileType];

  const [items, setItems] = useState<UploadedItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // 卸载时统一释放 objectURL
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const images = useMemo(() => items.filter((i) => i.isImage), [items]);
  const documents = useMemo(() => items.filter((i) => !i.isImage), [items]);

  const addFiles = useCallback(
    (fileList: FileList | File[] | null) => {
      if (!fileList) return;
      const incoming = Array.from(fileList);
      if (incoming.length === 0) return;

      const accepted: UploadedItem[] = [];
      const rejected: string[] = [];

      incoming.forEach((file) => {
        if (!isFileMatched(file, fileType)) {
          rejected.push(`${file.name}（格式不支持）`);
          return;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          rejected.push(`${file.name}（超过 ${maxSizeMB}MB）`);
          return;
        }
        accepted.push({
          id: createId(),
          file,
          url: URL.createObjectURL(file),
          isImage: file.type.startsWith('image/'),
        });
      });

      if (accepted.length > 0) {
        // 追加在已有文件后面
        setItems((prev) => [...prev, ...accepted]);

        /* -------------------------------------------------
         * TODO: 替换为真实上传接口
         * const formData = new FormData();
         * accepted.forEach(({ file }) => formData.append('files', file));
         * await api.upload(formData);
         * ------------------------------------------------- */
        console.log('[FileUpload] 模拟上传', {
          fileType,
          files: accepted.map(({ file }) => ({
            name: file.name,
            size: file.size,
            type: file.type,
          })),
        });

        onChange?.(accepted.map((i) => i.file));
      }

      setError(rejected.length > 0 ? `以下文件未通过校验：${rejected.join('、')}` : null);
    },
    [fileType, maxSizeMB, onChange],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    // 重置，保证同一个文件可以重复选择
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // 避免移入子元素时闪烁
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    addFiles(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (target) URL.revokeObjectURL(target.url);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClear = () => {
    items.forEach((i) => URL.revokeObjectURL(i.url));
    setItems([]);
    setError(null);
  };

  const handlePreview = (item: UploadedItem) => {
    if (item.isImage) {
      // 图片用弹窗预览
      setPreviewUrl(item.url);
    } else {
      // PDF 浏览器可内联打开，Word 会触发下载
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={cn('flex w-full flex-col items-center', className)}>
      {/* 拖拽 / 点击上传区 */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex h-55 w-full cursor-pointer flex-col items-center justify-center gap-3.5 rounded-[10px] border-2 border-dashed bg-[#fafbfc] transition-all duration-200',
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50',
          disabled && 'pointer-events-none cursor-not-allowed opacity-60',
        )}
      >
        <Upload className="h-12 w-12 text-gray-400" />
        <div className="px-4 text-center text-sm font-medium text-gray-700">{config.title}</div>
        <div className="px-4 text-center text-xs text-gray-400">{config.hint}，可多选</div>
      </div>

      <input ref={inputRef} type="file" multiple accept={config.accept} className="hidden" onChange={handleInputChange} />

      {/* 错误提示 */}
      {error && <p className="mt-3 w-full text-xs leading-relaxed text-red-500">{error}</p>}

      {/* 已上传列表 */}
      {items.length > 0 && (
        <div className="mt-4 w-full">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">已添加 {items.length} 个文件</span>
            <button type="button" onClick={handleClear} className="text-xs text-gray-400 transition-colors hover:text-red-500">
              清空
            </button>
          </div>

          {/* 图片缩略图 */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((item) => (
                <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <img src={item.url} alt={item.file.name} className="h-full w-full object-cover" />

                  {/* hover 遮罩操作 */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                      type="button"
                      title="预览"
                      onClick={() => handlePreview(item)}
                      className="rounded-full bg-white/90 p-1.5 transition-colors hover:bg-white"
                    >
                      <Eye className="h-3.5 w-3.5 text-gray-700" />
                    </button>
                    <button
                      type="button"
                      title="删除"
                      onClick={() => handleRemove(item.id)}
                      className="rounded-full bg-white/90 p-1.5 transition-colors hover:bg-red-500"
                    >
                      <X className="h-3.5 w-3.5 text-gray-700" />
                    </button>
                  </div>

                  {/* 文件名 */}
                  <div className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-1.5 py-0.5 text-[10px] text-white">{item.file.name}</div>
                </div>
              ))}
            </div>
          )}

          {/* 文件列表 */}
          {documents.length > 0 && (
            <ul className={cn('space-y-2', images.length > 0 && 'mt-2', 'max-h-52 overflow-y-auto pr-0.5')}>
              {documents.map((item) => (
                <li key={item.id} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <FileText className="h-4 w-4 shrink-0 text-blue-500" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-gray-700" title={item.file.name}>
                      {item.file.name}
                    </p>
                    <p className="text-[10px] text-gray-400">{formatSize(item.file.size)}</p>
                  </div>

                  <button
                    type="button"
                    title="预览"
                    onClick={() => handlePreview(item)}
                    className="rounded p-1 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="删除"
                    onClick={() => handleRemove(item.id)}
                    className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 上传须知 */}
      <div className="mt-4 w-full px-3 py-2.5 text-xs leading-relaxed text-gray-500">
        <strong className="text-gray-700">上传须知：</strong>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 marker:text-gray-400">
          <li>确保文件内容清晰可识别</li>
          <li>单个文件大小 ≤ {maxSizeMB}MB</li>
          <li>支持一次选择多个文件，后续上传自动追加</li>
          <li>审核通过后将进入公共试卷库</li>
        </ul>
      </div>

      {/* 图片预览弹窗 */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-3xl p-2">
          {previewUrl && <img src={previewUrl} alt="预览" className="max-h-[75vh] w-full rounded-md object-contain" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
