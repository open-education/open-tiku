import type { QuestionOption } from "~/type/question";
import { SimpleFullContent } from "../simple-content";
import { StringValidator } from "~/util/string";

/// 选择题选项样式--试卷和题库均使用后续移动到父级

// 单个选项样式
interface SingleOptionShowProps {
  label: string;
  content: string;
  images?: string[];
}
function SingleOptionShow({ label, content, images = [] }: SingleOptionShowProps) {
  return (
    <div className="grid grid-cols-20 gap-4 items-center">
      <div className="col-span-1">{label}.</div>
      <div className="col-span-19">
        {StringValidator.isNonEmpty(content) && <SimpleFullContent content={content} />}

        {images?.map((imageName) => {
          return (
            <div key={imageName} style={{ width: 200, height: 200, overflow: "hidden" }}>
              <img src={`/images/${imageName}`} alt={imageName} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 选择题选项展示
interface MultiOptionShowProps {
  optionsLayout: number;
  options: QuestionOption[];
}
function MultiOptionShow({ optionsLayout = 2, options = [] }: MultiOptionShowProps) {
  if (options.length == 0) {
    return "";
  }

  if (optionsLayout == 1) {
    // 展示一行
    return (
      <div className="grid grid-cols-4 gap-4 items-center">
        {options.map((item, index) => {
          return (
            <div key={index} className="col-span-1">
              <SingleOptionShow label={item.label} content={item.content} images={item.images} />
            </div>
          );
        })}
      </div>
    );
  } else if (optionsLayout == 2) {
    // 展示一列
    return (
      <div className="grid grid-cols-4 gap-4 items-center">
        {options.map((item, index) => {
          return (
            <div key={index} className="col-span-4">
              <SingleOptionShow label={item.label} content={item.content} images={item.images} />
            </div>
          );
        })}
      </div>
    );
  } else {
    // 将数组分成两部分, 5各选项的如果后续需要再调整样式, 5个选项一般选择一列的样式应该是最好的
    const options: QuestionOption[] = props.options ?? [];
    if (options.length === 0) {
      return "";
    }

    const mid = Math.floor(options.length / 2);
    const firstHalf = options.slice(0, mid);
    const secondHalf = options.slice(mid);

    return (
      <div>
        <div className="grid grid-cols-2 gap-4 items-center">
          {firstHalf.map((item, index) => {
            return (
              <div key={index} className="col-span-1">
                <SingleOptionShow label={item.label} content={item.content} images={item.images} />
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-4 items-center">
          {secondHalf.map((item, index) => {
            return (
              <div key={index} className="col-span-1">
                <SingleOptionShow label={item.label} content={item.content} images={item.images} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export { MultiOptionShow };
