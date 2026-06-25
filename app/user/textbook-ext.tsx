import React, { useState, useMemo, useCallback } from "react";
import {
  ChevronRight,
  ChevronDown,
  FolderOpen,
  BookOpen,
  Tag,
  Plus,
  Pencil,
  Trash2,
  Link2,
  Unlink,
  MoveUp,
  MoveDown,
  Search,
  X,
  School,
  BookMarked,
  Layers,
  Hash,
  ListChecks,
} from "lucide-react";

// ============================================================
// 1. 类型定义
// ============================================================

interface TextbookNode {
  id: number;
  parentId: number | null;
  label: string;
  key: string;
  pathType: "common" | "knowledge" | "chapter";
  pathDepth: number;
  sortOrder: number;
  createdAt: string;
  children?: TextbookNode[];
}

interface ChapterKnowledge {
  id: number;
  chapterId: number;
  knowledgeId: number;
  createdAt: string;
}

interface QuestionCate {
  id: number;
  relatedId: number;
  label: string;
  key: string;
  sortOrder: number;
  createdAt: string;
}

// ============================================================
// 2. 模拟数据
// ============================================================

const mockTextbookData: TextbookNode[] = [
  {
    id: 1,
    parentId: null,
    label: "小学",
    key: "primary",
    pathType: "common",
    pathDepth: 1,
    sortOrder: 1,
    createdAt: "2024-01-01T00:00:00Z",
    children: [],
  },
  {
    id: 13,
    parentId: null,
    label: "初中",
    key: "middle",
    pathType: "common",
    pathDepth: 1,
    sortOrder: 2,
    createdAt: "2024-01-01T00:00:00Z",
    children: [],
  },
];

const mockChapterKnowledge: ChapterKnowledge[] = [];

const mockQuestionCates: QuestionCate[] = [];

// ============================================================
// 3. 辅助函数
// ============================================================

function buildTree(nodes: TextbookNode[], parentId: number | null = null): TextbookNode[] {
  return nodes
    .filter((n) => n.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((n) => ({
      ...n,
      children: buildTree(nodes, n.id),
    }));
}

function getFlatNodes(nodes: TextbookNode[]): TextbookNode[] {
  let result: TextbookNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children) {
      result = result.concat(getFlatNodes(node.children));
    }
  }
  return result;
}

function getNodePath(tree: TextbookNode[], id: number): TextbookNode[] {
  const path: TextbookNode[] = [];
  const find = (nodes: TextbookNode[], targetId: number): boolean => {
    for (const node of nodes) {
      path.push(node);
      if (node.id === targetId) return true;
      if (node.children && find(node.children, targetId)) return true;
      path.pop();
    }
    return false;
  };
  find(tree, id);
  return path;
}

function getDescendantIds(node: TextbookNode): number[] {
  let ids: number[] = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids = ids.concat(getDescendantIds(child));
    }
  }
  return ids;
}

