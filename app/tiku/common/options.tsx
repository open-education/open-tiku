import { SimpleTextArea } from "~/tiku/common/text-area";
import React from "react";
import { AddUploadImageStyle } from "~/tiku/common/upload-image";
import { Alert, Button, Col, Flex, Row, type UploadFile } from "antd";
import type { EditOptions } from "~/type/edit";
import { httpClient } from "~/util/http";
import { StringUtil, StringValidator } from "~/util/string";
import type { QuestionOption } from "~/type/question";

// 定义 Props 接口
interface OptionProps {
  val: string;
  setVal: (value: string) => void;
  images: UploadFile[];
  setImages: (images: UploadFile[]) => void;
  onStartEdit?: (value: boolean) => void;
}

// 添加选项样式
function OptionForA(props: OptionProps) {
  return (
    <Row gutter={[10, 10]}>
      <Col span={24}>
        <div className="text-blue-700 text-[15px] mb-2.5 font-bold">A</div>
        {<SimpleTextArea name="A" value={props.val} onChange={props.setVal} placeholder="请输入A选项内容" onStartEdit={props.onStartEdit} />}
      </Col>
      <Col span={24}>
        {<AddUploadImageStyle images={props.images} setImages={props.setImages} showTitle={false} onStartEdit={props.onStartEdit} />}
      </Col>
    </Row>
  );
}

// 添加选项样式
function OptionForB(props: OptionProps) {
  return (
    <Row gutter={[10, 10]}>
      <Col span={24}>
        <div className="text-blue-700 text-[15px] mb-2.5 mt-2.5 font-bold">B</div>
        {<SimpleTextArea name="B" value={props.val} onChange={props.setVal} placeholder="请输入B选项内容" onStartEdit={props.onStartEdit} />}
      </Col>
      <Col span={24}>
        {<AddUploadImageStyle images={props.images} setImages={props.setImages} showTitle={false} onStartEdit={props.onStartEdit} />}
      </Col>
    </Row>
  );
}

// 添加选项样式
function OptionForC(props: OptionProps) {
  return (
    <Row gutter={[10, 10]}>
      <Col span={24}>
        <div className="text-blue-700 text-[15px] mb-2.5 mt-2.5 font-bold">C</div>
        {<SimpleTextArea name="C" value={props.val} onChange={props.setVal} placeholder="请输入C选项内容" onStartEdit={props.onStartEdit} />}
      </Col>
      <Col span={24}>
        {<AddUploadImageStyle images={props.images} setImages={props.setImages} showTitle={false} onStartEdit={props.onStartEdit} />}
      </Col>
    </Row>
  );
}

// 添加选项样式
function OptionForD(props: OptionProps) {
  return (
    <Row gutter={[10, 10]}>
      <Col span={24}>
        <div className="text-blue-700 text-[15px] mb-2.5 mt-2.5 font-bold">D</div>
        {<SimpleTextArea name="D" value={props.val} onChange={props.setVal} placeholder="请输入D选项内容" onStartEdit={props.onStartEdit} />}
      </Col>
      <Col span={24}>
        {<AddUploadImageStyle images={props.images} setImages={props.setImages} showTitle={false} onStartEdit={props.onStartEdit} />}
      </Col>
    </Row>
  );
}

// 添加选项样式
function OptionForE(props: OptionProps) {
  return (
    <Row gutter={[10, 10]}>
      <Col span={24}>
        <div className="text-blue-700 text-[15px] mb-2.5 mt-2.5 font-bold">E</div>
        {<SimpleTextArea name="E" value={props.val} onChange={props.setVal} placeholder="请输入E选项内容" onStartEdit={props.onStartEdit} />}
      </Col>
      <Col span={24}>
        {<AddUploadImageStyle images={props.images} setImages={props.setImages} showTitle={false} onStartEdit={props.onStartEdit} />}
      </Col>
    </Row>
  );
}

interface AddOptionProps {
  aVal: string;
  setAVal: (value: string) => void;
  aImages: UploadFile[];
  setAImages: (images: UploadFile[]) => void;
  bVal: string;
  setBVal: (value: string) => void;
  bImages: UploadFile[];
  setBImages: (images: UploadFile[]) => void;
  cVal: string;
  setCVal: (value: string) => void;
  cImages: UploadFile[];
  setCImages: (images: UploadFile[]) => void;
  dVal: string;
  setDVal: (value: string) => void;
  dImages: UploadFile[];
  setDImages: (images: UploadFile[]) => void;
  eVal: string;
  setEVal: (value: string) => void;
  eImages: UploadFile[];
  setEImages: (images: UploadFile[]) => void;
  onStartEdit?: (value: boolean) => void;
}

