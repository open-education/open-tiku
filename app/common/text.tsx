import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";
import type { TextbookOtherDict } from "~/type/textbook";
import { httpClient } from "~/util/http";
import type { CreateQuestionReq, QuestionSnippetReq } from "~/type/question";

// 解析题目
interface ParseQuestionProps {
  typeList: TextbookOtherDict[];
  tagList: TextbookOtherDict[];
  onSuccess?: (val: CreateQuestionReq) => void; // 解析成功后回调, 回调的值为解析完成后的题目请求结构
}
function ParseQuestion({ typeList = [], tagList = [], onSuccess }: ParseQuestionProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleParse = () => {
    if (!input.trim()) {
      setResult({ success: false, message: "请先粘贴 Markdown 内容" });
      return;
    }

    setResult(null);
    setIsLoading(true);

    const req: QuestionSnippetReq = {
      typeList,
      tagList,
      content: input,
    };

    // 尝试解析文本
    httpClient
      .post<CreateQuestionReq>("/text/question/snippet", req)
      .then((addReq) => {
        if (addReq.title.trim.length > 0) {
          setResult({ success: true, message: "解析" });
          onSuccess?.(addReq); // 如果有回调函数则回调
        } else {
          setResult({ success: false, message: "解析完成, 但是题干都为空, 请确认粘贴的内容符合规范" });
        }
      })
      .catch((err) => setResult({ success: false, message: err.message }))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="w-full space-y-5 p-4 border bg-muted/30">
      {/* 头部 */}
      <div className="space-y-1">
        <p className="text-muted-foreground leading-relaxed">
          将符合模板要求的 Markdown 源格式题目粘贴至下方，点击解析后看题目自动填充是否符合预期。
        </p>
      </div>

      {/* 输入区 */}
      <div className="space-y-3">
        <Textarea
          placeholder="在此粘贴 Markdown 内容..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          className="resize-y min-h-60 bg-background shadow-sm transition-shadow focus-visible:ring-2 focus-visible:ring-primary/50"
          disabled={isLoading}
        />
      </div>

      {/* 按钮 */}
      <Button onClick={handleParse} disabled={isLoading || !input.trim()} variant={"outline"}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            解析中...
          </>
        ) : (
          <>
            <span>🔍 解析</span>
          </>
        )}
      </Button>

      {/* 结果反馈 */}
      {result && (
        <Alert
          variant={result.success ? "default" : "destructive"}
          className={cn(
            "border-l-4",
            result.success
              ? "border-l-green-500 bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-400"
              : "border-l-red-500 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400",
          )}
        >
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            )}
            <AlertDescription className="text-sm font-medium">{result.message}</AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
}

export { ParseQuestion };
