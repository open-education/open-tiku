// 选项风格
import type {QuestionInfo} from "~/type/question";
import {Alert, Button, Col, Flex, Radio, type RadioChangeEvent, Row} from "antd";
import {StringUtil, StringValidator} from "~/util/string";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import React, {type Dispatch, type SetStateAction} from "react";
import {AddAInfoStyle, EditAInfoStyle} from "~/tiku/common/a";
import {AddBInfoStyle, EditBInfoStyle} from "~/tiku/common/b";
import {AddCInfoStyle, EditCInfoStyle} from "~/tiku/common/c";
import {AddDInfoStyle, EditDInfoStyle} from "~/tiku/common/d";
import {AddEInfoStyle, EditEInfoStyle} from "~/tiku/common/e";
import type {EditSelect} from "~/type/edit";
import {httpClient} from "~/util/http";

export function CommonSelect(questionInfo: QuestionInfo) {
  const showSelectVal = questionInfo.showSelectVal;
  if (showSelectVal === "1") {
    return <Row gutter={[10, 10]}>
      <Col span={6}>
        {
          StringValidator.isNonEmpty(questionInfo.aVal) && <Markdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {questionInfo.aVal}
          </Markdown>
        }
      </Col>
      <Col span={6}>
        {
          StringValidator.isNonEmpty(questionInfo.bVal) && <Markdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {questionInfo.bVal}
          </Markdown>
        }
      </Col>
      <Col span={6}>
        {
          StringValidator.isNonEmpty(questionInfo.cVal) && <Markdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {questionInfo.cVal}
          </Markdown>
        }
      </Col>
      <Col span={6}>
        {
          StringValidator.isNonEmpty(questionInfo.dVal) && <Markdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {questionInfo.dVal}
          </Markdown>
        }
      </Col>
    </Row>
  } else if (showSelectVal === "2") {
    return <Row gutter={[10, 10]}>
      <Col span={24}>
        {
          StringValidator.isNonEmpty(questionInfo.aVal) && <Markdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {questionInfo.aVal}
          </Markdown>
        }
      </Col>
      <Col span={24}>
        {
          StringValidator.isNonEmpty(questionInfo.bVal) && <Markdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {questionInfo.bVal}
          </Markdown>
        }
      </Col>
      <Col span={24}>
        {
          StringValidator.isNonEmpty(questionInfo.cVal) && <Markdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {questionInfo.cVal}
          </Markdown>
        }
      </Col>
      <Col span={24}>
        {
          StringValidator.isNonEmpty(questionInfo.dVal) && <Markdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {questionInfo.dVal}
          </Markdown>
        }
      </Col>
    </Row>
  } else {
    return <Row gutter={[10, 10]}>
      <Col span={24}>
        <Row gutter={[10, 10]}>
          <Col span={12}>
            {
              StringValidator.isNonEmpty(questionInfo.aVal) && <Markdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {questionInfo.aVal}
              </Markdown>
            }
          </Col>
          <Col span={12}>
            {
              StringValidator.isNonEmpty(questionInfo.bVal) && <Markdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {questionInfo.bVal}
              </Markdown>
            }
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <Row gutter={[10, 10]}>
          <Col span={12}>
            {
              StringValidator.isNonEmpty(questionInfo.cVal) && <Markdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {questionInfo.cVal}
              </Markdown>
            }
          </Col>
          <Col span={12}>
            {
              StringValidator.isNonEmpty(questionInfo.dVal) && <Markdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {questionInfo.dVal}
              </Markdown>
            }
          </Col>
        </Row>
      </Col>
    </Row>
  }
}

export function AddSelectTopStyle(
  showSelectVal: string,
  setShowSelectVal: React.Dispatch<React.SetStateAction<string>>,
  setShowEditSelect?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const onAddSelectChange = (e: RadioChangeEvent) => {
    setShowSelectVal(e.target.value);
    if (setShowEditSelect) {
      setShowEditSelect(true);
    }
  }

  return <Row gutter={[10, 10]}>
    <Col span={24}>
      <div className="text-blue-700 text-[15px] mb-[10px] font-bold">选项</div>
      <Flex vertical gap="small" justify={"right"}>
        <Radio.Group
          defaultValue={showSelectVal}
          buttonStyle="solid"
          onChange={onAddSelectChange}
          block
          options={[
            {
              value: "1",
              label: "展示一行",
            },
            {
              value: "2",
              label: "展示一列",
            },
            {
              value: "3",
              label: "展示两列",
            },
          ]}
          optionType="button"
        />
      </Flex>
    </Col>
  </Row>
}

