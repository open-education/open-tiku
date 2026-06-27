import { useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "~/lib/utils";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

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
  // 如果图片名称为空否则不渲染页面
  if (!imageName) {
    return "";
  }

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

// 添加图片
interface ImageAddProps {
  name: string; // 描述是什么图片
  images?: string[];

  add: () => void; // 添加则对对应的 images 属性初始化一个空值
  update: (idx: number, val: string) => void; // 更新时替换当前索引的值
  remove: (idx: number) => void; // 移除现有图片中当前索引的图片
}
function ImageAdd({ name, images = [], add, update, remove }: ImageAddProps) {
  return (
    <div className="mt-3 bg-muted/20 rounded-xl p-4 border border-dashed border-border/60 space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1 text-sm">
          <ImagePlus className="w-4 h-4" /> {name}
        </Label>
        <Button type="button" variant="ghost" className="h-8 gap-1 text-sm" onClick={add}>
          <Plus className="w-4 h-4" /> 添加
        </Button>
      </div>
      {images.map((url, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <Input
            value={url}
            onChange={(e) => update(idx, e.target.value)}
            className="h-9 bg-background text-sm md:text-sm"
            placeholder="输入图片标识"
          />
          <Button type="button" variant="destructive" size="icon" className="h-9 w-9 shrink-0" onClick={() => remove(idx)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      {images.length === 0 && <p className="text-sm text-muted-foreground py-1">暂无图片，点击右上方添加</p>}
    </div>
  );
}

export { ImageZoom, ImageAdd };
