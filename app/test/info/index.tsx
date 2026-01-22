import { CommonTitle } from "~/common/title";
import { CommonSelect } from "~/common/select";
import "katex/dist/katex.min.css";

// 试卷详情
export default function Index(props: any) {
  // 模拟一套试卷
  const testList = {
    title: "2024年贵州省威宁县第八中学第一单元测试卷-简单",
    list: [
      {
        id: 1,
        title: "一、选择题（以下每小题中均有 ABCD 四个选项，其中只有一个是正确的，请选择出最符合题意的选项）。",
        list: [
          {
            id: 1,
            title: "下列各数中，互为相反数的是（    ）",
            comment: "",
            images: [],
            optionsLayout: 1,
            options: [
              { label: "A", content: "$+(-2)$ 与 $-2$", images: [], order: 1 },
              { label: "B", content: "$-(-2)$ 与 $+2$", images: [], order: 2 },
              {
                label: "C",
                content: "$-(+2)$ 与 $+(-2)$",
                images: [],
                order: 3,
              },
              {
                label: "D",
                content: "$-(-2)$ 与 $-(+2)$",
                images: [],
                order: 4,
              },
            ],
            order: 1,
          },
          {
            id: 2,
            title: "2026年我国计划在某航天项目中投入资金约 1260000000 元，将数 1260000000 用科学记数法表示为（    ）",
            comment: "这部分内容可能超出了教材范围, 如果涉及不清楚的直接提问即可",
            images: [],
            optionsLayout: 1,
            options: [
              {
                label: "A",
                content: "$1.26 \\times 10^8$",
                images: [],
                order: 1,
              },
              {
                label: "B",
                content: "$1.26 \\times 10^9$",
                images: [],
                order: 2,
              },
              {
                label: "C",
                content: "$12.6 \\times 10^8$",
                images: [],
                order: 3,
              },
              {
                label: "D",
                content: "$0.126 \\times 10^{10}$",
                images: [],
                order: 4,
              },
            ],
            order: 2,
          },
          {
            id: 3,
            title: "已知代数式 $x + 2y$ 的值是 $3$，则代数式 $2x + 4y + 1$ 的值是（    ）",
            comment: "",
            images: [],
            optionsLayout: 1,
            options: [
              { label: "A", content: "$4$", images: [], order: 1 },
              { label: "B", content: "$5$", images: [], order: 2 },
              { label: "C", content: "$7$", images: [], order: 3 },
              { label: "D", content: "$9$", images: [], order: 4 },
            ],
            order: 3,
          },
          {
            id: 4,
            title: `已知关于 $x$ 的一元一次方程 $\\frac{x-k}{2} + \\frac{2x-k}{3} = 1$ 的解 $x$ 满足 $2 < x < 6$。若关于 $y$ 的方程 $|y - k| = 2$ 恰好有两个整数解，则满足条件的整数 $k$ 的个数为（    ）`,
            images: [],
            optionsLayout: 3,
            options: [
              { label: "A", content: "", images: ["cf95116567"], order: 1 },
              { label: "B", content: "", images: ["dbe77fa5c2"], order: 2 },
              { label: "C", content: "", images: ["e4c26b04c7"], order: 3 },
              { label: "D", content: "", images: ["f2f74fb050"], order: 4 },
            ],
            order: 4,
          },
        ],
      },
      {
        id: 2,
        title: "二、填空题，每个题5分，共20分",
        images: null,
        list: [
          {
            id: 1,
            title: "已知关于 $x$ 的方程 $2x + a = 1$ 的解是 $x = -1$，则 $a$ 的值是________。",
            comment: "",
            order: 4,
          },
          {
            id: 2,
            title: "若代数式 $3x - 5$ 与 $x + 3$ 的值相等，则 $x$ 的值是________。",
            comment: "",
            order: 5,
          },
          {
            id: 3,
            title:
              "某校开展校园足球联赛，规定胜一场得 3 分，平一场得 1 分，负一场得 0 分。某队在已比赛的 10 场中保持不败，且总积分为 22 分，则该队胜了________场。",
            comment: "",
            order: 6,
          },
        ],
      },
      {
        id: 3,
        title: "三、解答和证明题",
        list: [
          {
            id: 1,
            title: `某工厂计划生产一批零件，若由甲工人单独完成需要 12 小时，乙工人单独完成需要 15 小时。

（1）若甲、乙两人合作，需要多少小时可以完成这批零件的生产任务？

（2）在实际生产过程中，甲工人先单独工作了 3 小时，随后因临时任务调离，剩余的任务由乙工人单独完成。请问乙工人还需要工作多少小时才能完成全部任务？`,
            order: 7,
          },
          {
            id: 2,
            title: `已知关于 $x$ 的方程 $ax + b = 0$（其中 $a \\neq 0$）的解是 $x = 1$。

（1）请利用等式的性质证明：$a + b = 0$；

（2）若另有一个关于 $y$ 的方程 $a(y - 2) + b = 0$，请结合（1）中的结论，说明该方程的解为 $y = 3$。`,
            order: 8,
          },
          {
            id: 3,
            title: `已知关于 $x$ 的方程 $|x - a| + |x - b| = b - a$ （其中 $a, b$ 为常数，且 $a < b$）。

（1）证明：任何满足 $a \\le x \\le b$ 的实数 $x$ 都是该方程的解；

（2）若对于另一个方程 $|x - a| + |x - b| = |2x - (a + b)|$ ，某同学发现该方程对于**所有**实数 $x$ 都成立。请你利用数轴几何意义或代数变形证明：这一结论在 $a \\neq b$ 的条件下是不成立的，并求出该方程实际成立时 $x$ 的取值范围。`,
            order: 9,
          },
        ],
      },
    ],
  };

  return (
    <div className="p-2.5 min-h-screen">
      {/* 试卷标题 */}
      <div>
        <h3 className="text-center text-[18px] font-bold">{testList.title}</h3>
      </div>

      {/* 题目列表 */}
      <div className="mt-3">
        {testList.list?.map((item) => {
          return (
            <div key={item.id}>
              {/* 题目标题 */}
              <h4 className="text-[14px] font-semibold mt-2.5">{item.title}</h4>

              {item.list?.map((info) => {
                return (
                  <div key={info.id} className="mt-2.5">
                    <CommonTitle no={info.order} title={info.title} comment={info.comment} images={info.images ?? []} />

                    {/* 选择题的选项信息, 非选择题不展示, 判断题以后再维护 */}
                    {info.options && info.options.length > 0 && (
                      <div className="mt-2.5">
                        <CommonSelect optionsLayout={info.optionsLayout ?? 1} options={info.options} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
