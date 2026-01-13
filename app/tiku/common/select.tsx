// 选项风格
import type {QuestionBaseInfoResp, QuestionOption} from "~/type/question";
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

// 选择题样式
export function CommonSelect(questionInfo: QuestionBaseInfoResp) {
  const showSelectVal: number = questionInfo.optionsLayout ?? 1;

  if (showSelectVal === 1) {
    return <Row gutter={[10, 10]}>
      {
        questionInfo.options?.map(item => {
          return <Col span={6} key={item.label}>
            {
              StringValidator.isNonEmpty(item.label) && <Markdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {`${item.label}. ${item.content}`}
              </Markdown>
            }
          </Col>
        })
      }
    </Row>
  } else if (showSelectVal === 2) {
    return <Row gutter={[10, 10]}>
      {
        questionInfo.options?.map(item => {
          return <Col span={24} key={item.label}>
            {
              StringValidator.isNonEmpty(item.label) && <Markdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {`${item.label}. ${item.content}`}
              </Markdown>
            }
          </Col>
        })
      }
    </Row>
  } else {
    // 将数组分成两部分, 5各选项的如果后续需要再调整样式, 5个选项一般选择一列的样式应该是最好的
    const options: QuestionOption[] = questionInfo.options ?? [];
    if (options.length === 0) {
      return "";
    }

    const mid = Math.floor(options.length / 2);
    const firstHalf = options.slice(0, mid);
    const secondHalf = options.slice(mid);

    return <Row gutter={[10, 10]}>
      <Col span={24}>
        <Row gutter={[10, 10]}>
          {
            firstHalf.map(item => {
              return <Col span={12} key={item.label}>
                {
                  StringValidator.isNonEmpty(item.label) && <Markdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {`${item.label}. ${item.content}`}
                  </Markdown>
                }
              </Col>
            })
          }
        </Row>
      </Col>
      <Col span={24}>
        <Row gutter={[10, 10]}>
          {
            secondHalf.map(item => {
              return <Col span={12} key={item.label}>
                {
                  StringValidator.isNonEmpty(item.label) && <Markdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {`${item.label}. ${item.content}`}
                  </Markdown>
                }
              </Col>
            })
          }
        </Row>
      </Col>
    </Row>
  }
}

export function AddSelectTopStyle(
  showSelectVal: number,
  setShowSelectVal: React.Dispatch<React.SetStateAction<number>>,
  setShowEditSelect?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const onAddSelectChange = (e: RadioChangeEvent) => {
    setShowSelectVal(Number(e.target.value));
    if (setShowEditSelect) {
      setShowEditSelect(true);
    }
  }

  return <Row gutter={[10, 10]}>
    <Col span={24}>
      <div className="text-blue-700 text-[15px] mb-2.5 font-bold">选项</div>
      <Flex vertical gap="small" justify={"right"}>
        <Radio.Group
          value={showSelectVal}
          buttonStyle="solid"
          onChange={onAddSelectChange}
          block
          options={[
            {
              value: 1,
              label: "展示一行",
            },
            {
              value: 2,
              label: "展示一列",
            },
            {
              value: 3,
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
  showSelectVal: number,
  setShowSelectVal: React.Dispatch<React.SetStateAction<number>>,
  id: number,
  setRefreshListNum: Dispatch<SetStateAction<number>>,
) {
  const [showEditSelect, setShowEditSelect] = React.useState(false);
  const [showEditSelectErr, setShowEditSelectErr] = React.useState<React.ReactNode>("");

  const updateSelectVal = () => {
    const req: EditSelect = {
      id,
      layout: showSelectVal,
    }
    httpClient.post("/edit/options-layout", req).then((res) => {
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
  showSelectVal: number,
  setShowSelectVal: React.Dispatch<React.SetStateAction<number>>,
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
  showSelectVal: number,
  setShowSelectVal: React.Dispatch<React.SetStateAction<number>>,
  id: number,
  setRefreshListNum: Dispatch<SetStateAction<number>>,
) {
  return <div>
    {EditSelectTopStyle(showSelectVal, setShowSelectVal, id, setRefreshListNum)}
    {EditAInfoStyle(aVal, setAVal, id, setRefreshListNum)}
    {EditBInfoStyle(bVal, setBVal, id, setRefreshListNum)}
    {EditCInfoStyle(cVal, setCVal, id, setRefreshListNum)}
    {EditDInfoStyle(dVal, setDVal, id, setRefreshListNum)}
    {EditEInfoStyle(eVal, setEVal, id, setRefreshListNum)}
  </div>
}
