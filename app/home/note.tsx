import { BarChart2, BookOpen, GraduationCap } from "lucide-react";

/// 网站一些描述信息

function Note() {
  const FEATURES = [
    {
      icon: BookOpen,
      title: "精准教材定位",
      desc: "8级层级体系精确到知识点，覆盖小初高全部主流教材版本，秒速锁定目标章节。",
    },
    {
      icon: GraduationCap,
      title: "知识图谱练题",
      desc: "学生按知识图谱灵活选题，章节练习与专题测试无缝切换，自动记录薄弱点。",
    },
    {
      icon: BarChart2,
      title: "学情实时分析",
      desc: "教师端实时查看班级答题数据，精准定位学生知识薄弱点，优化教学策略。",
    },
  ];

  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto px-6 py-14 grid md:grid-cols-3 gap-10 md:gap-8">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex gap-4">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Icon size={16} className="text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm mb-2">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export { Note };
