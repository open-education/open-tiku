import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PaperGenTypeMeta } from "~/type/paper";

// 生成试卷配置

interface PaperGenConfigProps {
  paperGenMetaList: PaperGenTypeMeta[];
  onChange?: (metaList: PaperGenTypeMeta[]) => void;
}

function PaperGenConfig({ paperGenMetaList = [], onChange }: PaperGenConfigProps) {
  const [metaList, setMetaList] = useState<PaperGenTypeMeta[]>(() => paperGenMetaList.map((item) => ({ ...item })));

  useEffect(() => {
    setMetaList(paperGenMetaList.map((item) => ({ ...item })));
  }, [paperGenMetaList]);

  const updateNum = (index: number, delta: number) => {
    setMetaList((prev) => {
      const newList = prev.map((item, i) => (i === index ? { ...item, num: Math.max(0, item.num + delta) } : item));
      onChange?.(newList);
      return newList;
    });
  };

  const updateScore = (index: number, value: number) => {
    const newScore = Math.max(0, value);
    setMetaList((prev) => {
      const newList = prev.map((item, i) => (i === index ? { ...item, score: newScore } : item));
      onChange?.(newList);
      return newList;
    });
  };

  const totalScore = useMemo(() => {
    return metaList.reduce((sum, item) => sum + item.num * item.score, 0);
  }, [metaList]);

  const totalQuestions = useMemo(() => {
    return metaList.reduce((sum, item) => sum + item.num, 0);
  }, [metaList]);

  return (
    <div className="border space-y-2 p-3">
      {metaList.map((meta, index) => (
        <div key={meta.id || index} className="flex items-center space-x-4">
          <span className="w-20 text-sm font-medium">{meta.label}</span>
          <div className="flex items-center space-x-2">
            <label className="text-sm">题数：</label>
            <button
              onClick={() => updateNum(index, -1)}
              className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={meta.num <= 0}
              type="button"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-12 text-center text-sm">{meta.num}</span>
            <button onClick={() => updateNum(index, 1)} className="p-1 hover:bg-gray-100" type="button">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm">每题分数：</label>
            <input
              type="number"
              min="0"
              step="1"
              value={meta.score}
              onChange={(e) => updateScore(index, Number(e.target.value))}
              className="w-16 px-2 py-1 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-sm text-gray-400">(小计：{meta.num * meta.score}分)</span>
        </div>
      ))}
      <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
        <span className="text-sm font-medium">总分：{totalScore} 分</span>
        <span className="text-sm">预估总题数：{totalQuestions} 题</span>
      </div>
    </div>
  );
}

export { PaperGenConfig };
