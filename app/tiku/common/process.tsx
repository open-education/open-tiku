import React from "react";
import {Alert, Button, Col, Flex, Row, type UploadFile} from "antd";
import type {EditProcess} from "~/type/edit";
import {httpClient} from "~/util/http";
import {StringUtil} from "~/util/string";
import {SimpleTextArea} from "~/tiku/common/text-area";
import {AddUploadImageStyle} from "~/tiku/common/upload-image";

interface AddProcessProps {
  val: string;
  setVal(value: string): void;
  onStartEdit?: (value: boolean) => void;
}

// 添加解题过程样式
export function AddProcessInfoStyle(props: AddProcessProps) {
  return <Row gutter={[10, 10]}>
    <Col span={24}>
      <div className="text-blue-700 text-[15px] mb-2.5 font-bold">解题过程</div>
      {<SimpleTextArea
        name="process"
        value={props.val}
        onChange={props.setVal}
        placeholder="请输入解题过程"
        autoSize={{minRows: 3, maxRows: 7}}
        onStartEdit={props.onStartEdit}
      />}
    </Col>
  </Row>
}

interface EditProcessProps {
  val: string;
  setVal: (val: string) => void;
  images: UploadFile[];
  setImages: (images: UploadFile[]) => void;
  id: number;
  setRefreshListNum: (value: number) => void;
}

// 编辑解题过程样式
export function EditProcessInfoStyle(props: EditProcessProps) {
  const [showEditProcess, setShowEditProcess] = React.useState(false);
  const [showEditProcessErr, setShowEditProcessErr] = React.useState<React.ReactNode>("");

  const updateProcessVal = () => {
    const req: EditProcess = {
      id: props.id,
      process: {
        content: props.val,
        images: props.images?.map(image => image.name)
      },
    }
    httpClient.post("/edit/process", req).then((res) => {
      setShowEditProcessErr("");
      setShowEditProcess(false);
      props.setRefreshListNum(StringUtil.getRandomInt());
    }).catch((err) => {
      setShowEditProcessErr(<div>
        <Alert title={`更新解题过程出错: ${err.message}`} type="error"/>
      </div>);
    })
  }

  const showEditProcessArea = <div className="mt-2.5">
    <Flex gap="small" wrap justify={"right"}>
      <Button color="cyan" variant="dashed" onClick={updateProcessVal}>更新</Button>
    </Flex>
  </div>

  return <div className="p-2.5 hover:border border-red-700 border-dashed">
    <div>
      {<AddProcessInfoStyle
        val={props.val}
        setVal={props.setVal}
        onStartEdit={setShowEditProcess}
      />}
      {<AddUploadImageStyle
        images={props.images}
        setImages={props.setImages}
        showTitle={false}
        onStartEdit={setShowEditProcess}
      />}
    </div>
    {showEditProcessErr}
    {showEditProcess && showEditProcessArea}
  </div>
}
