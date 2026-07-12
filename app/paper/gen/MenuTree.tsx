// components/MenuTree.tsx
import React, { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  children?: MenuItem[];
}

const mockMenuData: MenuItem[] = [
  {
    id: "elementary",
    label: "小学",
    children: [
      {
        id: "elementary-math",
        label: "数学",
        children: [
          {
            id: "elementary-math-numbers",
            label: "数与代数",
            children: [
              {
                id: "elementary-math-numbers-integers",
                label: "整数",
                children: [
                  {
                    id: "elementary-math-numbers-integers-concept",
                    label: "整数的概念",
                    children: [
                      {
                        id: "elementary-math-numbers-integers-concept-type1",
                        label: "题型1：整数的认识",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "junior",
    label: "初中",
    children: [
      {
        id: "junior-math",
        label: "数学",
        children: [
          {
            id: "junior-math-algebra",
            label: "数与代数",
            children: [
              {
                id: "junior-math-algebra-rational",
                label: "有理数",
                children: [
                  {
                    id: "junior-math-algebra-rational-concept",
                    label: "有理数的概念和分类",
                    children: [
                      {
                        id: "junior-math-algebra-rational-concept-type1",
                        label: "题型1：有理数的概念",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

interface MenuTreeProps {
  onSelect: (path: string[]) => void;
  selectedPath: string[];
}

const MenuTree: React.FC<MenuTreeProps> = ({ onSelect, selectedPath }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["junior", "junior-math"]));

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderMenuItem = (item: MenuItem, path: string[] = []) => {
    const currentPath = [...path, item.id];
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedNodes.has(item.id);
    const isSelected = selectedPath.join("-") === currentPath.join("-");

    return (
      <div key={item.id} className="ml-4">
        <div
          className={`flex items-center py-1.5 px-2 rounded cursor-pointer hover:bg-blue-50 ${
            isSelected ? "bg-blue-100 text-blue-700" : "text-gray-700"
          }`}
          onClick={() => {
            if (!hasChildren) {
              onSelect(currentPath);
            }
            toggleNode(item.id);
          }}
        >
          {hasChildren && <span className="mr-1">{isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</span>}
          <span className="text-sm">{item.label}</span>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-2 border-l-2 border-gray-200 pl-2">{item.children!.map((child) => renderMenuItem(child, currentPath))}</div>
        )}
      </div>
    );
  };

  return <div className="space-y-1">{mockMenuData.map((item) => renderMenuItem(item))}</div>;
};

export default MenuTree;
