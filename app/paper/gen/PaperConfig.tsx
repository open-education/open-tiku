// components/PaperConfig.tsx
import React from "react";
import { Plus, Minus } from "lucide-react";

interface SectionConfig {
  type: string;
  count: number;
  score: number;
}

interface PaperConfigProps {
  config: {
    totalScore: number;
    sections: SectionConfig[];
  };
  setConfig: (config: any) => void;
}

const PaperConfig: React.FC<PaperConfigProps> = ({ config, setConfig }) => {
  const questionTypes = ["选择题", "填空题", "判断题", "解答题"];

  const updateSection = (index: number, field: keyof SectionConfig, value: number) => {
    const newSections = [...config.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    const totalScore = newSections.reduce((sum, s) => sum + s.count * s.score, 0);
    setConfig({ ...config, sections: newSections, totalScore });
  };

  return (
    <div>
      <h4 className="font-medium text-gray-700 mb-3">试卷配置</h4>
      <div className="space-y-2">
        {config.sections.map((section, index) => (
          <div key={section.type} className="flex items-center space-x-4">
            <span className="w-20 text-sm font-medium text-gray-600">{section.type}</span>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-500">题数：</label>
              <button onClick={() => updateSection(index, "count", Math.max(0, section.count - 1))} className="p-1 rounded hover:bg-gray-100">
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-12 text-center text-sm">{section.count}</span>
              <button onClick={() => updateSection(index, "count", section.count + 1)} className="p-1 rounded hover:bg-gray-100">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-500">每题分数：</label>
              <input
                type="number"
                value={section.score}
                onChange={(e) => updateSection(index, "score", Math.max(0, parseInt(e.target.value) || 0))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-sm text-gray-400">(小计：{section.count * section.score}分)</span>
          </div>
        ))}
        <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
          <span className="text-sm font-medium text-gray-700">总分：{config.totalScore} 分</span>
          <span className="text-sm text-gray-500">预估总题数：{config.sections.reduce((sum, s) => sum + s.count, 0)} 题</span>
        </div>
      </div>
    </div>
  );
};

export default PaperConfig;
