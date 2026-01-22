import React from "react";
import { Alert, Button, Col, Flex, Row, type UploadFile } from "antd";
import type { EditAnalyze } from "~/type/edit";
import { httpClient } from "~/util/http";
import { StringUtil } from "~/util/string";
import { SimpleTextArea } from "~/tiku/common/text-area";
import { AddUploadImageStyle } from "~/tiku/common/upload-image";

interface AddAnalyzeProps {
  val: string;
  setVal(val: string): void;
  onStartEdit?: (value: boolean) => void;
}

// 添加解题分析样式
export function AddAnalyzeInfoStyle(props: AddAnalyzeProps) {
  return (
    <Row gutter={[10, 10]}>
      <Col span={24}>
        <div className="text-blue-700 text-[15px] mb-2.5 font-bold">解题分析</div>
        {
          <SimpleTextArea
            name="analyze"
            value={props.val}
            onChange={props.setVal}
            autoSize={{ minRows: 3, maxRows: 7 }}
            placeholder="请输入解题分析"
            onStartEdit={props.onStartEdit}
          />
        }
      </Col>
    </Row>
  );
}

interface EditAnalyzeProps {
  val: string;
  setVal(val: string): void;
  images: UploadFile[];
  setImages(images: UploadFile[]): void;
  id: number;
  setRefreshListNum: (value: number) => void;
}

// 编辑解题分析样式
export function EditAnalyzeInfoStyle(props: EditAnalyzeProps) {
  const [showEditAnalyze, setShowEditAnalyze] = React.useState(false);
  const [showEditAnalyzeErr, setShowEditAnalyzeErr] = React.useState<React.ReactNode>("");

  const updateAnalyzeVal = () => {
    const req: EditAnalyze = {
      id: props.id,
      analyze: {
        content: props.val,
        images: props.images?.map((image) => image.name),
      },
    };
    httpClient
      .post("/edit/analyze", req)
      .then((res) => {
        setShowEditAnalyzeErr("");
        setShowEditAnalyze(false);
        props.setRefreshListNum(StringUtil.getRandomInt());
      })
      .catch((err) => {
        setShowEditAnalyzeErr(
          <div>
            <Alert title={`更新解题分析出错: ${err.message}`} type={"error"} />
          </div>,
        );
      });
  };

  const showEditAnalyzeArea = (
    <div className="mt-2.5">
      <Flex gap="small" wrap justify={"right"}>
        <Button color="cyan" variant="dashed" onClick={updateAnalyzeVal}>
          更新
        </Button>
      </Flex>
    </div>
  );

  return (
    <div className="p-2.5 hover:border border-red-700 border-dashed">
      <div>
        {<AddAnalyzeInfoStyle val={props.val} setVal={props.setVal} onStartEdit={setShowEditAnalyze} />}
        {<AddUploadImageStyle images={props.images} setImages={props.setImages} showTitle={false} onStartEdit={setShowEditAnalyze} />}
      </div>
      {showEditAnalyzeErr}
      {showEditAnalyze && showEditAnalyzeArea}
    </div>
  );
}
