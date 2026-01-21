// 题目和图片风格
import { StringUtil } from "~/util/string";
import { Alert, Button, Col, Flex, Image, Row } from "antd";
import React from "react";
import type { EditTitle } from "~/type/edit";
import { httpClient } from "~/util/http";
import { SimpleTextArea } from "~/tiku/common/text-area";

interface AddTitleProps {
  val: string;
  setVal: (value: string) => void;
  onStartEdit?: (value: boolean) => void;
}

// 添加标题样式
export function AddTitleInfoStyle(props: AddTitleProps) {
  return (
    <Row gutter={[10, 10]}>
      <Col span={24}>
        <div className="text-blue-700 text-[15px] mb-2.5 font-bold">标题</div>
        {
          <SimpleTextArea
            name="title"
            value={props.val}
            onChange={props.setVal}
            placeholder="请输入题目标题"
            autoSize={{ minRows: 3, maxRows: 7 }}
            onStartEdit={props.onStartEdit}
          />
        }
      </Col>
    </Row>
  );
}

interface EditTitleProps {
  val: string;
  setVal: (value: string) => void;
  id: number;
  setRefreshListNum: (value: number) => void;
}

// 编辑标题样式
export function EditTitleInfoStyle(props: EditTitleProps) {
  const [showEditTitle, setShowEditTitle] = React.useState(false);
  const [showEditTitleErr, setShowEditTitleErr] =
    React.useState<React.ReactNode>("");

  const updateRateVal = () => {
    const req: EditTitle = {
      id: props.id,
      title: props.val,
    };
    httpClient
      .post("/edit/title", req)
      .then((res) => {
        setShowEditTitleErr("");
        setShowEditTitle(false);
        props.setRefreshListNum(StringUtil.getRandomInt());
      })
      .catch((err) => {
        setShowEditTitleErr(
          <div>
            <Alert title={`更新标题出错: ${err.message}`} type={"error"} />
          </div>,
        );
      });
  };

  const showEditTitleArea = (
    <div className="mt-2.5">
      <Flex gap="small" wrap justify={"right"}>
        <Button color="cyan" variant="dashed" onClick={updateRateVal}>
          更新
        </Button>
      </Flex>
    </div>
  );

  return (
    <div className="p-2.5 hover:border border-red-700 border-dashed">
      <div>
        {
          <AddTitleInfoStyle
            val={props.val}
            setVal={props.setVal}
            onStartEdit={setShowEditTitle}
          />
        }
      </div>
      {showEditTitleErr}
      {showEditTitle && showEditTitleArea}
    </div>
  );
}