function getNodeTypeInfo(pathType: string, pathDepth: number) {
  const map: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
    common: {
      label: "公共",
      icon: <School className="w-4 h-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    knowledge: {
      label: "考点",
      icon: <Tag className="w-4 h-4" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    chapter: {
      label: "章节",
      icon: <BookMarked className="w-4 h-4" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  };
  if (pathDepth === 8) {
    return {
      label: "细分题型",
      icon: <ListChecks className="w-4 h-4" />,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    };
  }
  return map[pathType] || map.common;
}

function isLevel7(node: TextbookNode): boolean {
  return node.pathDepth === 7;
}

// 获取节点的父级路径（用于显示）
const getParentPathLabel = (node: TextbookNode, allNodes: TextbookNode[]): string => {
  if (!node.parentId) return "根节点";
  const parent = allNodes.find((n) => n.id === node.parentId);
  if (!parent) return "未知";
  if (parent.parentId) {
    const grandParent = allNodes.find((n) => n.id === parent.parentId);
    if (grandParent) {
      return `${grandParent.label} > ${parent.label}`;
    }
  }
  return parent.label;
};

// ============================================================
// 4. 左侧概览面板（带父级路径显示）
// ============================================================

interface OverviewPanelProps {
  allNodes: TextbookNode[];
  selectedId: number | null;
  onSelect: (node: TextbookNode) => void;
  onAddChild: (parentId: number) => void;
  getQuestionCount: (nodeId: number) => number;
}

const OverviewPanel: React.FC<OverviewPanelProps> = ({ allNodes, selectedId, onSelect, onAddChild, getQuestionCount }) => {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const grouped = useMemo(() => {
    const nodes = allNodes.filter((n) => {
      if (filterType !== "all" && n.pathType !== filterType) return false;
      if (searchTerm) {
        const pathLabel = getParentPathLabel(n, allNodes);
        const matchesLabel = n.label.includes(searchTerm);
        const matchesKey = n.key.includes(searchTerm);
        const matchesPath = pathLabel.includes(searchTerm);
        if (!matchesLabel && !matchesKey && !matchesPath) return false;
      }
      return true;
    });
    return {
      common: nodes.filter((n) => n.pathType === "common"),
      knowledge: nodes.filter((n) => n.pathType === "knowledge"),
      chapter: nodes.filter((n) => n.pathType === "chapter"),
    };
  }, [allNodes, filterType, searchTerm]);

  const total = allNodes.length;

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-3 border-b space-y-2">
        <div className="flex gap-2">
          <select className="px-2 py-1 text-sm border rounded bg-white" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">全部类型 ({total})</option>
            <option value="common">公共</option>
            <option value="knowledge">考点</option>
            <option value="chapter">章节</option>
          </select>
          <input
            className="flex-1 px-2 py-1 text-sm border rounded bg-white"
            placeholder="搜索节点或路径..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs text-slate-400">
          共 {total} 个节点，当前筛选{" "}
          {
            allNodes.filter((n) => {
              if (filterType !== "all" && n.pathType !== filterType) return false;
              if (searchTerm) {
                const pathLabel = getParentPathLabel(n, allNodes);
                return n.label.includes(searchTerm) || n.key.includes(searchTerm) || pathLabel.includes(searchTerm);
              }
              return true;
            }).length
          }{" "}
          个
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-4">
        {Object.entries(grouped).map(([type, nodes]) => {
          if (nodes.length === 0) return null;
          const typeLabel = type === "common" ? "公共节点" : type === "knowledge" ? "考点节点" : "章节节点";
          const sorted = [...nodes].sort((a, b) => a.pathDepth - b.pathDepth);
          return (
            <div key={type}>
              <h3 className="text-sm font-semibold text-slate-600 mb-2">
                {typeLabel} ({nodes.length})
              </h3>
              <div className="grid grid-cols-6 gap-2">
                {sorted.map((node) => {
                  const isSelected = node.id === selectedId;
                  const typeInfo = getNodeTypeInfo(node.pathType, node.pathDepth);
                  const childCount = node.children?.length || 0;
                  const hasChildren = childCount > 0;
                  const questionCount = node.pathDepth === 7 ? getQuestionCount(node.id) : 0;
                  const parentPath = getParentPathLabel(node, allNodes);

                  return (
                    <div
                      key={node.id}
                      className={`
                        p-2 rounded border cursor-pointer transition-colors
                        ${isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-400"}
                      `}
                      onClick={() => onSelect(node)}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={typeInfo.color}>{typeInfo.icon}</span>
                        <span className="text-sm font-medium truncate flex-1">{node.label}</span>
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5" title={parentPath}>
                        所属: {parentPath}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                        <span>L{node.pathDepth}</span>
                        <span>|</span>
                        <span className={typeInfo.color}>{typeInfo.label}</span>
                        {hasChildren && <span>| {childCount} 子节点</span>}
                        {questionCount > 0 && <span className="text-amber-500">| ★ {questionCount} 题型</span>}
                      </div>
                      {node.pathDepth < 7 && (
                        <button
                          className="mt-1 text-xs text-blue-500 hover:text-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddChild(node.id);
                          }}
                        >
                          + 添加子节点
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// 5. 右侧内容面板及相关组件
// ============================================================

// 5.1 子节点管理面板
interface ChildNodeManagerProps {
  node: TextbookNode;
  onAddChild: (parentId: number) => void;
  onEditNode: (node: TextbookNode) => void;
  onDeleteNode: (node: TextbookNode) => void;
  onMoveUp: (node: TextbookNode) => void;
  onMoveDown: (node: TextbookNode) => void;
}

const ChildNodeManager: React.FC<ChildNodeManagerProps> = ({ node, onAddChild, onEditNode, onDeleteNode, onMoveUp, onMoveDown }) => {
  const children = node.children || [];
  const typeInfo = getNodeTypeInfo(node.pathType, node.pathDepth);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            {typeInfo.icon}
            {node.label}
            <span className="text-sm font-normal text-slate-400 ml-2">({children.length} 个子节点)</span>
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            层级: L{node.pathDepth} · 类型: {typeInfo.label} · Key: {node.key}
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-md hover:bg-slate-700 transition-colors"
          onClick={() => onAddChild(node.id)}
        >
          <Plus className="w-4 h-4" />
          添加子节点
        </button>
      </div>
      {children.length === 0 ? (
        <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
          <FolderOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm">暂无子节点</p>
          <p className="text-xs mt-1">点击右上角「添加子节点」创建</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium text-slate-600">名称</th>
                <th className="px-4 py-2.5 text-left font-medium text-slate-600">标识 Key</th>
                <th className="px-4 py-2.5 text-left font-medium text-slate-600">层级</th>
                <th className="px-4 py-2.5 text-left font-medium text-slate-600">类型</th>
                <th className="px-4 py-2.5 text-right font-medium text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {children.map((child, index) => {
                const childTypeInfo = getNodeTypeInfo(child.pathType, child.pathDepth);
                return (
                  <tr key={child.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className={childTypeInfo.color}>{childTypeInfo.icon}</span>
                        {child.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{child.key}</td>
                    <td className="px-4 py-2.5 text-slate-500">L{child.pathDepth}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${childTypeInfo.bgColor} ${childTypeInfo.color} font-medium`}>
                        {childTypeInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-slate-600"
                          onClick={() => onMoveUp(child)}
                          disabled={index === 0}
                          title="上移"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-slate-600"
                          onClick={() => onMoveDown(child)}
                          disabled={index === children.length - 1}
                          title="下移"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-blue-600"
                          onClick={() => onEditNode(child)}
                          title="编辑"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-red-600"
                          onClick={() => onDeleteNode(child)}
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// 5.2 关联对面节点管理器
interface RelatedNodeManagerProps {
  node: TextbookNode;
  chapterKnowledgeList: ChapterKnowledge[];
  allLevel7Nodes: TextbookNode[];
  onAddRelated: (nodeId: number, targetType: "chapter" | "knowledge") => void;
  onRemoveRelated: (ckId: number) => void;
}

const RelatedNodeManager: React.FC<RelatedNodeManagerProps> = ({ node, chapterKnowledgeList, allLevel7Nodes, onAddRelated, onRemoveRelated }) => {
  const relatedCK = chapterKnowledgeList.filter((ck) => ck.chapterId === node.id || ck.knowledgeId === node.id);
  const relatedIds = relatedCK.map((ck) => (node.pathType === "chapter" ? ck.knowledgeId : ck.chapterId)).filter((id) => id !== 0);
  const targetType = node.pathType === "chapter" ? "knowledge" : "chapter";
  const targetTypeLabel = node.pathType === "chapter" ? "考点" : "章节";
  const availableNodes = allLevel7Nodes.filter((n) => n.pathType === targetType && n.id !== node.id && !relatedIds.includes(n.id));

  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);

  const handleAdd = () => {
    if (selectedTargetId !== null) {
      onAddRelated(selectedTargetId, targetType);
      setSelectedTargetId(null);
      setShowSelectDialog(false);
    }
  };

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-slate-700">关联的{targetTypeLabel}</h4>
        <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1" onClick={() => setShowSelectDialog(true)}>
          <Plus className="w-3.5 h-3.5" /> 添加{targetTypeLabel}
        </button>
      </div>
      {relatedIds.length === 0 ? (
        <p className="text-xs text-slate-400">暂无关联的{targetTypeLabel}</p>
      ) : (
        <ul className="space-y-1">
          {relatedIds.map((id) => {
            const rn = allLevel7Nodes.find((n) => n.id === id);
            if (!rn) return null;
            const ck = relatedCK.find(
              (c) => (c.chapterId === node.id && c.knowledgeId === rn.id) || (c.knowledgeId === node.id && c.chapterId === rn.id),
            );
            return (
              <li key={rn.id} className="flex items-center justify-between bg-slate-50 px-3 py-1 rounded text-sm">
                <span>{rn.label}</span>
                <button className="text-red-400 hover:text-red-600" onClick={() => ck && onRemoveRelated(ck.id)}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {showSelectDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h4 className="text-md font-semibold mb-2">选择要关联的{targetTypeLabel}</h4>
            {availableNodes.length === 0 ? (
              <p className="text-sm text-slate-500">没有可用的{targetTypeLabel}</p>
            ) : (
              <div className="max-h-60 overflow-auto border rounded-md divide-y">
                {availableNodes.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-2 cursor-pointer hover:bg-slate-50 ${selectedTargetId === n.id ? "bg-blue-50" : ""}`}
                    onClick={() => setSelectedTargetId(n.id)}
                  >
                    <input type="radio" checked={selectedTargetId === n.id} onChange={() => setSelectedTargetId(n.id)} className="mr-2" />
                    <span>{n.label}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded" onClick={() => setShowSelectDialog(false)}>
                取消
              </button>
              <button
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={selectedTargetId === null}
                onClick={handleAdd}
              >
                确认关联
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 5.3 题型关联管理面板
interface QuestionCateManagerProps {
  node: TextbookNode;
  chapterKnowledgeList: ChapterKnowledge[];
  questionCates: QuestionCate[];
  allLevel7Nodes: TextbookNode[];
  onAssociate: (nodeId: number) => void;
  onDissociate: (ckId: number, qcId: number) => void;
  onCreateQuestion: (ckId: number) => void;
  onEditQuestion: (qc: QuestionCate) => void;
  onDeleteQuestion: (qc: QuestionCate) => void;
  onAddRelated: (nodeId: number, targetType: "chapter" | "knowledge") => void;
  onRemoveRelated: (ckId: number) => void;
}

const QuestionCateManager: React.FC<QuestionCateManagerProps> = ({
  node,
  chapterKnowledgeList,
  questionCates,
  allLevel7Nodes,
  onAssociate,
  onDissociate,
  onCreateQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onAddRelated,
  onRemoveRelated,
}) => {
  const relatedCK = chapterKnowledgeList.filter((ck) => ck.chapterId === node.id || ck.knowledgeId === node.id);
  const validCK = relatedCK.filter((ck) => ck.chapterId !== 0 && ck.knowledgeId !== 0);
  const relatedQC = questionCates.filter((qc) => relatedCK.some((ck) => ck.id === qc.relatedId));
  const typeInfo = getNodeTypeInfo(node.pathType, node.pathDepth);

  const handleAssociateClick = () => {
    if (validCK.length === 0) {
      alert("请先为当前节点关联一个对应的章节/考点，然后才能关联题型。");
      return;
    }
    onAssociate(node.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            {typeInfo.icon}
            {node.label}
            <span className="text-sm font-normal text-slate-400 ml-2">(第 {node.pathDepth} 层 · 细分题型关联)</span>
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            关联章节/知识点: {validCK.length} 条有效配对 · 关联细分题型: {relatedQC.length} 个
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 transition-colors"
            onClick={handleAssociateClick}
          >
            <Link2 className="w-4 h-4" />
            关联细分题型
          </button>
          {validCK.length > 0 && (
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700 transition-colors"
              onClick={() => onCreateQuestion(validCK[0].id)}
            >
              <Plus className="w-4 h-4" />
              新建细分题型
            </button>
          )}
        </div>
      </div>

      {relatedQC.length === 0 ? (
        <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
          <ListChecks className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm">暂无关联的细分题型</p>
          <p className="text-xs mt-1">请先建立与对面节点的配对，再关联细分题型</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium text-slate-600">细分题型</th>
                <th className="px-4 py-2.5 text-left font-medium text-slate-600">标识 Key</th>
                <th className="px-4 py-2.5 text-left font-medium text-slate-600">排序</th>
                <th className="px-4 py-2.5 text-left font-medium text-slate-600">关联 CK ID</th>
                <th className="px-4 py-2.5 text-right font-medium text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {relatedQC.map((qc) => {
                const ck = relatedCK.find((c) => c.id === qc.relatedId);
                return (
                  <tr key={qc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <ListChecks className="w-4 h-4 text-amber-500" />
                        {qc.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{qc.key}</td>
                    <td className="px-4 py-2.5 text-slate-500">{qc.sortOrder}</td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs">#{ck?.id || "—"}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-blue-600"
                          onClick={() => onEditQuestion(qc)}
                          title="编辑"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-red-600"
                          onClick={() => onDeleteQuestion(qc)}
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {ck && (
                          <button
                            className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-400 hover:text-rose-600"
                            onClick={() => onDissociate(ck.id, qc.id)}
                            title="取消关联"
                          >
                            <Unlink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <RelatedNodeManager
        node={node}
        chapterKnowledgeList={chapterKnowledgeList}
        allLevel7Nodes={allLevel7Nodes}
        onAddRelated={onAddRelated}
        onRemoveRelated={onRemoveRelated}
      />
    </div>
  );
};

// 5.4 内容面板
interface ContentPanelProps {
  selectedNode: TextbookNode | null;
  treeData: TextbookNode[];
  chapterKnowledgeList: ChapterKnowledge[];
  questionCates: QuestionCate[];
  allLevel7Nodes: TextbookNode[];
  onAddChild: (parentId: number) => void;
  onEditNode: (node: TextbookNode) => void;
  onDeleteNode: (node: TextbookNode) => void;
  onMoveUp: (node: TextbookNode) => void;
  onMoveDown: (node: TextbookNode) => void;
  onAssociate: (nodeId: number) => void;
  onDissociate: (ckId: number, qcId: number) => void;
  onCreateQuestion: (ckId: number) => void;
  onEditQuestion: (qc: QuestionCate) => void;
  onDeleteQuestion: (qc: QuestionCate) => void;
  onAddRelated: (nodeId: number, targetType: "chapter" | "knowledge") => void;
  onRemoveRelated: (ckId: number) => void;
}

const ContentPanel: React.FC<ContentPanelProps> = ({
  selectedNode,
  treeData,
  chapterKnowledgeList,
  questionCates,
  allLevel7Nodes,
  onAddChild,
  onEditNode,
  onDeleteNode,
  onMoveUp,
  onMoveDown,
  onAssociate,
  onDissociate,
  onCreateQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onAddRelated,
  onRemoveRelated,
}) => {
  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <FolderOpen className="w-16 h-16 text-slate-300 mb-4" />
        <p className="text-lg font-medium">请选择左侧节点</p>
        <p className="text-sm">点击树形结构中的节点查看和管理内容</p>
      </div>
    );
  }

  const path = getNodePath(treeData, selectedNode.id);
  const typeInfo = getNodeTypeInfo(selectedNode.pathType, selectedNode.pathDepth);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1.5 text-sm text-slate-500 pb-3 border-b mb-4 flex-wrap">
        {path.map((n, idx) => (
          <React.Fragment key={n.id}>
            <span className={idx === path.length - 1 ? "text-slate-800 font-medium" : ""}>{n.label}</span>
            {idx < path.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
          </React.Fragment>
        ))}
        <span className="ml-2 text-xs text-slate-400">
          (L{selectedNode.pathDepth} · {typeInfo.label})
        </span>
      </div>
      <div className="flex-1 overflow-auto">
        {isLevel7(selectedNode) ? (
          <QuestionCateManager
            node={selectedNode}
            chapterKnowledgeList={chapterKnowledgeList}
            questionCates={questionCates}
            allLevel7Nodes={allLevel7Nodes}
            onAssociate={onAssociate}
            onDissociate={onDissociate}
            onCreateQuestion={onCreateQuestion}
            onEditQuestion={onEditQuestion}
            onDeleteQuestion={onDeleteQuestion}
            onAddRelated={onAddRelated}
            onRemoveRelated={onRemoveRelated}
          />
        ) : (
          <ChildNodeManager
            node={selectedNode}
            onAddChild={onAddChild}
            onEditNode={onEditNode}
            onDeleteNode={onDeleteNode}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
          />
        )}
      </div>
    </div>
  );
};

// ============================================================
// 6. 对话框组件
// ============================================================

// 6.1 添加子节点对话框
interface AddChildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: number;
  parentLabel: string;
  onConfirm: (data: { label: string; key: string; pathType: string }) => void;
}

const AddChildDialog: React.FC<AddChildDialogProps> = ({ open, onOpenChange, parentId, parentLabel, onConfirm }) => {
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  const [pathType, setPathType] = useState<"common" | "knowledge" | "chapter">("knowledge");
  React.useEffect(() => {
    if (open) {
      setLabel("");
      setKey("");
      setPathType("knowledge");
    }
  }, [open]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !key.trim()) return;
    onConfirm({ label, key, pathType });
    onOpenChange(false);
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" style={{ display: open ? "flex" : "none" }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold">添加子节点</h3>
        <p className="text-sm text-slate-500 mb-4">在「{parentLabel}」下创建新节点</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">名称 *</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Key *</label>
            <input type="text" value={key} onChange={(e) => setKey(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">类型</label>
            <select value={pathType} onChange={(e) => setPathType(e.target.value as any)} className="w-full border rounded px-3 py-2">
              <option value="knowledge">考点</option>
              <option value="chapter">章节</option>
              <option value="common">公共</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm">
              取消
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-slate-800 text-white rounded">
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 6.2 编辑节点对话框
interface EditNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: TextbookNode | null;
  onConfirm: (data: { label: string; key: string }) => void;
}

const EditNodeDialog: React.FC<EditNodeDialogProps> = ({ open, onOpenChange, node, onConfirm }) => {
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  React.useEffect(() => {
    if (node && open) {
      setLabel(node.label);
      setKey(node.key);
    }
  }, [node, open]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !key.trim()) return;
    onConfirm({ label, key });
    onOpenChange(false);
  };
  if (!node) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" style={{ display: open ? "flex" : "none" }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold">编辑节点</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">名称 *</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Key *</label>
            <input type="text" value={key} onChange={(e) => setKey(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm">
              取消
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-slate-800 text-white rounded">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 6.3 删除确认对话框
interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: TextbookNode | null;
  onConfirm: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ open, onOpenChange, node, onConfirm }) => {
  if (!node) return null;
  const count = node.children ? getDescendantIds(node).length - 1 : 0;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" style={{ display: open ? "flex" : "none" }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-500" />
          确认删除
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          确定要删除「{node.label}」吗？{count > 0 && <span className="block text-amber-700">包含 {count} 个子节点，将一并删除。</span>}
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm">
            取消
          </button>
          <button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
};

// 6.4 关联细分题型对话框
interface AssociateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: number;
  nodeLabel: string;
  availableQuestions: QuestionCate[];
  existingQCIds: number[];
  onConfirm: (qcId: number) => void;
}

const AssociateDialog: React.FC<AssociateDialogProps> = ({ open, onOpenChange, nodeId, nodeLabel, availableQuestions, existingQCIds, onConfirm }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = availableQuestions.filter(
    (qc) => !existingQCIds.includes(qc.id) && (qc.label.includes(searchTerm) || qc.key.includes(searchTerm)),
  );
  React.useEffect(() => {
    if (open) {
      setSelectedId(null);
      setSearchTerm("");
    }
  }, [open]);
  const handleConfirm = () => {
    if (selectedId !== null) {
      onConfirm(selectedId);
      onOpenChange(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" style={{ display: open ? "flex" : "none" }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold">关联细分题型</h3>
        <p className="text-sm text-slate-500 mb-4">为「{nodeLabel}」关联已有细分题型</p>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索细分题型..."
              className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div className="max-h-60 overflow-auto border rounded-md divide-y">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">{searchTerm ? "未找到匹配的细分题型" : "暂无可用细分题型，请先创建"}</div>
            ) : (
              filtered.map((qc) => (
                <div
                  key={qc.id}
                  className={`px-4 py-2.5 cursor-pointer hover:bg-slate-50 flex items-center gap-3 ${selectedId === qc.id ? "bg-blue-50" : ""}`}
                  onClick={() => setSelectedId(qc.id)}
                >
                  <input type="radio" checked={selectedId === qc.id} onChange={() => setSelectedId(qc.id)} className="w-4 h-4" />
                  <div className="flex-1">
                    <span className="font-medium text-sm">{qc.label}</span>
                    <span className="text-xs text-slate-400 ml-2">{qc.key}</span>
                  </div>
                  <span className="text-xs text-slate-400">排序: {qc.sortOrder}</span>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm">
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedId === null}
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded disabled:opacity-50"
            >
              确认关联
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 6.5 新建细分题型对话框
interface CreateQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ckId: number;
  onConfirm: (data: { label: string; key: string; sortOrder: number }) => void;
}

const CreateQuestionDialog: React.FC<CreateQuestionDialogProps> = ({ open, onOpenChange, ckId, onConfirm }) => {
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  React.useEffect(() => {
    if (open) {
      setLabel("");
      setKey("");
      setSortOrder(1);
    }
  }, [open]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !key.trim()) return;
    onConfirm({ label, key, sortOrder });
    onOpenChange(false);
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" style={{ display: open ? "flex" : "none" }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold">新建细分题型</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">名称 *</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="例如: 已知字母的值求代数式的值"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Key *</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="substitute-value"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">排序</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
              min={1}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm">
              取消
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-amber-600 text-white rounded">
              创建并关联
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 6.6 编辑细分题型对话框
interface EditQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: QuestionCate | null;
  onConfirm: (data: { label: string; key: string; sortOrder: number }) => void;
}

const EditQuestionDialog: React.FC<EditQuestionDialogProps> = ({ open, onOpenChange, question, onConfirm }) => {
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  React.useEffect(() => {
    if (question && open) {
      setLabel(question.label);
      setKey(question.key);
      setSortOrder(question.sortOrder);
    }
  }, [question, open]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !key.trim()) return;
    onConfirm({ label, key, sortOrder });
    onOpenChange(false);
  };
  if (!question) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" style={{ display: open ? "flex" : "none" }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold">编辑细分题型</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">名称 *</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Key *</label>
            <input type="text" value={key} onChange={(e) => setKey(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">排序</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
              min={1}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm">
              取消
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-slate-800 text-white rounded">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// 7. 主应用 App
// ============================================================

const App: React.FC = () => {
  const [treeData, setTreeData] = useState<TextbookNode[]>(() => buildTree(mockTextbookData));
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [chapterKnowledge, setChapterKnowledge] = useState<ChapterKnowledge[]>(mockChapterKnowledge);
  const [questionCates, setQuestionCates] = useState<QuestionCate[]>(mockQuestionCates);

  // 对话框状态
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [addChildParentId, setAddChildParentId] = useState<number>(0);
  const [editNodeOpen, setEditNodeOpen] = useState(false);
  const [editNodeTarget, setEditNodeTarget] = useState<TextbookNode | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TextbookNode | null>(null);
  const [associateOpen, setAssociateOpen] = useState(false);
  const [associateNodeId, setAssociateNodeId] = useState<number>(0);
  const [createQuestionOpen, setCreateQuestionOpen] = useState(false);
  const [createQuestionCkId, setCreateQuestionCkId] = useState<number>(0);
  const [editQuestionOpen, setEditQuestionOpen] = useState(false);
  const [editQuestionTarget, setEditQuestionTarget] = useState<QuestionCate | null>(null);

  const [nextId, setNextId] = useState(100);
  const [nextCkId, setNextCkId] = useState(100);
  const [nextQcId, setNextQcId] = useState(100);

  const flatNodes = useMemo(() => getFlatNodes(treeData), [treeData]);
  const findNode = (id: number): TextbookNode | null => flatNodes.find((n) => n.id === id) || null;

  const updateTree = (fn: (nodes: TextbookNode[]) => TextbookNode[]) => setTreeData(fn);
  const updateNodeInTree = (nodes: TextbookNode[], id: number, updater: (node: TextbookNode) => TextbookNode): TextbookNode[] =>
    nodes.map((node) => {
      if (node.id === id) return updater(node);
      if (node.children) return { ...node, children: updateNodeInTree(node.children, id, updater) };
      return node;
    });
  const deleteNodeFromTree = (nodes: TextbookNode[], id: number): TextbookNode[] =>
    nodes.filter((node) => node.id !== id).map((node) => ({ ...node, children: node.children ? deleteNodeFromTree(node.children, id) : [] }));

  const getQuestionCount = useCallback(
    (nodeId: number) => {
      const relatedCK = chapterKnowledge.filter((ck) => ck.chapterId === nodeId || ck.knowledgeId === nodeId);
      const qcIds = new Set<number>();
      relatedCK.forEach((ck) =>
        questionCates.forEach((qc) => {
          if (qc.relatedId === ck.id) qcIds.add(qc.id);
        }),
      );
      return qcIds.size;
    },
    [chapterKnowledge, questionCates],
  );

  const allLevel7Nodes = useMemo(() => flatNodes.filter((n) => n.pathDepth === 7), [flatNodes]);

  // 操作函数
  const handleSelectNode = (node: TextbookNode) => setSelectedId(node.id);

  const handleAddChild = (parentId: number) => {
    setAddChildParentId(parentId);
    setAddChildOpen(true);
  };

  const handleAddChildConfirm = (data: { label: string; key: string; pathType: string }) => {
    const parent = findNode(addChildParentId);
    if (!parent) return;
    const newId = nextId;
    setNextId((prev) => prev + 1);
    const newNode: TextbookNode = {
      id: newId,
      parentId: addChildParentId,
      label: data.label,
      key: data.key,
      pathType: data.pathType as "common" | "knowledge" | "chapter",
      pathDepth: parent.pathDepth + 1,
      sortOrder: (parent.children?.length || 0) + 1,
      createdAt: new Date().toISOString(),
      children: [],
    };
    updateTree((nodes) =>
      updateNodeInTree(nodes, addChildParentId, (node) => ({
        ...node,
        children: [...(node.children || []), newNode],
      })),
    );
    setSelectedId(newId);
  };

  const handleEditNode = (node: TextbookNode) => {
    setEditNodeTarget(node);
    setEditNodeOpen(true);
  };

  const handleEditNodeConfirm = (data: { label: string; key: string }) => {
    if (!editNodeTarget) return;
    updateTree((nodes) =>
      updateNodeInTree(nodes, editNodeTarget.id, (node) => ({
        ...node,
        label: data.label,
        key: data.key,
      })),
    );
    setEditNodeTarget(null);
  };

  const handleDeleteNode = (node: TextbookNode) => {
    setDeleteTarget(node);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const idsToDelete = getDescendantIds(deleteTarget);
    updateTree((nodes) => deleteNodeFromTree(nodes, deleteTarget.id));
    setChapterKnowledge((prev) => prev.filter((ck) => !idsToDelete.includes(ck.chapterId) && !idsToDelete.includes(ck.knowledgeId)));
    setQuestionCates((prev) =>
      prev.filter((qc) => {
        const ck = chapterKnowledge.find((c) => c.id === qc.relatedId);
        return ck && !idsToDelete.includes(ck.chapterId) && !idsToDelete.includes(ck.knowledgeId);
      }),
    );
    setDeleteTarget(null);
    if (selectedId && idsToDelete.includes(selectedId)) {
      setSelectedId(1);
    }
  };

  const handleMoveUp = (node: TextbookNode) => {
    const parent = findNode(node.parentId!);
    if (!parent || !parent.children) return;
    const index = parent.children.findIndex((c) => c.id === node.id);
    if (index <= 0) return;
    const newChildren = [...parent.children];
    [newChildren[index - 1], newChildren[index]] = [newChildren[index], newChildren[index - 1]];
    newChildren.forEach((c, i) => (c.sortOrder = i + 1));
    updateTree((nodes) =>
      updateNodeInTree(nodes, parent.id, (p) => ({
        ...p,
        children: newChildren,
      })),
    );
  };

  const handleMoveDown = (node: TextbookNode) => {
    const parent = findNode(node.parentId!);
    if (!parent || !parent.children) return;
    const index = parent.children.findIndex((c) => c.id === node.id);
    if (index === -1 || index >= parent.children.length - 1) return;
    const newChildren = [...parent.children];
    [newChildren[index + 1], newChildren[index]] = [newChildren[index], newChildren[index + 1]];
    newChildren.forEach((c, i) => (c.sortOrder = i + 1));
    updateTree((nodes) =>
      updateNodeInTree(nodes, parent.id, (p) => ({
        ...p,
        children: newChildren,
      })),
    );
  };

  const handleAddRelated = (nodeId: number, targetType: "chapter" | "knowledge") => {
    const current = findNode(selectedId!);
    if (!current) return;
    const target = findNode(nodeId);
    if (!target) return;
    const exists = chapterKnowledge.some(
      (ck) => (ck.chapterId === current.id && ck.knowledgeId === target.id) || (ck.knowledgeId === current.id && ck.chapterId === target.id),
    );
    if (exists) return;
    const newCk: ChapterKnowledge = {
      id: nextCkId,
      chapterId: current.pathType === "chapter" ? current.id : target.id,
      knowledgeId: current.pathType === "knowledge" ? current.id : target.id,
      createdAt: new Date().toISOString(),
    };
    setNextCkId((prev) => prev + 1);
    setChapterKnowledge((prev) => [...prev, newCk]);
  };

  const handleRemoveRelated = (ckId: number) => {
    setChapterKnowledge((prev) => prev.filter((ck) => ck.id !== ckId));
    setQuestionCates((prev) => prev.map((qc) => (qc.relatedId === ckId ? { ...qc, relatedId: 0 } : qc)));
  };

  const handleAssociate = (nodeId: number) => {
    const node = findNode(nodeId);
    if (!node) return;
    const validCK = chapterKnowledge.filter(
      (ck) => (ck.chapterId === node.id || ck.knowledgeId === node.id) && ck.chapterId !== 0 && ck.knowledgeId !== 0,
    );
    if (validCK.length === 0) {
      alert("请先建立有效的章节-考点配对！");
      return;
    }
    setAssociateNodeId(nodeId);
    setAssociateOpen(true);
  };

  const handleAssociateConfirm = (qcId: number) => {
    const node = findNode(associateNodeId);
    if (!node) return;
    const validCK = chapterKnowledge.filter(
      (ck) => (ck.chapterId === node.id || ck.knowledgeId === node.id) && ck.chapterId !== 0 && ck.knowledgeId !== 0,
    );
    if (validCK.length === 0) return;
    const ck = validCK[0];
    const qc = questionCates.find((q) => q.id === qcId);
    if (!qc) return;
    const already = questionCates.some((q) => q.id === qcId && q.relatedId === ck.id);
    if (already) return;
    setQuestionCates((prev) => prev.map((q) => (q.id === qcId ? { ...q, relatedId: ck.id } : q)));
  };

  const handleDissociate = (ckId: number, qcId: number) => {
    setQuestionCates((prev) => prev.map((q) => (q.id === qcId ? { ...q, relatedId: 0 } : q)));
  };

  const handleCreateQuestion = (ckId: number) => {
    setCreateQuestionCkId(ckId);
    setCreateQuestionOpen(true);
  };

  const handleCreateQuestionConfirm = (data: { label: string; key: string; sortOrder: number }) => {
    const newQc: QuestionCate = {
      id: nextQcId,
      relatedId: createQuestionCkId,
      label: data.label,
      key: data.key,
      sortOrder: data.sortOrder,
      createdAt: new Date().toISOString(),
    };
    setNextQcId((prev) => prev + 1);
    setQuestionCates((prev) => [...prev, newQc]);
  };

  const handleEditQuestion = (qc: QuestionCate) => {
    setEditQuestionTarget(qc);
    setEditQuestionOpen(true);
  };

  const handleEditQuestionConfirm = (data: { label: string; key: string; sortOrder: number }) => {
    if (!editQuestionTarget) return;
    setQuestionCates((prev) =>
      prev.map((q) => (q.id === editQuestionTarget.id ? { ...q, label: data.label, key: data.key, sortOrder: data.sortOrder } : q)),
    );
    setEditQuestionTarget(null);
  };

  const handleDeleteQuestion = (qc: QuestionCate) => {
    setQuestionCates((prev) => prev.filter((q) => q.id !== qc.id));
  };

  const selectedNode = useMemo(() => findNode(selectedId || 0), [selectedId, treeData]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-slate-700" />
          <h1 className="text-xl font-bold text-slate-800">教材知识体系管理</h1>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">v1.0</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
            {treeData.length} 个根节点
          </span>
          <span className="w-px h-4 bg-slate-200"></span>
          <span className="flex items-center gap-1">
            <Hash className="w-3.5 h-3.5" />
            {chapterKnowledge.length} 条关联
          </span>
          <span className="w-px h-4 bg-slate-200"></span>
          <span className="flex items-center gap-1">
            <ListChecks className="w-3.5 h-3.5" />
            {questionCates.length} 个细分题型
          </span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-320 min-w-[280px] bg-white border-r border-slate-200 overflow-auto">
          <OverviewPanel
            allNodes={flatNodes}
            selectedId={selectedId}
            onSelect={handleSelectNode}
            onAddChild={handleAddChild}
            getQuestionCount={getQuestionCount}
          />
        </div>
        <div className="flex-1 overflow-auto p-6">
          <ContentPanel
            selectedNode={selectedNode}
            treeData={treeData}
            chapterKnowledgeList={chapterKnowledge}
            questionCates={questionCates}
            allLevel7Nodes={allLevel7Nodes}
            onAddChild={handleAddChild}
            onEditNode={handleEditNode}
            onDeleteNode={handleDeleteNode}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onAssociate={handleAssociate}
            onDissociate={handleDissociate}
            onCreateQuestion={handleCreateQuestion}
            onEditQuestion={handleEditQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onAddRelated={handleAddRelated}
            onRemoveRelated={handleRemoveRelated}
          />
        </div>
      </div>

      {/* 对话框 */}
      <AddChildDialog
        open={addChildOpen}
        onOpenChange={setAddChildOpen}
        parentId={addChildParentId}
        parentLabel={findNode(addChildParentId)?.label || ""}
        onConfirm={handleAddChildConfirm}
      />
      <EditNodeDialog open={editNodeOpen} onOpenChange={setEditNodeOpen} node={editNodeTarget} onConfirm={handleEditNodeConfirm} />
      <DeleteConfirmDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen} node={deleteTarget} onConfirm={handleDeleteConfirm} />
      <AssociateDialog
        open={associateOpen}
        onOpenChange={setAssociateOpen}
        nodeId={associateNodeId}
        nodeLabel={findNode(associateNodeId)?.label || ""}
        availableQuestions={questionCates}
        existingQCIds={questionCates
          .filter((qc) => {
            const ck = chapterKnowledge.find((c) => c.id === qc.relatedId);
            return ck && (ck.chapterId === associateNodeId || ck.knowledgeId === associateNodeId);
          })
          .map((qc) => qc.id)}
        onConfirm={handleAssociateConfirm}
      />
      <CreateQuestionDialog
        open={createQuestionOpen}
        onOpenChange={setCreateQuestionOpen}
        ckId={createQuestionCkId}
        onConfirm={handleCreateQuestionConfirm}
      />
      <EditQuestionDialog
        open={editQuestionOpen}
        onOpenChange={setEditQuestionOpen}
        question={editQuestionTarget}
        onConfirm={handleEditQuestionConfirm}
      />
    </div>
  );
};

export default App;
