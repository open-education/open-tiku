import type { QuestionOption } from "~/type/question";
import { SimpleFullContent } from "~/common/content";
import { StringValidator } from "~/util/string";
import { ImageZoom } from "~/common/image";
import { cn } from "~/lib/utils";

/// 选择题选项样式--试卷和题库均使用后续移动到父级

interface MultiOptionShowProps {
  optionsLayout: number; // 1, 2, 3
  options: QuestionOption[];
}

const gridColsMap: Record<number, string> = {
  1: "grid-cols-1", // 展示1列
  2: "grid-cols-2", // 展示两列
  3: "grid-cols-4", // 展示4列
};

function MultiOptionShow({ optionsLayout = 4, options }: MultiOptionShowProps) {
  const validLayout = [1, 2, 3].includes(optionsLayout) ? optionsLayout : 1;
  const gridClass = gridColsMap[validLayout] || "grid-cols-4";

  const isImageMode = options.every((opt) => opt.images && opt.images.length > 0);

  return (
    <div className={cn("grid gap-4", gridClass)}>
      {options.map((option) => {
        const imageUrl = option.images?.[0];

        return (
          <div key={option.label} className={cn("flex flex-row items-stretch", "bg-card rounded-lg", isImageMode ? "h-48" : "")}>
            {/* 左栏：标签（固定宽度，垂直居中） */}
            <div className={cn("shrink-0 text-foreground self-center", "w-6", "flex items-center justify-start")}>{option.label}.</div>

            {/* 右栏：内容（flex-1 占剩余宽度，内部左对齐） */}
            <div className="flex-1 flex items-center min-w-0 h-full">
              {isImageMode ? (
                // 图片模式：图片容器左对齐，图片高度填满，宽度自适应，并限制最大宽度
                <div className="w-full h-full flex items-center justify-start overflow-hidden">
                  {imageUrl ? (
                    <ImageZoom imageName={imageUrl} className="h-full w-auto max-w-full object-contain" />
                  ) : (
                    <span className="text-muted-foreground text-sm">无图片</span>
                  )}
                </div>
              ) : (
                // 文字模式：内容左对齐，自动换行
                <span className={cn("wrap-break-word w-full text-left")}>
                  {StringValidator.isNonEmpty(option.content) && <SimpleFullContent content={option.content} />}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { MultiOptionShow };
