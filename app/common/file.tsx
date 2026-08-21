import { FileImage, ImageUp, Loader2, Trash2 } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { DeleteFileReq, UploadFileResp } from "~/type/file";
import { httpClient } from "~/util/http";
import { ImageZoom } from "~/common/image";
import { SimpleAlert } from "~/common/alert";
import { Input } from "~/components/ui/input";

/// 文件工具

// 文件上传

interface FileUploadProps {
  isImage: boolean; // 图片, 图片使用的比较多, 所以默认图片
}
/**
 * 接口返回这个格式的文件信息, 其中 name url 均是文件的 id originalName 为文件原始名称
 * {
    "code": 200,
    "msg": "ok",
    "data": {
      "originalName": "Screenshot From 2026-06-15 21-51-14.png",
      "size": 91655,
      "name": "a4255fda82",
      "url": "a4255fda82"
    }
  }
 * @returns 
 */
function FileUpload({ isImage }: FileUploadProps) {
  const [originalFileName, setOriginalFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileId, setFileId] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [fileErr, setFileErr] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (uploading || deleting) return;
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // 文件上传
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileErr("");

    if (isImage && !file.type.startsWith("image/")) {
      setFileErr("请选择图片文件");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setFileErr("文件大小不能超过 1MB");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    httpClient
      .post<UploadFileResp>(isImage ? "/file/upload/image" : "/file/upload/file", formData, undefined, true)
      .then((res) => {
        const { name, size, originalName, url } = res;
        setFileUrl(isImage ? `/images/${url}` : `/files/${url}`);
        setFileId(name || "");
        setOriginalFileName(originalName || "");
        setFileSize(formatFileSize(size));
      })
      .catch((err) => {
        setFileErr(err.message);
        handleRemoveFile();
      })
      .finally(() => {
        e.target.value = "";
        setUploading(false);
      });
  };

  // 清空图片状态值
  const handleRemoveFile = () => {
    setOriginalFileName("");
    setFileSize("");
    setFileUrl("");
    setFileId("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 删除文件
  const deleteFile = async () => {
    setFileErr("");

    if (!fileId && !fileUrl) {
      handleRemoveFile();
      return;
    }

    setDeleting(true);
    const req: DeleteFileReq = { filename: fileId, isImage };
    httpClient
      .post<boolean>("/file/delete/file", req)
      .then((res) => {})
      .catch((err) => setFileErr(err.message))
      .finally(() => {
        handleRemoveFile();
        setDeleting(false);
      });
  };

  return (
    <div className="border bg-muted/30">
      {fileErr && (
        <div className="ml-4 mr-4">
          <SimpleAlert title="处理文件失败" message={fileErr} />
        </div>
      )}

      {/* 卡片内容 */}
      <div className="p-4 space-y-4">
        {/* 上部：上传区域 */}
        <div
          onClick={handleUploadClick}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 text-center",
            "cursor-pointer transition-all duration-200",
            "hover:border-primary hover:bg-primary/5",
            "hover:shadow-inner",
            fileId ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25",
            (uploading || deleting) && "cursor-not-allowed opacity-60",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg, image/png, image/gif, .jpg, .jpeg, .png, .gif, text/markdown, .md"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading || deleting}
          />
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <div className={cn("rounded-full p-3 transition-colors", fileId ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                <ImageUp className="h-8 w-8" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{uploading ? "上传中..." : fileId ? "重新上传" : "点击上传文件"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {uploading ? "请稍候" : fileId ? "点击更换文件" : "图片支持后缀为 .jpg, .jpeg, .png, .gif, 普通文件支持后缀为 .md, 限制最大 1MB"}
              </p>
            </div>
          </div>
        </div>

        {/* 中部：图片展示, 上传普通文件就不展示预览信息 */}
        {isImage &&
          (fileId ? (
            <div className="relative rounded-lg overflow-hidden bg-muted/50 border">
              <ImageZoom imageName={fileId} />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg hover:scale-110 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  if (deleting) return;
                  if (fileId || fileUrl) {
                    deleteFile();
                  } else {
                    handleRemoveFile();
                  }
                }}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </Button>
              {originalFileName && (
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                  {originalFileName}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/20 py-8 min-h-25">
              <FileImage className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground/60 mt-2">暂无文件</p>
            </div>
          ))}

        {/* 底部：图片地址 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">📍 文件标识</label>
            {originalFileName && fileSize && <span className="text-xs text-muted-foreground/60">{originalFileName}</span>}
          </div>
          <Input value={originalFileName || "未选择文件"} readOnly className={cn("text-sm h-9", !originalFileName && "text-muted-foreground/50")} />

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">📍 文件名称</label>
            {fileId && fileSize && <span className="text-xs text-muted-foreground/60">{fileSize}</span>}
          </div>
          <Input value={fileId || "未选择文件"} readOnly className={cn("text-sm h-9", !fileId && "text-muted-foreground/50")} />
        </div>
      </div>
    </div>
  );
}

export { FileUpload };
