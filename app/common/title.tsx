import { StringValidator } from "~/util/string";
import { SimpleFullContent } from "~/common/content";
import { ImageZoom } from "~/common/image";

/// 标题设计--试卷和题库均使用后续移动到父级

interface TitleShowProps {
  no?: number; // 试卷显示题号
  id?: number; // 显示题目id-普通列表用
  title: string;
  comment: string;
  images?: string[];
}

function TitleShow({ no = 0, id = 0, title, comment, images = [] }: TitleShowProps) {
  // 试卷和题目显示前缀
  const content = no > 0 ? `${no}&#46; ${title}` : id > 0 ? `**ID[${id}].** ${title}` : "";

  return (
    <div className="text-base">
      {/* 题干 */}
      {StringValidator.isNonEmpty(title) && (
        <div>
          <SimpleFullContent content={content} />
        </div>
      )}
      {/* 标记 */}
      {StringValidator.isNonEmpty(comment) && <div className="mt-3">{comment}</div>}
      {/* 图片 */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-4 items-center mt-3">
          {images.map((imageName) => {
            return (
              <div key={imageName} className="col-span-1">
                <ImageZoom imageName={imageName} className="h-full w-auto max-w-full object-contain" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { TitleShow };