export function EditSelectTopStyle(
  showSelectVal: string,
  setShowSelectVal: React.Dispatch<React.SetStateAction<string>>,
  questionInfo: QuestionInfo,
  setRefreshListNum: Dispatch<SetStateAction<number>>,
) {
  const [showEditSelect, setShowEditSelect] = React.useState(false);
  const [showEditSelectErr, setShowEditSelectErr] = React.useState<React.ReactNode>("");

  const updateSelectVal = () => {
    const req: EditSelect = {
      textbookKey: questionInfo.textbookKey,
      catalogKey: questionInfo.catalogKey,
      id: questionInfo.id,
      select: showSelectVal,
    }
    httpClient.post("/edit/select", req).then((res) => {
      setShowEditSelectErr("");
      setShowEditSelect(false);
      setRefreshListNum(StringUtil.getRandomInt());
    }).catch((err) => {
      setShowEditSelectErr(<div>
        <Alert title={`更新选项样式出错: ${err.message}`} type={"error"}/>
      </div>);
    })
  }

  const showEditSelectArea = <div className="mt-2.5">
    <Flex gap="small" wrap justify={"right"}>
      <Button color="cyan" variant="dashed" onClick={updateSelectVal}>更新</Button>
    </Flex>
  </div>

  return <div className="p-2.5 hover:border border-red-700 border-dashed">
    <div>
      {AddSelectTopStyle(showSelectVal, setShowSelectVal, setShowEditSelect)}
    </div>
    {showEditSelectErr}
    {showEditSelect && showEditSelectArea}
  </div>
}

export function AddSelectStyle(
  aVal: string,
  setAVal: React.Dispatch<React.SetStateAction<string>>,
  bVal: string,
  setBVal: React.Dispatch<React.SetStateAction<string>>,
  cVal: string,
  setCVal: React.Dispatch<React.SetStateAction<string>>,
  dVal: string,
  setDVal: React.Dispatch<React.SetStateAction<string>>,
  eVal: string,
  setEVal: React.Dispatch<React.SetStateAction<string>>,
  showSelectVal: string,
  setShowSelectVal: React.Dispatch<React.SetStateAction<string>>,
) {
  return <div>
    <div className="p-2.5">
      {AddSelectTopStyle(showSelectVal, setShowSelectVal)}
    </div>
    <div className="p-2.5">
      {AddAInfoStyle(aVal, setAVal)}
    </div>
    <div className="p-2.5">
      {AddBInfoStyle(bVal, setBVal)}
    </div>
    <div className="p-2.5">
      {AddCInfoStyle(cVal, setCVal)}
    </div>
    <div className="p-2.5">
      {AddDInfoStyle(dVal, setDVal)}
    </div>
    <div className="p-2.5">
      {AddEInfoStyle(eVal, setEVal)}
    </div>
  </div>
}

export function EditSelectStyle(
  aVal: string,
  setAVal: React.Dispatch<React.SetStateAction<string>>,
  bVal: string,
  setBVal: React.Dispatch<React.SetStateAction<string>>,
  cVal: string,
  setCVal: React.Dispatch<React.SetStateAction<string>>,
  dVal: string,
  setDVal: React.Dispatch<React.SetStateAction<string>>,
  eVal: string,
  setEVal: React.Dispatch<React.SetStateAction<string>>,
  showSelectVal: string,
  setShowSelectVal: React.Dispatch<React.SetStateAction<string>>,
  questionInfo: QuestionInfo,
  setRefreshListNum: Dispatch<SetStateAction<number>>,
) {
  return <div>
    {EditSelectTopStyle(showSelectVal, setShowSelectVal, questionInfo, setRefreshListNum)}
    {EditAInfoStyle(aVal, setAVal, questionInfo, setRefreshListNum)}
    {EditBInfoStyle(bVal, setBVal, questionInfo, setRefreshListNum)}
    {EditCInfoStyle(cVal, setCVal, questionInfo, setRefreshListNum)}
    {EditDInfoStyle(dVal, setDVal, questionInfo, setRefreshListNum)}
    {EditEInfoStyle(eVal, setEVal, questionInfo, setRefreshListNum)}
  </div>
}
