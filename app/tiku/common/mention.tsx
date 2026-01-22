import React from "react";
import { Alert, Button, Col, Flex, Row } from "antd";
import type { EditMention } from "~/type/edit";
import { httpClient } from "~/util/http";
import { StringUtil } from "~/util/string";
import { SimpleTextArea } from "~/tiku/common/text-area";

interface AddMentionProps {
  val: string;
  setVal: (value: string) => void;
  onStartEdit?: (value: boolean) => void;
}

// 添加题目补充说明样式
export function AddMentionInfoStyle(props: AddMentionProps) {
  return (
    <Row gutter={[10, 10]}>
      <Col span={24}>
        <div className="text-blue-700 text-[15px] mb-2.5 font-bold">补充</div>
        {
          <SimpleTextArea
            name="mention"
            value={props.val}
            onChange={props.setVal}
            placeholder="请输入题目补充"
            autoSize={{ minRows: 2, maxRows: 5 }}
            onStartEdit={props.onStartEdit}
          />
        }
      </Col>
    </Row>
  );
}

interface EditMentionProps {
  val: string;
  setVal: (value: string) => void;
  id: number;
  setRefreshListNum: (value: number) => void;
}

// 编辑题目补充说明样式
export function EditMentionInfoStyle(props: EditMentionProps) {
  const [showEditMention, setShowEditMention] = React.useState(false);
  const [showEditMentionErr, setShowEditMentionErr] = React.useState<React.ReactNode>("");

  const updateMentionVal = () => {
    const req: EditMention = {
      id: props.id,
      mention: props.val,
    };
    httpClient
      .post("/edit/mention", req)
      .then((res) => {
        setShowEditMentionErr("");
        setShowEditMention(false);
        props.setRefreshListNum(StringUtil.getRandomInt());
      })
      .catch((err) => {
        setShowEditMentionErr(
          <div>
            <Alert title={`更新标记出错: ${err.message}`} type="error" />
          </div>,
        );
      });
  };

  const showEditMentionArea = (
    <div className="mt-2.5">
      <Flex gap="small" wrap justify={"right"}>
        <Button color="cyan" variant="dashed" onClick={updateMentionVal}>
          更新
        </Button>
      </Flex>
    </div>
  );

  return (
    <div className="p-2.5 hover:border border-red-700 border-dashed">
      <div>{<AddMentionInfoStyle val={props.val} setVal={props.setVal} onStartEdit={setShowEditMention} />}</div>
      {showEditMentionErr}
      {showEditMention && showEditMentionArea}
    </div>
  );
}