// 添加选项样式
export function AddOptions(props: AddOptionProps) {
  return (
    <div>
      {<OptionForA val={props.aVal} setVal={props.setAVal} images={props.aImages} setImages={props.setAImages} onStartEdit={props.onStartEdit} />}
      {<OptionForB val={props.bVal} setVal={props.setBVal} images={props.bImages} setImages={props.setBImages} onStartEdit={props.onStartEdit} />}
      {<OptionForC val={props.cVal} setVal={props.setCVal} images={props.cImages} setImages={props.setCImages} onStartEdit={props.onStartEdit} />}
      {<OptionForD val={props.dVal} setVal={props.setDVal} images={props.dImages} setImages={props.setDImages} onStartEdit={props.onStartEdit} />}
      {<OptionForE val={props.eVal} setVal={props.setEVal} images={props.eImages} setImages={props.setEImages} onStartEdit={props.onStartEdit} />}
    </div>
  );
}

interface EditOptionProps {
  aVal: string;
  setAVal: (value: string) => void;
  aImages: UploadFile[];
  setAImages: (images: UploadFile[]) => void;
  bVal: string;
  setBVal: (value: string) => void;
  bImages: UploadFile[];
  setBImages: (images: UploadFile[]) => void;
  cVal: string;
  setCVal: (value: string) => void;
  cImages: UploadFile[];
  setCImages: (images: UploadFile[]) => void;
  dVal: string;
  setDVal: (value: string) => void;
  dImages: UploadFile[];
  setDImages: (images: UploadFile[]) => void;
  eVal: string;
  setEVal: (value: string) => void;
  eImages: UploadFile[];
  setEImages: (images: UploadFile[]) => void;
  id: number;
  setRefreshListNum: (value: number) => void;
}

// 编辑选项样式
export function EditOptions(props: EditOptionProps) {
  const [showEditOptions, setShowEditOptions] = React.useState(false);
  const [showEditOptionsErr, setShowEditOptionsErr] = React.useState<React.ReactNode>("");

  const updateOptions = () => {
    // 将选项依次加入选项组中
    const options: QuestionOption[] = [];
    if (StringValidator.isNonEmpty(props.aVal) || props.aImages.length > 0) {
      options.push({
        label: "A",
        content: props.aVal,
        images: props.aImages.map((image) => image.name),
        order: 1,
      });
    }
    if (StringValidator.isNonEmpty(props.bVal) || props.bImages.length > 0) {
      options.push({
        label: "B",
        content: props.bVal,
        images: props.bImages.map((image) => image.name),
        order: 2,
      });
    }
    if (StringValidator.isNonEmpty(props.cVal) || props.cImages.length > 0) {
      options.push({
        label: "C",
        content: props.cVal,
        images: props.cImages.map((image) => image.name),
        order: 3,
      });
    }
    if (StringValidator.isNonEmpty(props.dVal) || props.dImages.length > 0) {
      options.push({
        label: "D",
        content: props.dVal,
        images: props.dImages.map((image) => image.name),
        order: 4,
      });
    }
    if (StringValidator.isNonEmpty(props.eVal) || props.eImages.length > 0) {
      options.push({
        label: "E",
        content: props.eVal,
        images: props.eImages.map((image) => image.name),
        order: 5,
      });
    }

    const req: EditOptions = {
      id: props.id,
      options: options,
    };

    httpClient
      .post<boolean>("/edit/options", req)
      .then((res) => {
        setShowEditOptionsErr("");
        setShowEditOptions(false);
        props.setRefreshListNum(StringUtil.getRandomInt());
      })
      .catch((err) => {
        setShowEditOptionsErr(
          <div>
            <Alert title={`更新选项出错: ${err.message}`} type={"error"} />
          </div>,
        );
      });
  };

  const showEditOptionsArea = (
    <div className="mt-2.5">
      <Flex gap="small" wrap justify={"right"}>
        <Button color="cyan" variant="dashed" onClick={updateOptions}>
          更新
        </Button>
      </Flex>
    </div>
  );

  return (
    <div className="p-2.5 hover:border border-red-700 border-dashed">
      <div>
        {
          <AddOptions
            aVal={props.aVal}
            setAVal={props.setAVal}
            aImages={props.aImages}
            setAImages={props.setAImages}
            bVal={props.bVal}
            setBVal={props.setBVal}
            bImages={props.bImages}
            setBImages={props.setBImages}
            cVal={props.cVal}
            setCVal={props.setCVal}
            cImages={props.cImages}
            setCImages={props.setCImages}
            dVal={props.dVal}
            setDVal={props.setDVal}
            dImages={props.dImages}
            setDImages={props.setDImages}
            eVal={props.eVal}
            setEVal={props.setEVal}
            eImages={props.eImages}
            setEImages={props.setEImages}
            onStartEdit={setShowEditOptions}
          />
        }
      </div>
      {showEditOptionsErr}
      {showEditOptions && showEditOptionsArea}
    </div>
  );
}
