import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Wrench, X } from "lucide-react";
import { cn } from "~/lib/utils";
import React from "react";

/// 工具组件展示容器, 本身不展示任何内容

export interface ToolItem {
  /** 工具唯一标识 */
  id: string;
  /** 工具名称（显示在顶部导航） */
  label: React.ReactNode;
  /** 工具内容（React 节点） */
  content: React.ReactNode;
}

export interface FloatingToolsProps {
  // 配置需要展示的组件列表
  tools: ToolItem[];
  /** 默认激活的工具 ID，默认第一个 */
  defaultToolId?: string;
  /** 自定义面板样式 */
  panelClassName?: string;
  /** 面板宽度 */
  panelWidth?: string;
}

/**
 * 快捷工具配置入口
 *
 * 使用方式类似如下
 *
 * <div>
 *   <QuickToolList
 *      tools={[
 *         {
 *            id: "tool-file-upload",
 *             label: (
 *              <div className="flex items-center gap-2">
 *                <FileImage className="h-4 w-4 text-primary" />
 *                <span className="font-medium text-sm">上传文件</span>
 *              </div>
 *            ),
 *            content: <FileUpload isImage={false} />,
 *          },
 *      ]}
 *      defaultToolId="tool-file-upload"
 *   />
 * </div>
 * @returns
 */
export function QuickToolList({ tools = [], defaultToolId, panelClassName, panelWidth = "w-100" }: FloatingToolsProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeToolId, setActiveToolId] = React.useState(defaultToolId ?? tools[0]?.id ?? "");

  const toggleOpen = () => setIsOpen((prev) => !prev);

  // 没有任何工具则不展示
  if (tools.length === 0) return null;

  return (
    <div className="fixed top-20 right-5 z-50">
      <Button variant={"secondary"} onClick={toggleOpen} aria-label={isOpen ? "关闭快捷工具" : "打开快捷工具"}>
        {isOpen ? (
          <>
            <X className="h-5 w-5" />
            <span>收起工具</span>
          </>
        ) : (
          <>
            <Wrench className="h-5 w-5" />
            <span>快捷工具</span>
          </>
        )}
      </Button>

      {/* ====== 展开面板（无变化） ====== */}
      {isOpen && (
        <Card
          className={cn(
            "absolute top-10 right-4 max-h-[80vh] overflow-hidden shadow-xl",
            "transition-all duration-300 ease-in-out",
            "animate-in slide-in-from-top-2 fade-in",
            panelWidth,
            panelClassName,
          )}
        >
          <Tabs value={activeToolId} onValueChange={setActiveToolId}>
            <TabsList className="w-full" variant="line">
              {tools.map((tool) => (
                <TabsTrigger key={tool.id} value={tool.id}>
                  {tool.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tools.map((tool) => (
              <TabsContent key={tool.id} value={tool.id} className="m-0 p-4 overflow-y-auto">
                {tool.content}
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      )}
    </div>
  );
}
