import Markdown from "react-markdown";
import { table } from "~/common/table";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { allowSchema } from "~/util/schema";
import { StringValidator } from "~/util/string";

/// 预览试卷

export function Preview(props: any) {
  const examContent = props.examContent ?? "";

  return (
    <div>
      {StringValidator.isNonEmpty(examContent) && (
        <Markdown
          remarkPlugins={[remarkMath, remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw, rehypeKatex, [rehypeSanitize, allowSchema]]}
          components={table}
        >
          {examContent}
        </Markdown>
      )}
    </div>
  );
}
