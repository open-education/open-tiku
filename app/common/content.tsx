import { StringValidator } from '~/util/string';
import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import { table } from '~/common/table';

/// 简单的 markdown 内容

interface SimpleFullContentProps {
  content: string;
}

// 完整: 尽可能解析所有的内容
function SimpleFullContent(props: SimpleFullContentProps) {
  const { content } = props;

  return (
    <>
      {StringValidator.isNonEmpty(content) && (
        <Markdown
          remarkPlugins={[remarkMath, remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw, [rehypeKatex, { output: 'html' }]]}
          components={table}
        >
          {content}
        </Markdown>
      )}
    </>
  );
}

export { SimpleFullContent };
