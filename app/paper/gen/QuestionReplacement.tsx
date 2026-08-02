// components/QuestionReplacement.tsx
import React, { useState } from "react";
import { X, Search } from "lucide-react";

interface QuestionReplacementProps {
  onClose: () => void;
  onConfirm: (question: any) => void;
  filters: any;
  selectedPath: string[];
}

const QuestionReplacement: React.FC<QuestionReplacementProps> = ({ onClose, onConfirm, filters, selectedPath }) => {
  const [searchFilters, setSearchFilters] = useState(filters);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  // 模拟题库数据
  const mockQuestions = [
    { id: "r1", content: "若x+2=5，则x的值为？", type: "选择题", difficulty: 2, tags: ["典型题"], knowledgePoint: "一元一次方程" },
    { id: "r2", content: "计算：(-3) + 5 = ?", type: "选择题", difficulty: 1.5, tags: ["必做题"], knowledgePoint: "有理数运算" },
    // ... 更多题目
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[800px] max-h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">替换题目</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 筛选条件 */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="flex items-center space-x-4">
            <select className="border border-gray-300 rounded px-3 py-1 text-sm">
              <option>全部题型</option>
              <option>选择题</option>
              <option>填空题</option>
            </select>
            <select className="border border-gray-300 rounded px-3 py-1 text-sm">
              <option>全部难度</option>
              <option>1</option>
              <option>2</option>
            </select>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="搜索题目关键词..."
                className="w-full pl-8 pr-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* 题目列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {mockQuestions.map((q) => (
            <div
              key={q.id}
              onClick={() => setSelectedQuestion(q)}
              className={`p-3 border rounded cursor-pointer transition-colors ${
                selectedQuestion?.id === q.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-sm">{q.content}</div>
                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
                    <span>{q.type}</span>
                    <span>难度：{q.difficulty}</span>
                    <span>{q.knowledgePoint}</span>
                    {q.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">
            取消
          </button>
          <button
            onClick={() => selectedQuestion && onConfirm(selectedQuestion)}
            className={`px-4 py-2 bg-blue-600 text-white rounded transition-colors ${
              !selectedQuestion ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            确认替换
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionReplacement;
