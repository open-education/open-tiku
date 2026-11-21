import { SimpleAlert } from '@/components/common/alert';
import { ImageZoom } from '@/components/common/image';
import { Button } from '@/components/ui/button';
import { UploadFileType } from '@/type/enum';
import type { FinalUploadItem, UploadFileResp } from '@/type/file';
import { httpClient } from '@/util/http';
import { ObjectUtil } from '@/util/object';
import { cn } from 'cn';
import { Eye, FileText, LoaderCircle, Upload, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface FileUploadProps {
  fileType: UploadFileType;
  defaultList?: FinalUploadItem[];
  maxSizeMB?: number;
  onChange?: (files: FinalUploadItem[]) => void;
  className?: string;
}

const fileTypeList: Record<UploadFileType, { accept: string; title: string; hint: string }> = {
  [UploadFileType.None]: {
    accept: 'None',
    title: 'None',
    hint: 'None',
  },
  [UploadFileType.Pdf]: {
    accept: '.pdf,application/pdf',
    title: 'PDF 文件上传',
    hint: '支持 pdf 格式，可多选',
  },
  [UploadFileType.Word]: {
    accept: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    title: 'Word 文件上传',
    hint: '支持 doc / docx 格式，可多选',
  },
  [UploadFileType.Image]: {
    accept: 'image/*',
    title: '图片上传',
    hint: '支持 jpg / jpeg / png / gif 图片格式，可多选',
  },
  [UploadFileType.Markdown]: {
    accept: '.md,.markdown,text/markdown',
    title: 'Markdown 文件上传',
    hint: '支持 md 文档格式, 仅支持 1 个文件',
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
    case UploadFileType.Markdown:
      return name.endsWith('.md');
    default:
      return false;
  }
}

export default function FileUpload({ fileType, defaultList = [], maxSizeMB = 2, onChange, className }: FileUploadProps) {
  const config = fileTypeList[fileType];
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<FinalUploadItem[]>([]);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultList.length <= 0) return;
    setItems(defaultList);
  }, [defaultList]);

  // 文件类型变更后清空已上传的文件
  useEffect(() => {
    setItems([]);
  }, [fileType]);

  const execHandleUpload = async (incoming: File[]) => {
    return Promise.all(
      incoming.map(async (file) => {
        const isImage = file.type.startsWith('image/');
        const formData = new FormData();
        formData.append('file', file);
        const res = await httpClient.post<UploadFileResp>(isImage ? '/file/upload/image' : '/file/upload/file', formData, undefined, true);
        return {
          id: ObjectUtil.createId(),
          file,
          resp: res,
          isImage,
        };
      }),
    );
  };

  const addFiles = useCallback(
    async (fileList: FileList | File[] | null) => {
      if (!fileList) return;
      const incoming = Array.from(fileList);
      if (incoming.length === 0) return;

      // 每次选择新文件时先清空旧错误
      setError(null);

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
      });

      if (rejected.length > 0) {
        setError(<SimpleAlert title="以下文件未通过校验" message={`${rejected.join('、')}`} />);
        return;
      }

      try {
        const respList = await execHandleUpload(incoming);
        if (respList.length === 0) {
          setError(<SimpleAlert title="校验上传后成功的文件为空" message="请重新上传, 如果依然为空请联系网站管理员" />);
          return;
        }

        setItems((prev) => {
          const curItems = [...prev, ...respList];
          return curItems;
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        setError(<SimpleAlert title="文件上传失败" message={errMsg} />);
      }
    },
    [fileType, maxSizeMB, onChange],
  );

  // 文件内容有变更时通知父组件
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    onChange?.(items);
  }, [items]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      await addFiles(e.target.files);
      e.target.value = '';
    } finally {
      setLoading(false);
    }
  };

  // 图片/文件删除, 服务端的就不关心了, 后续通过其它手段去清除幽灵图片和文件
  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // 文件预览按钮点击事件
  const handlePreview = (item: FinalUploadItem) => {
    // pdf 文件支持直接预览, 其余文件浏览器会触发下载自行查看
    window.open(`/files/${item.resp.url}`, '_blank', 'noopener,noreferrer');
  };

  const handleClear = () => {
    setItems([]);
    setError(null);
    onChange?.([]);
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* 点击上传区 */}
      <div
        role="button"
        tabIndex={loading ? -1 : 0}
        aria-disabled={loading}
        onClick={() => !loading && items.length < 5 && inputRef.current?.click()}
        className={cn(
          'flex h-55 w-full cursor-pointer flex-col items-center justify-center gap-3.5 rounded-[10px] border-2 border-dashed bg-[#fafbfc] transition-all duration-200',
          'border-gray-300 hover:border-blue-500 hover:bg-blue-50',
          loading && 'pointer-events-none cursor-not-allowed opacity-60',
        )}
      >
        {loading ? <LoaderCircle className="h-12 w-12 text-gray-400" /> : <Upload className="h-12 w-12 text-gray-400" />}
        <div className="px-4 text-center text-sm font-medium text-gray-700">{loading ? '上传中...' : config.title}</div>
        <div className="px-4 text-center text-xs text-gray-400">{config.hint}</div>
      </div>

      <input ref={inputRef} type="file" multiple accept={config.accept} className="hidden" onChange={handleInputChange} />

      {/* 错误提示 */}
      {error && <div className="mt-3 w-full text-xs leading-relaxed text-red-500">{error}</div>}

      {/* 已上传列表 */}
      {items.length > 0 && (
        <div className="mt-4 w-full">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">已添加 {items.length} 个文件</span>
            <Button variant="outline" size="sm" onClick={handleClear}>
              清空
            </Button>
          </div>

          <div className="flex w-full flex-col gap-3">
            {items.map((item) => {
              return item.isImage ? (
                /* 图片项 */
                <div
                  key={item.id}
                  className="group relative flex w-full items-center justify-center overflow-hidden border border-gray-200 bg-gray-50 p-2"
                >
                  {/* 右上角删除按钮 */}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    title="删除图片"
                    className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>

                  {/* 图片预览（使用原有 ImageZoom 组件） */}
                  <div className="flex max-h-60 w-full items-center justify-center">
                    <ImageZoom imageName={item.resp.url} className="max-h-60 w-auto max-w-full object-contain" />
                  </div>

                  {/* 底部文件名遮罩 */}
                  <div className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-2.5 py-1 text-xs text-white">{item.resp.originalName}</div>
                </div>
              ) : (
                /* 文件项 */
                <div key={item.id} className="flex w-full items-center justify-between gap-3 border border-gray-200 bg-gray-50 px-3 py-2.5">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <FileText className="h-4 w-4 shrink-0 text-blue-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-gray-700" title={item.resp.originalName}>
                        {item.resp.originalName}
                      </p>
                      <p className="text-[10px] text-gray-400">{ObjectUtil.formatFileSize(item.resp.size)}</p>
                    </div>
                  </div>

                  {/* 右侧操作按钮区：预览 & 删除 */}
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(item)}
                      className="h-7 px-2 text-xs text-gray-600 hover:text-blue-600"
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      预览
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(item.id)}
                      className="h-7 px-2 text-xs text-gray-600 hover:text-red-600"
                    >
                      <X className="mr-1 h-3.5 w-3.5" />
                      删除
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 上传须知 */}
      <div className="mt-4 w-full px-3 py-2.5 text-xs leading-relaxed text-gray-500">
        <strong className="text-gray-700">上传须知：</strong>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 marker:text-gray-400">
          <li>确保文件内容清晰可识别</li>
          <li>单个文件大小 ≤ {maxSizeMB}MB</li>
          <li>如果支持一次选择多个文件，后续上传自动追加</li>
          <li>试卷上传最大支持 5 个文件</li>
          <li>题目上传最大支持 1 个文件</li>
          <li>审核通过后将进入公共试题/试卷库</li>
        </ul>
      </div>
    </div>
  );
}
