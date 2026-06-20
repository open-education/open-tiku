/// 标题设计

import { StringValidator } from "~/util/string";
import { SimpleFullContent } from "~/common/simple-content";
import { ImageZoom } from "../image";

interface TitleShowProps {
  id?: number; // 显示题目id-普通列表用
  title: string;
  comment: string;
  images?: string[];
}

function TitleShow({ id = 0, title, comment, images = [] }: TitleShowProps) {
  return (
    <div>
      {/* 题干 */}
      {StringValidator.isNonEmpty(title) && (
        <div>
          <SimpleFullContent content={title} />
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
                <ImageZoom imageName={imageName} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { TitleShow };
