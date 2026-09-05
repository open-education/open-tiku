import { cn } from 'cn';

/// 简单的水印

interface WatermarkProps {
  children: React.ReactNode;
  className?: string;
  text?: string;
  textColor?: string;
  fontSize?: string;
  rotate?: number;
}

export const Watermark = ({
  children,
  className,
  text = '预览区域',
  textColor = 'text-black/5',
  fontSize = 'text-5xl',
  rotate = -30,
}: WatermarkProps) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* 文本水印 */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <span
          className={cn('font-bold whitespace-nowrap', textColor, fontSize)}
          style={{
            transform: `rotate(${rotate}deg) scale(1.5)`,
          }}
        >
          {text}
        </span>
      </div>

      {/* 内容 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
