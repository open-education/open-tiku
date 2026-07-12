// components/PaperGenerator.tsx
import React, { useState, useCallback } from "react";
import { MenuTree, FilterPanel, PaperConfig, PaperPreview, QuestionReplacement } from "~/paper/gen/index";
import { Plus, Printer, Download, Send, Save } from "lucide-react";
import { arrayMove } from "@dnd-kit/sortable";

interface PaperConfigType {
  totalScore: number;
  sections: {
    type: string;
    count: number;
    score: number;
  }[];
}

interface Question {
  id: string;
  type: string;
  content: string;
  difficulty: number;
  score: number;
  tags: string[];
  knowledgePoint: string;
}

const PaperGenerator: React.FC = () => {
  const [selectedMenuPath, setSelectedMenuPath] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    questionType: "",
    tags: [] as string[],
    coreLiteracy: "",
    difficulty: 0,
  });
  const [paperConfig, setPaperConfig] = useState<PaperConfigType>({
    totalScore: 100,
    sections: [
      { type: "选择题", count: 10, score: 3 },
      { type: "填空题", count: 5, score: 4 },
      { type: "判断题", count: 5, score: 2 },
      { type: "解答题", count: 4, score: 10 },
    ],
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showReplacement, setShowReplacement] = useState(false);
  const [replacingQuestionId, setReplacingQuestionId] = useState<string | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [paperSummary, setPaperSummary] = useState({
    knowledgeCoverage: 0,
    difficultyCoefficient: 0,
    totalQuestions: 0,
  });

  const handleMenuSelect = (path: string[]) => {
    setSelectedMenuPath(path);
  };

  const handleGeneratePaper = async () => {
    // 模拟API请求
    const mockQuestions: Question[] = [
      {
        id: "1",
        type: "选择题",
        content: "若a+b=5，a-b=3，则a的值为？",
        difficulty: 3,
        score: 3,
        tags: ["中考题"],
        knowledgePoint: "二元一次方程组",
      },
      { id: "2", type: "选择题", content: "下列哪个是无理数？", difficulty: 2, score: 3, tags: ["典型题"], knowledgePoint: "实数" },
      // ... 更多题目
    ];
    setQuestions(mockQuestions);
    setPaperSummary({
      knowledgeCoverage: 85,
      difficultyCoefficient: 4.5,
      totalQuestions: mockQuestions.length,
    });
    setIsGenerated(true);
  };

  const handleDragQuestion = (dragIndex: number, hoverIndex: number) => {
    const newQuestions = arrayMove(questions, dragIndex, hoverIndex);
    setQuestions(newQuestions);
  };

  const handleReplaceQuestion = (questionId: string) => {
    setReplacingQuestionId(questionId);
    setShowReplacement(true);
  };

  const handleConfirmReplacement = (newQuestion: Question) => {
    const index = questions.findIndex((q) => q.id === replacingQuestionId);
    if (index !== -1) {
      const newQuestions = [...questions];
      newQuestions[index] = { ...newQuestion, id: replacingQuestionId! };
      setQuestions(newQuestions);
    }
    setShowReplacement(false);
    setReplacingQuestionId(null);
  };

  const handleUpdateQuestionScore = (questionId: string, newScore: number) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, score: newScore } : q)));
  };

  const handleSavePaper = () => {
    console.log("保存试卷");
    // 保存逻辑
  };

  const handleAssignHomework = () => {
    console.log("布置作业");
    // 布置作业逻辑
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* 左侧菜单区域 */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-3">知识点导航</h3>
            <MenuTree onSelect={handleMenuSelect} selectedPath={selectedMenuPath} />
          </div>
        </div>

        {/* 右侧主要内容 */}
        <div className="col-span-9 space-y-4">
          {/* 筛选条件 */}
          <div className="bg-white rounded-lg shadow p-4">
            <FilterPanel filters={filters} setFilters={setFilters} />
          </div>

          {/* 试卷配置 */}
          <div className="bg-white rounded-lg shadow p-4">
            <PaperConfig config={paperConfig} setConfig={setPaperConfig} />
          </div>

          {/* 生成按钮 */}
          <div className="flex justify-end">
            <button onClick={handleGeneratePaper} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              生成试卷
            </button>
          </div>

          {/* 试卷预览 */}
          {isGenerated && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">试卷概览</h3>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={handleSavePaper} className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={handleAssignHomework} className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <PaperPreview
                summary={paperSummary}
                questions={questions}
                onDrag={handleDragQuestion}
                onReplace={handleReplaceQuestion}
                onUpdateScore={handleUpdateQuestionScore}
              />
            </div>
          )}
        </div>
      </div>

      {/* 题目替换弹窗 */}
      {showReplacement && (
        <QuestionReplacement
          onClose={() => setShowReplacement(false)}
          onConfirm={handleConfirmReplacement}
          filters={filters}
          selectedPath={selectedMenuPath}
        />
      )}
    </div>
  );
};

export default PaperGenerator;
