import React from "react";
import {Alert, Button, Col, Flex, Row} from "antd";
import type {EditAnswer} from "~/type/edit";
import {httpClient} from "~/util/http";
import {StringUtil} from "~/util/string";
import {SimpleTextArea} from "~/tiku/common/text-area";

interface AddAnswerProps {
  val: string;
  setVal: (value: string) => void;
  onStartEdit?: (value: boolean) => void;
}

// 添加参考答案样式
export function AddAnswerInfoStyle(props: AddAnswerProps) {
  return <Row gutter={[10, 10]}>
    <Col span={24}>
      <div className="text-blue-700 text-[15px] mb-2.5 font-bold">参考答案</div>
      {<SimpleTextArea
        name="answer"
        value={props.val}
        onChange={props.setVal}
        placeholder="请输入参考答案"
        autoSize={{minRows: 3, maxRows: 7}}
        onStartEdit={props.onStartEdit}
      />}
    </Col>
  </Row>
}

interface EditAnswerProps {
  val: string;
  setVal: (value: string) => void;
  id: number;
  setRefreshListNum: (value: number) => void;
}

// 编辑参考答案样式
export function EditAnswerInfoStyle(props: EditAnswerProps) {
  const [showEditAnswer, setShowEditAnswer] = React.useState(false);
  const [showEditAnswerErr, setShowEditAnswerErr] = React.useState<React.ReactNode>("");

  const updateAnswerVal = () => {
    const req: EditAnswer = {
      id: props.id,
      answer: props.val,
    }
    httpClient.post("/edit/answer", req).then((res) => {
      setShowEditAnswerErr("");
      setShowEditAnswer(false);
      props.setRefreshListNum(StringUtil.getRandomInt());
    }).catch(err => {
      setShowEditAnswerErr(<div>
        <Alert title={`更新答案出错: ${err.message}`} type={"error"}/>
      </div>);
    })
  }

  const showEditAnswerArea = <div className="mt-2.5">
    <Flex gap="small" wrap justify={"right"}>
      <Button color="cyan" variant="dashed" onClick={updateAnswerVal}>更新</Button>
    </Flex>
  </div>

  return <div className="p-2.5 hover:border border-red-700 border-dashed">
    <div>
      {<AddAnswerInfoStyle val={props.val} setVal={props.setVal} onStartEdit={setShowEditAnswer}/>}
    </div>
    {showEditAnswerErr}
    {showEditAnswer && showEditAnswerArea}
  </div>
}
