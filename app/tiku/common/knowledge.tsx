import React from "react";
import {Alert, Button, Col, Flex, Row} from "antd";
import type {EditKnowledge} from "~/type/edit";
import {httpClient} from "~/util/http";
import {StringUtil} from "~/util/string";
import {SimpleTextArea} from "~/tiku/common/text-area";

interface AddKnowledgeProps {
  val: string;
  setVal: (value: string) => void;
  onStartEdit?: (value: boolean) => void;
}

// 添加知识点样式
export function AddKnowledgeInfoStyle(props: AddKnowledgeProps) {
  return <Row gutter={[10, 10]}>
    <Col span={24}>
      <div className="text-blue-700 text-[15px] mb-2.5 font-bold">知识点</div>
      {<SimpleTextArea
        name="knowledge"
        value={props.val}
        onChange={props.setVal}
        placeholder="请输入知识点"
        autoSize={{minRows: 3, maxRows: 7}}
        onStartEdit={props.onStartEdit}
      />}
    </Col>
  </Row>
}

interface EditKnowledgeProps {
  val: string;
  setVal: (value: string) => void;
  id: number;
  setRefreshListNum: (value: number) => void;
}

// 编辑参考答案样式
export function EditKnowledgeInfoStyle(props: EditKnowledgeProps) {
  const [showEditKnowledge, setShowEditKnowledge] = React.useState(false);
  const [showEditKnowledgeErr, setShowEditKnowledgeErr] = React.useState<React.ReactNode>("");

  const updateKnowledgeVal = () => {
    const req: EditKnowledge = {
      id: props.id,
      knowledge: props.val,
    }
    httpClient.post("/edit/knowledge", req).then((res) => {
      setShowEditKnowledgeErr("");
      setShowEditKnowledge(false);
      props.setRefreshListNum(StringUtil.getRandomInt());
    }).catch((err) => {
      setShowEditKnowledgeErr(<div>
        <Alert title={`更新知识点出错: ${err.message}`} type="error"/>
      </div>);
    })
  }

  const showEditKnowledgeArea = <div className="mt-2.5">
    <Flex gap="small" wrap justify={"right"}>
      <Button color="cyan" variant="dashed" onClick={updateKnowledgeVal}>更新</Button>
    </Flex>
  </div>

  return <div className="p-2.5 hover:border border-red-700 border-dashed">
    <div>
      {<AddKnowledgeInfoStyle
        val={props.val}
        setVal={props.setVal}
        onStartEdit={setShowEditKnowledge}
      />}
    </div>
    {showEditKnowledgeErr}
    {showEditKnowledge && showEditKnowledgeArea}
  </div>
}
