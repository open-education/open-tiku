// 表格组件样式
export const table = {
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead className="bg-card" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: any) => (
    <tbody className="bg-card" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: any) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors duration-200" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, align, ...props }: any) => {
    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
    return (
      <th
        className={`${alignClass} px-4 py-3 border-b border-gray-200 dark:border-zinc-800 bg-card text-sm font-semibold text-gray-700 dark:text-zinc-300`}
        {...props}
      >
        {children}
      </th>
    );
  },
  td: ({ children, align, ...props }: any) => {
    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
    return (
      <td className={`${alignClass} px-4 py-3 border-b border-gray-200 dark:border-zinc-800 text-sm text-gray-600 dark:text-zinc-400`} {...props}>
        {children}
      </td>
    );
  },
};
