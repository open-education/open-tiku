import { defaultSchema } from "rehype-sanitize";

// markdown 中允许解析的 html 标签配置
export const allowSchema = {
  ...defaultSchema,
  tagNames: [
    "br",
    "p",
    "u",
    "em",
    "strong",
    "code",
    "span",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "caption",
    "colgroup",
    "col",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    // 添加列表相关标签
    "ul", // 无序列表
    "ol", // 有序列表
    "li", // 列表项

    // 如果需要嵌套列表，可能还需要
    "dl", // 定义列表
    "dt", // 定义术语
    "dd", // 定义描述
    // 仅允许上面这些 html 标签, 包括表格
    "annotation",
    "math",
    "menclose",
    "mfrac",
    "mglyph",
    "mi",
    "mlongdiv",
    "mmultiscripts",
    "mn",
    "mo",
    "mover",
    "mpadded",
    "mphantom",
    "mroot",
    "mrow",
    "ms",
    "mscarries",
    "mscarry",
    "msgroup",
    "msline",
    "mspace",
    "msqrt",
    "msrow",
    "mstack",
    "mstyle",
    "msub",
    "msubsup",
    "msup",
    "mtable",
    "mtd",
    "mtext",
    "mtr",
    "munder",
    "munderover",
    "semantics",
    // 允许上面这些 MathML 标签
  ],
  attributes: {
    ...defaultSchema.attributes,
    "*": ["className", "style"], // 允许公式使用的样式类
    table: ["class", "style", "border", "cellpadding", "cellspacing"],
    th: ["class", "style", "align", "colspan", "rowspan"],
    td: ["class", "style", "align", "colspan", "rowspan"],
    tr: ["class", "style"],
    thead: ["class", "style"],
    tbody: ["class", "style"],
    // 列表可以添加的样式或属性
    ul: ["class", "style", "type"],
    ol: ["class", "style", "type", "start"],
    li: ["class", "style"],
  },
};
