/// 统计相关

// 总数统计
function CountStats() {
  return (
    <section className="mx-auto">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs tracking-[0.16em] font-medium uppercase mb-3">K–12 数学题库平台</p>
          <h1 className="text-[2.4rem] md:text-[2.7rem] leading-[1.22] font-medium mb-3">
            精准定位教材，
            <br />
            高效组题练习
          </h1>
          <p className="text-muted-foreground leading-relaxed text-[15px] max-w-md">
            8级层级覆盖小初高全部主流教材版本。选定教材，一步进入练题或上传。
          </p>
        </div>

        {/* Stats — desktop */}
        <div className="hidden md:flex flex-col items-end gap-4 shrink-0 pb-1">
          {[
            { v: "86,420+", l: "题目总数" },
            { v: "1,240", l: "覆盖学校" },
            { v: "38万+", l: "活跃学生" },
          ].map((s) => (
            <div key={s.l} className="text-right">
              <div className="text-[1.65rem] font-semibold leading-none">{s.v}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { CountStats };
