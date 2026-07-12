// components/Navigation.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FileText, List, Plus } from "lucide-react";

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-bold text-blue-600">数学组卷系统</h1>
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                location.pathname === "/" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>生成试卷</span>
            </Link>
            <Link
              to="/papers"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                location.pathname === "/papers" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <List className="w-4 h-4" />
              <span>试卷列表</span>
            </Link>
          </div>
        </div>
        <div className="text-sm text-gray-500">教师: 张老师</div>
      </div>
    </nav>
  );
};

export default Navigation;
