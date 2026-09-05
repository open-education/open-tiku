import { useState, useEffect, useRef } from 'react';

// 延迟显示加载进度条
export function useDelayedLoading(
  isLoading: boolean,
  options?: {
    enterDelay?: number; // 延迟出现时间（毫秒），默认 200
    minDisplay?: number; // 最少展示时间（毫秒），默认 300
  },
) {
  const { enterDelay = 200, minDisplay = 300 } = options || {};
  const [show, setShow] = useState(false);

  // 用 ref 记录当前是否正在显示，避免闭包陷阱
  const showRef = useRef(false);
  const startTimeRef = useRef(0);
  const timers = useRef<{ enter?: NodeJS.Timeout; exit?: NodeJS.Timeout }>({});

  // 同步 show 到 ref
  useEffect(() => {
    showRef.current = show;
  }, [show]);

  useEffect(() => {
    const clearTimers = () => {
      if (timers.current.enter) clearTimeout(timers.current.enter);
      if (timers.current.exit) clearTimeout(timers.current.exit);
      timers.current = {};
    };

    if (isLoading) {
      // 1. 开始加载：清除所有旧定时器
      clearTimers();

      // 2. 如果当前没显示，则设置延迟显示定时器
      if (!showRef.current) {
        timers.current.enter = setTimeout(() => {
          setShow(true);
          showRef.current = true;
          startTimeRef.current = Date.now(); // 记录真实显示的时间点
        }, enterDelay);
      }
    } else {
      // 3. 加载结束
      // 4. 如果还在"延迟等待期"内（还没显示出来），直接取消，不显示 Loading
      if (timers.current.enter) {
        clearTimeout(timers.current.enter);
        timers.current.enter = undefined;
      }

      // 5. 如果已经显示出来了，强制保持最小展示时间
      if (showRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, minDisplay - elapsed);

        if (timers.current.exit) clearTimeout(timers.current.exit);
        timers.current.exit = setTimeout(() => {
          setShow(false);
          showRef.current = false;
        }, remaining);
      } else {
        // 还没显示出来，直接设为 false（实际上本来就是 false）
        setShow(false);
      }
    }

    return clearTimers;
  }, [isLoading, enterDelay, minDisplay]);

  return show;
}
