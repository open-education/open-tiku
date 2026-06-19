function Teacher() {
  return (
    <section className="bg-primary">
      <div className="mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-primary-foreground text-xl font-medium mb-1" style={{ fontFamily: '"Noto Serif SC", serif' }}>
            教师专区
          </p>
          <p className="text-primary-foreground/70 text-sm">上传自制题目，管理班级学情，一站式教学辅助工具</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button className="text-sm border border-primary-foreground/30 text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary-foreground/10 transition-colors">
            了解更多
          </button>
          <button className="text-sm bg-primary-foreground text-primary px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
            申请教师账号
          </button>
        </div>
      </div>
    </section>
  );
}

export { Teacher };
