import { useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { cn } from "~/lib/utils";
import { FileImage, ImageUp, Loader2, Trash2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { DeleteImageReq, UploadFileResp } from "~/type/image";
import { httpClient } from "~/util/http";
import { SimpleAlert } from "~/common/alert";

/// 图片相关组件

// 图片放大
interface ImageZoomProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  imageName: string; // 图片文件名（位于 /images/ 下）
  alt?: string;
  className?: string; // 缩略图样式
  maxWidth?: string; // 预览图最大宽度，默认 "95vw"
  maxHeight?: string; // 预览图最大高度，默认 "90vh"
  closePosition?: "top-right" | "bottom-right";
}

function ImageZoom({
  imageName,
  alt = "图片",
  className,
  maxWidth = "95vw",
  maxHeight = "90vh",
  closePosition = "top-right",
  ...props
}: ImageZoomProps) {
  const [open, setOpen] = useState(false);

  const positionClass = closePosition === "top-right" ? "top-4 right-4" : "bottom-4 right-4";

  const imageSrc = `/images/${imageName}`;

  return (
    <>
      {/* 缩略图 */}
      <img
        src={imageSrc}
        alt={alt}
        className={cn("cursor-pointer rounded-lg transition-transform duration-200 hover:scale-105 active:scale-95", className)}
        onClick={() => setOpen(true)}
        {...props}
      />

      {/* 预览弹窗 — 使用 Portal 渲染到 body */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)} // 点击背景关闭
          >
            {/* 图片容器 — 限制最大尺寸，内部 flex 居中 */}
            <div
              className="relative flex items-center justify-center"
              style={{ maxWidth, maxHeight }}
              onClick={(e) => e.stopPropagation()} // 防止点击图片本身关闭
            >
              <img src={imageSrc} alt={alt} className="w-auto h-auto max-w-full max-h-full object-contain rounded-lg shadow-2xl" />

              {/* 关闭按钮 */}
              <button
                className={cn(
                  "absolute rounded-full bg-black/60 p-2.5 text-white",
                  "hover:bg-black/80 hover:scale-105 active:scale-95",
                  "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/60",
                  positionClass,
                )}
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">关闭</span>
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

// 图片上传浮动框-题目添加编辑时用于将图片上传至网站

/**
 * 接口返回这个格式的图片信息, 其中 name url 均是图片的 id originalName 为图片原始名称
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
function ImageUpload() {
  const [open, setOpen] = useState(false);
  const [imageName, setImageName] = useState<string>("");
  const [imageSize, setImageSize] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageId, setImageId] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [imageErr, setImageErr] = useState<string>("");

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

  // 图片上传
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageErr("");

    if (!file.type.startsWith("image/")) {
      setImageErr("请选择图片文件");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setImageErr("图片大小不能超过 1MB");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    httpClient
      .post<UploadFileResp>("/file/upload/image", formData, undefined, true)
      .then((res) => {
        const { name, size } = res;
        const imgUrl = `/images/${name}`;
        setImageUrl(imgUrl || "");
        setImageId(name || "");
        setImageSize(formatFileSize(size));
      })
      .catch((err) => {
        setImageErr(err.message);
        handleRemoveImage();
      })
      .finally(() => {
        e.target.value = "";
        setUploading(false);
      });
  };

  // 清空图片状态值
  const handleRemoveImage = () => {
    setImageName("");
    setImageSize("");
    setImageUrl("");
    setImageId("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 删除图片
  const deleteImage = async () => {
    setImageErr("");

    if (!imageId && !imageUrl) {
      handleRemoveImage();
      return;
    }

    setDeleting(true);
    const req: DeleteImageReq = { filename: imageId };
    httpClient
      .post<boolean>("/file/delete/image", req)
      .then((res) => {})
      .catch((err) => setImageErr(err.message))
      .finally(() => {
        handleRemoveImage();
        setDeleting(false);
      });
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="fixed top-24 right-4 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button variant={"secondary"}>
              <ImageUp className="h-5 w-5" />
              <span className="hidden sm:inline">上传图片</span>
            </Button>
          }
        />

        <PopoverContent className="w-85 sm:w-95 p-0 shadow-2xl border-border/50" align="end" sideOffset={12}>
          {/* 卡片头部 */}
          <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <FileImage className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">上传图片</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-muted"
              onClick={handleClose}
              disabled={uploading || deleting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

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
                imageId ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25",
                (uploading || deleting) && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading || deleting}
              />
              <div className="flex flex-col items-center gap-2">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : (
                  <div
                    className={cn("rounded-full p-3 transition-colors", imageId ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}
                  >
                    <ImageUp className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{uploading ? "上传中..." : imageId ? "重新上传" : "点击上传图片"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {uploading ? "请稍候" : imageId ? "点击更换图片" : "支持后缀为 .jpg,.jpeg,.png,.gif 的图片, 最大 1MB"}
                  </p>
                </div>
              </div>
            </div>

            {/* 中部：图片展示 */}
            {imageId ? (
              <div className="relative rounded-lg overflow-hidden bg-muted/50 border">
                <ImageZoom imageName={imageId} />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg hover:scale-110 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (deleting) return;
                    if (imageId || imageUrl) {
                      deleteImage();
                    } else {
                      handleRemoveImage();
                    }
                  }}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </Button>
                {imageName && (
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">{imageName}</div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/20 py-8 min-h-25">
                <FileImage className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground/60 mt-2">暂无图片</p>
              </div>
            )}

            {imageErr && (
              <div>
                <SimpleAlert title="处理图片失败" message={imageErr} />
              </div>
            )}

            {/* 底部：图片地址 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">📍 图片标识</label>
                {imageId && imageSize && <span className="text-xs text-muted-foreground/60">{imageSize}</span>}
              </div>
              <Input value={imageId || "未选择图片"} readOnly className={cn("text-sm h-9", !imageId && "text-muted-foreground/50")} />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { ImageZoom, ImageUpload };
