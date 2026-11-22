import { useCallback, useRef, useState } from 'react';

// 复制文本内容至剪贴板
export function useCopy(timeout = 2000) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = useCallback(
    async (text: string) => {
      try {
        // 优先现代 API, 但必须是安全的上下文才可用
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // 旧版 execCommand, 普通的 http 环境
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          const ok = document.execCommand('copy');
          document.body.removeChild(ta);
          if (!ok) throw new Error('复制失败');
        }

        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), timeout);
        return true;
      } catch (err) {
        console.error('复制失败', err);
        setCopied(false);
        return false;
      }
    },
    [timeout],
  );

  return { copy, copied };
}
