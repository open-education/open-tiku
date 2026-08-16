import { Separator } from "~/components/ui/separator";
import { useUserInfo } from "~/hooks/use-user";
import type { CommonPaperSearchReq, TopPaperReq, TopPaperResp } from "~/type/paper";
import type { UserInfoResp } from "~/type/user";
import { StringConst } from "~/util/string";
import { TopQuestionInfo } from "~/paper/top/question";
import { TagShow } from "~/common/paper/tag";
import TopAdd from "~/paper/top/add";
import { Button } from "~/components/ui/button";
import { SquarePen } from "lucide-react";
import { PaperStatus } from "~/type/enum";

// 试卷详情预览样式
interface TopInfoPreviewProps {
  req: TopPaperReq;
}
function TopInfoPreview({ req }: TopInfoPreviewProps) {
  // 获取用户信息
  const currentUser: UserInfoResp | null = useUserInfo();

  // 生成题型样式
  const getGroupName = (index: number, typeName: string, subTitle: string) => {
    const groupName = subTitle
      ? `${StringConst.groupNumberMap[index]}、${typeName} (${subTitle})`
      : `${StringConst.groupNumberMap[index]}、${typeName}`;
    return <div className="text-base">{groupName}</div>;
  };

  return (
    <div className="flex flex-col gap-3 pl-4 pb-4 pr-4 bg-gray-100">
      <div>
        <Separator />
      </div>

      {/* 来源和备注, 只展示存在的信息 */}
      <div className="flex flex-col gap-1 text-sm">
        {req.common.score > 0 && <div>分数: {req.common.score}</div>}
        {currentUser?.username && (
          <div>
            由 <span className="text-sm font-medium text-blue-600">{currentUser.username}</span> 上传
          </div>
        )}
        {req.common.source && <div>来源: {req.common.source}</div>}
        {req.common.remark && <div>备注: {req.common.remark}</div>}
      </div>

      <div>
        <Separator />
      </div>

      {/* 生成标签 */}
      <div className="flex gap-3 items-center w-full">
        <TagShow
          relatedName={req.common.relatedName ?? ""}
          tag={req.common.tag}
          year={req.common.year}
          grade={req.common.grade ?? ""}
          semester={req.common.semester ?? ""}
        />
      </div>

      {/* 标题 */}
      <div className="text-lg font-bold text-center">{req.common.title}</div>

      {/* 试卷内容 */}
      {req.groups?.map((group, idx) => {
        return (
          <div key={`${idx}-${group.genId}`}>
            {/* 题型名称 */}
            <div className="mt-2.5 mb-2.5 font-bold">{getGroupName(idx, group.typeName, group.subTitle)}</div>

            {/* 小题列表 */}
            {group.questions?.map((question, idx) => {
              return <TopQuestionInfo key={question.genId} index={idx} question={question} />;
            })}
          </div>
        );
      })}
    </div>
  );
}

// 试卷详情样式
interface TopInfoProps {
  infoResp: TopPaperResp;
  search?: CommonPaperSearchReq;

  // 以下为 Sheet 操作方法和属性
  setSheetTitle?: (value: string) => void;
  setSheetDesc?: (value: string) => void;
  setSheetContent?: (value: React.ReactNode) => void;
}
function TopInfo({
  infoResp,
  search = {
    relatedId: 0,
    relatedName: "",
    selectedKeys: [],
    tag: "",
    year: "",
    grade: "",
    semester: "",
    paperType: 0,
    source: "",
  },
  setSheetTitle,
  setSheetDesc,
  setSheetContent,
}: TopInfoProps) {
  // 获取用户信息
  const currentUser: UserInfoResp | null = useUserInfo();

  // 生成题型样式
  const getGroupName = (index: number, typeName: string, subTitle: string) => {
    const groupName = subTitle
      ? `${StringConst.groupNumberMap[index]}、${typeName} (${subTitle})`
      : `${StringConst.groupNumberMap[index]}、${typeName}`;
    return <div className="text-base">{groupName}</div>;
  };

  const handleEdit = () => {
    setSheetTitle?.("编辑试卷");
    setSheetDesc?.("当前为编辑试卷模式, 提交后会覆盖历史数据, 请谨慎操作");
    setSheetContent?.(
      <TopAdd searchReq={search} infoResp={infoResp} setSheetTitle={setSheetTitle} setSheetDesc={setSheetDesc} setSheetContent={setSheetContent} />,
    );
  };

  // 显示编辑按钮
  const showEdit = () => {
    if (!currentUser || infoResp.common.paperType !== StringConst.paperTypeTop) {
      return "";
    }

    const status = infoResp.common.status;
    if (status !== PaperStatus.Drafing && status != PaperStatus.Pending) {
      return "";
    }

    return (
      <Button className="text-sm" onClick={handleEdit}>
        <SquarePen className="mr-2 h-4 w-4" />
        编辑
      </Button>
    );
  };

  return (
    <div className="flex flex-col gap-3 pl-4 pb-4 pr-4 bg-gray-100">
      {/* 编辑模式查看详情时才有 */}

      <div>
        <Separator />
      </div>

      <div>{showEdit()}</div>

      <div>
        <Separator />
      </div>

      {/* 来源和备注, 只展示存在的信息 */}
      <div className="flex flex-col gap-1 text-sm">
        {infoResp.common.score > 0 && <div>分数: {infoResp.common.score}</div>}
        {currentUser?.username && (
          <div>
            由 <span className="text-sm font-medium text-blue-600">{currentUser.username}</span> 上传
          </div>
        )}
        {infoResp.common.source && <div>来源: {infoResp.common.source}</div>}
        {infoResp.common.remark && <div>备注: {infoResp.common.remark}</div>}
      </div>

      <div>
        <Separator />
      </div>

      {/* 生成标签 */}
      <div className="flex gap-3 items-center w-full">
        <TagShow
          relatedName={infoResp.common.relatedName ?? ""}
          tag={infoResp.common.tag}
          year={infoResp.common.year}
          grade={infoResp.common.grade ?? ""}
          semester={infoResp.common.semester ?? ""}
        />
      </div>

      {/* 标题 */}
      <div className="text-lg font-bold text-center">{infoResp.common.title}</div>

      {/* 试卷内容 */}
      {infoResp.groups?.map((group, idx) => {
        return (
          <div key={`${infoResp.common.id}-${group.common.id}`}>
            {/* 题型名称 */}
            <div className="mt-2.5 mb-2.5 font-bold">{getGroupName(idx, group.common.typeName, group.common.subTitle)}</div>

            {/* 小题列表 */}
            {group.questions?.map((question, idx) => {
              return <TopQuestionInfo key={question.genId} index={idx} question={question} />;
            })}
          </div>
        );
      })}
    </div>
  );
}

export { TopInfo, TopInfoPreview };
