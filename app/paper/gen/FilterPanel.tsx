// components/FilterPanel.tsx
import React from "react";
import { X } from "lucide-react";

interface FilterPanelProps {
  filters: {
    questionType: string;
    tags: string[];
    coreLiteracy: string;
    difficulty: number;
  };
  setFilters: (filters: any) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters }) => {
  const questionTypes = ["全部", "选择题", "填空题", "判断题", "解答题"];
  const tagOptions = ["中考题", "典型题", "必做题", "易错题", "压轴题"];
  const literacyOptions = ["全部", "数学抽象", "逻辑推理", "数学建模", "直观想象", "数学运算", "数据分析"];
  const difficultyOptions = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

  const handleTagToggle = (tag: string) => {
    setFilters({
      ...filters,
      tags: filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag],
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">题目类型：</label>
          <select
            value={filters.questionType}
            onChange={(e) => setFilters({ ...filters, questionType: e.target.value })}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {questionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">难度：</label>
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: parseFloat(e.target.value) })}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>全部</option>
            {difficultyOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">核心素养：</label>
          <select
            value={filters.coreLiteracy}
            onChange={(e) => setFilters({ ...filters, coreLiteracy: e.target.value })}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {literacyOptions.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">标签：</label>
        <div className="flex flex-wrap gap-2">
          {tagOptions.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filters.tags.includes(tag) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
