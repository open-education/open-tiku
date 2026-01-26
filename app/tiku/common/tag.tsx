import { Alert, Button, Checkbox, Col, Flex, type GetProp, Row } from "antd";
import type { QuestionBaseInfoResp, QuestionInfoResp } from "~/type/question";
import React, { type Dispatch, type SetStateAction, useState } from "react";
import { httpClient } from "~/util/http";
import Info from "~/tiku/info";
import Edit from "~/tiku/edit";
import type { EditQuestionTags } from "~/type/edit";
import Add from "~/tiku/add";
import { StringUtil } from "~/util/string";
import type { Textbook, TextbookOtherDict } from "~/type/textbook";
import { Link } from "react-router";

// 题目列表右下快速操作区域
export function CommonQuickJumpTag(
  questionInfo: QuestionBaseInfoResp,
  setOpenDrawer: Dispatch<SetStateAction<boolean>>,
  setDrawerTitle: Dispatch<SetStateAction<string>>,
  setDrawerContent: Dispatch<SetStateAction<React.ReactNode>>,
  setRefreshListNum: Dispatch<SetStateAction<number>>,
  questionTypeList: TextbookOtherDict[],
  questionTagList: TextbookOtherDict[],
  childPathMap: Map<number, Textbook[]>,
) {
  const quickToolList = [
    {
      key: "1",
      value: "info",
      label: "详情",
    },
    {
      key: "2",
      value: "edit",
      label: "编辑",
    },
    {
      key: "3",
      value: "similar",
      label: "添加变式题",
    },
  ];
  const onClickQuickTool = (value: string) => {
    let title = "";
    switch (value) {
      case "info": {
        title = "详情";
        break;
      }
      case "edit": {
        title = "编辑";
        break;
      }
      case "similar": {
        title = "添加变式题";
        setOpenDrawer(true);
        setDrawerTitle(title);
        setDrawerContent(
          <Add
            setDrawerTitle={setDrawerTitle}
            setDrawerContent={setDrawerContent}
            setRefreshListNum={setRefreshListNum}
            sourceId={questionInfo.id}
            questionTypeList={questionTypeList}
            questionTagList={questionTagList}
            childPathMap={childPathMap}
            questionCateId={questionInfo.questionCateId}
          />,
        );
        return;
      }
      default: {
        return;
      }
    }

    // 获取题目全部信息
    httpClient.get<QuestionInfoResp>(`/question/info/${questionInfo.id}`).then((res) => {
      setOpenDrawer(true);
      setDrawerTitle(title);
      if (value === "edit") {
        // 列表公用一个 Edit 组件, 每个题信息本身不一致, 就是需要重新渲染页面, 故使用 key 属性强制渲染每次组件
        setDrawerContent(
          <Edit
            key={questionInfo.id}
            questionInfo={res}
            questionCateId={questionInfo.questionCateId}
            questionTypeList={questionTypeList}
            questionTagList={questionTagList}
            setRefreshListNum={setRefreshListNum}
            childPathMap={childPathMap}
          />,
        );
      } else {
        setDrawerContent(
          <Info questionInfo={res} questionTypeList={questionTypeList} questionTagList={questionTagList} childPathMap={childPathMap} />,
        );
      }
    });
  };

  return (
    <Row gutter={[10, 10]} className="m-3">
      <Col span={24}>
        <Flex gap="small" wrap justify={"right"}>
          {quickToolList.map((item) => {
            return (
              <Button color="primary" variant="link" value={item.value} key={item.key} onClick={() => onClickQuickTool(item.value)}>
                {item.label}
              </Button>
            );
          })}
          <Button color="primary" variant="link">
            <Link
              to={{
                pathname: "similar",
                search: `?id=${questionInfo.id}&cateId=${questionInfo.questionCateId}`,
              }}
              target="_blank"
              rel="noreferrer"
            >
              查看变式题
            </Link>
          </Button>
        </Flex>
      </Col>
    </Row>
  );
}

interface TagProps {
  tagList: TextbookOtherDict[];
  tags: number[];
  setTags: (value: number[]) => void;
  onStartEdit?: (value: boolean) => void;
}

// 题目标签基础样式
export function EditTag(props: TagProps) {
  if (!props.tagList.length) {
    return <Alert title="Warning" description="标签类型为空" type="warning" showIcon closable />;
  }

  // 选中标签
  const onEditTagsChange: GetProp<typeof Checkbox.Group, "onChange"> = (checkedValues: unknown[]) => {
    props.setTags(checkedValues as number[]);
    props.onStartEdit?.(true);
  };

  return (
    <Checkbox.Group defaultValue={props.tags} style={{ width: "100%" }} onChange={onEditTagsChange}>
      <Row>
        {props.tagList.map((item) => {
          return (
            <Col span={6} key={item.id}>
              <Checkbox value={item.id}>{item.itemValue}</Checkbox>
            </Col>
          );
        })}
      </Row>
    </Checkbox.Group>
  );
}

interface AddTagProps {
  tagList: TextbookOtherDict[];
  tags: number[];
  setTags: (value: number[]) => void;
  onStartEdit?: (value: boolean) => void;
}

// 添加题目时标签样式
export function AddTagStyle(props: AddTagProps) {
  return (
    <Row gutter={[10, 10]}>
      <Col span={24}>
        <div className="text-blue-700 text-[15px] mb-2.5 font-bold">标签</div>
        {<EditTag tagList={props.tagList} tags={props.tags} setTags={props.setTags} onStartEdit={props.onStartEdit} />}
      </Col>
    </Row>
  );
}

interface EditTagProps {
  tagList: TextbookOtherDict[];
  tags: number[];
  setTags: (value: number[]) => void;
  id: number;
  setRefreshListNum: (value: number) => void;
}

// 编辑题目时标签样式
export function EditTagStyle(props: EditTagProps) {
  const [showTagEdit, setShowTagEdit] = useState<boolean>(false);
  const [showTagEditErr, setShowTagEditErr] = useState<React.ReactNode>("");

  const updateQuestionTags = () => {
    const req: EditQuestionTags = {
      id: props.id,
      tags: props.tags,
    };
    httpClient
      .post("/edit/tags", req)
      .then((res) => {
        setShowTagEditErr("");
        setShowTagEdit(false);
        props.setRefreshListNum(StringUtil.getRandomInt());
      })
      .catch((err) => {
        setShowTagEditErr(
          <div>
            <Alert title={`更新标签出错: ${err.message}`} type={"error"} />
          </div>,
        );
      });
  };

  const showTagEditArea = (
    <div className="mt-2.5">
      <Flex gap="small" wrap justify={"right"}>
        <Button color="cyan" variant="dashed" onClick={updateQuestionTags}>
          更新
        </Button>
      </Flex>
    </div>
  );

  return (
    <div className="p-2.5 pt-2.5 hover:border border-red-700 border-dashed">
      <div>{<AddTagStyle tagList={props.tagList} tags={props.tags} setTags={props.setTags} onStartEdit={setShowTagEdit} />}</div>
      {showTagEditErr}
      {showTagEdit && showTagEditArea}
    </div>
  );
}
