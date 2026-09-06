import type { QuestionOption } from '~/type/question';
import { SimpleFullContent } from '~/common/content';
import { StringValidator } from '~/util/string';
import { ImageZoom } from '~/common/image';
import { cn } from 'cn';

/// 选择题选项样式

// 展示样式
interface MultiOptionShowProps {
  optionsLayout: number; // 1, 2, 3
  options: QuestionOption[];
}

const gridColsMap: Record<number, string> = {
  1: 'grid-cols-1', // 展示1列
  2: 'grid-cols-2', // 展示两列
  3: 'grid-cols-4', // 展示4列
};

function MultiOptionShow({ optionsLayout = 4, options }: MultiOptionShowProps) {
  const validLayout = [1, 2, 3].includes(optionsLayout) ? optionsLayout : 1;
  const gridClass = gridColsMap[validLayout] || 'grid-cols-4';

  const isImageMode = options.every((opt) => opt.images && opt.images.length > 0);

  return (
    <div className={cn('grid gap-4', gridClass)}>
      {options.map((option) => {
        const imageUrl = option.images?.[0];

        return (
          <div key={option.label} className={cn('flex flex-row items-stretch', 'bg-card text-base', isImageMode ? 'h-48' : '')}>
            {/* 左栏：标签（固定宽度，垂直居中） */}
            <div className={cn('shrink-0 text-foreground self-center', 'w-6', 'flex items-center justify-start')}>{option.label}.</div>

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
                <span className={cn('wrap-break-word w-full text-left')}>
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

// 做题时的选择列表
interface MultiOptionSelectProps {
  options: QuestionOption[];
  selectedOpt: string;
  setSelectedOpt: (value: string) => void;
  showAnswer: boolean;
  referAnswer: string; // 参考答案
}

function MultiOptionSelect({ options, selectedOpt, setSelectedOpt, showAnswer, referAnswer }: MultiOptionSelectProps) {
  return (
    <div className="grid gap-4 grid-cols-1">
      {options?.map((option) => {
        const imageUrl = option.images?.[0];
        const isImageMode = option.images && option.images.length > 0;
        const isSelected = selectedOpt === option.label;

        // 1. 默认/未选中态：适配深色模式的边界和悬浮色
        let cardClass =
          'border border-neutral-300 dark:border-neutral-700 bg-card hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-sm transition-all text-card-foreground';

        if (isSelected) {
          // 2. 已选中态：深色模式下降低背景亮度，提高文字亮度，并调整阴影
          cardClass =
            'border-indigo-600 dark:border-indigo-500 bg-indigo-100 dark:bg-indigo-950/40 ring-1 ring-indigo-600 dark:ring-indigo-500 shadow-md shadow-indigo-100/50 dark:shadow-none text-indigo-900 dark:text-indigo-200 font-medium transition-all';
        }

        if (showAnswer) {
          const isCurrentCorrect = option.label === referAnswer; // 是否是正确答案项
          const isUserCorrect = selectedOpt === referAnswer; // 用户是否整体答对

          if (isCurrentCorrect) {
            // 3. 正确答案态：深色模式下使用暗绿底+亮绿字
            cardClass =
              'border-emerald-600 dark:border-emerald-500 bg-emerald-100 dark:bg-emerald-950/40 ring-1 ring-emerald-600 dark:ring-emerald-500 shadow-md shadow-emerald-100/50 dark:shadow-none text-emerald-950 dark:text-emerald-200 font-semibold transition-all duration-200';
          } else if (isSelected && !isUserCorrect) {
            // 4. 错误项态：深色模式下使用暗红底+亮红字
            cardClass =
              'border-red-600 dark:border-red-500 bg-red-100 dark:bg-red-950/40 ring-1 ring-red-600 dark:ring-red-500 shadow-md shadow-red-100/50 dark:shadow-none text-red-950 dark:text-red-200 font-semibold transition-all duration-200';
          }
        }

        return (
          <div
            key={option.label}
            onClick={() => {
              // 揭晓答案后通常不可再修改选择
              if (!showAnswer) setSelectedOpt(option.label);
            }}
            // 完整还原你原本的类名组合与顺序，绝不添加多余的 CSS
            className={cn('flex flex-row items-stretch p-2', 'bg-card text-base', isImageMode ? 'h-48' : '', cardClass)}
          >
            {/* 左栏：标签 */}
            <div className={cn('shrink-0 text-foreground self-center', 'w-6', 'flex items-center justify-start')}>{option.label}.</div>

            {/* 右栏：内容 */}
            <div className="flex-1 flex items-center min-w-0 h-full">
              {isImageMode ? (
                <div className="w-full h-full flex items-center justify-start overflow-hidden">
                  {imageUrl ? (
                    <ImageZoom imageName={imageUrl} className="h-full w-auto max-w-full object-contain" />
                  ) : (
                    <span className="text-muted-foreground text-sm">无图片</span>
                  )}
                </div>
              ) : (
                <span className={cn('wrap-break-word w-full text-left')}>
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

export { MultiOptionShow, MultiOptionSelect };
