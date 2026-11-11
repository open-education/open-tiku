const milestones = [
  { year: '第1年', title: '基础平台与资源生态', desc: '初中数学代数式模块 + 基础组卷 + 贡献机制', active: true },
  { year: '第2年', title: '教学闭环与数据沉淀', desc: '布置-作答-批改-分析全闭环 + 学情报告' },
  { year: '第3年', title: '个性化与智能化突破', desc: 'AI推荐 + 辅助评阅 + 错题溯源' },
  { year: '3-5年', title: '开放生态多学科融合', desc: 'API开放 + 多学科 + 区域应用' },
];

export default function Raodmap() {
  return (
    <div className="bg-white py-20">
      <div className="mx-auto max-w-300 px-10">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-[28px] font-bold text-gray-900">发展里程碑</h2>
          <p className="text-sm text-gray-500">分阶段建设，稳步迈向智能开放教育生态</p>
        </div>
        <div className="relative py-10">
          {/* 时间线 */}
          <div className="absolute top-17 left-[8%] right-[8%] h-0.75 bg-gray-200" />
          <div className="grid grid-cols-4 gap-5">
            {milestones.map((m, i) => (
              <div key={i} className="relative text-center">
                <div
                  className={`relative z-1 mx-auto mb-4 size-5.5 rounded-full border-[3px] border-white ${
                    m.active ? 'bg-blue-500 ring-[3px] ring-blue-50' : 'bg-gray-300'
                  }`}
                />
                <div className={`mb-1.5 text-xs font-semibold ${m.active ? 'text-blue-500' : 'text-gray-500'}`}>{m.year}</div>
                <div className="mb-2 text-[15px] font-semibold text-gray-900">{m.title}</div>
                <div className="text-xs leading-relaxed text-gray-500">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
