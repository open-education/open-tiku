import { useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "~/lib/utils";
import { X } from "lucide-react";

interface ImageZoomProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  imageName: string; // 图片文件名（位于 /images/ 下）
  alt?: string;
  className?: string; // 缩略图样式
  maxWidth?: string; // 预览图最大宽度，默认 "95vw"
  maxHeight?: string; // 预览图最大高度，默认 "90vh"
  closePosition?: "top-right" | "bottom-right";
}

export function ImageZoom({
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
