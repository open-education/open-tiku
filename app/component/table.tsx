// 表格组件样式
export const table = {
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-gray-200 rounded-lg overflow-hidden shadow-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead className="bg-gray-50" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: any) => (
    <tbody className="bg-white" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: any) => (
    <tr className="hover:bg-gray-50 transition-colors duration-200" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, align, ...props }: any) => {
    const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
    return (
      <th className={`${alignClass} px-4 py-3 border-b border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700`} {...props}>
        {children}
      </th>
    );
  },
  td: ({ children, align, ...props }: any) => {
    const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
    return (
      <td className={`${alignClass} px-4 py-3 border-b border-gray-200 text-sm text-gray-600`} {...props}>
        {children}
      </td>
    );
  },
};
