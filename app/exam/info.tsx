import Markdown from "react-markdown";
import { table } from "~/common/table";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { allowSchema } from "~/util/schema";

// 试卷详情
export function Info(props: any) {
  return (
    <div>
      <Markdown
        remarkPlugins={[remarkMath, remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw, rehypeKatex, [rehypeSanitize, allowSchema]]}
        components={table}
      >
        试卷内容
      </Markdown>
    </div>
  );
}
