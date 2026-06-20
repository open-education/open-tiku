import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import type { HTMLAttributes } from "react";
import { Button } from "~/components/ui/button";

/// 图片

// 单击图片放大
interface ImageZoomProps extends HTMLAttributes<HTMLImageElement> {
  imageName: string;
  alt?: string;
  className?: string;
}

function ImageZoom({ imageName, alt, className, ...props }: ImageZoomProps) {
  return (
    <Dialog>
      <DialogTrigger>
        <img
          src={`/images/${imageName}`}
          alt={alt || "图片"}
          className={cn("cursor-pointer rounded-lg transition-transform duration-200 hover:scale-105 active:scale-95", className)}
          {...props}
        />
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex items-center justify-center",
          "max-w-[95vw] max-h-[95vh] w-auto h-auto p-0",
          "border-none bg-transparent shadow-none outline-none",
        )}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img
            src={`/images/${imageName}`}
            alt={alt || "放大图片"}
            className="w-auto h-auto max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose render={<Button type="button">Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { ImageZoom };
