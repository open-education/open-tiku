// 题目和图片风格
import type {QuestionBaseInfoResp} from "~/type/question";
import {StringUtil, StringValidator} from "~/util/string";
import {Alert, Button, Col, Flex, Image, Input, Row} from "antd";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import React, {type Dispatch, type SetStateAction, useCallback} from "react";
import type {EditTitle} from "~/type/edit";
import {httpClient} from "~/util/http";

const {TextArea} = Input;

// 标题样式
export function CommonTitle(questionInfo: QuestionBaseInfoResp) {
  return <Row gutter={[10, 10]}>
    <Col span={24}>
      {
        StringValidator.isNonEmpty(questionInfo.title) && <Markdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex]}
        >
          {questionInfo.title}
        </Markdown>
      }
    </Col>
    {/* 标注 */}
    <Col span={24} className="text-[10px] italic text-blue-950">
      {
        StringValidator.isNonEmpty(questionInfo.comment) && <Markdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {questionInfo.comment}
        </Markdown>
      }
    </Col>
    {/* 如果有图片 */}
    <Col span={24}>
      <Flex gap="small" wrap>
        {questionInfo.images?.map(imageName => {
          return (
            <div className="w-[500px]" key={imageName}>
              <Image alt="basic"
                     src={`/api/file/read/${imageName}`}/>
            </div>
          );
        })}
      </Flex>
    </Col>
  </Row>
}

export function TitleInfo(
  titleVal: string,
  setTitleVal: React.Dispatch<React.SetStateAction<string>>,
  setShowEditTitle?: React.Dispatch<React.SetStateAction<boolean>>,
) {

  const onEditTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTitleVal(e.target.value);
      if (setShowEditTitle) {
        setShowEditTitle(true);
      }
    },
    []
  );

  return <TextArea
    autoSize={{minRows: 3, maxRows: 7}}
    placeholder="请输入题目标题"
    onChange={onEditTitleChange}
    name="title"
    value={titleVal}
  />
}

export function AddTitleInfoStyle(
  titleVal: string,
  setTitleVal: React.Dispatch<React.SetStateAction<string>>,
  setShowEditTitle?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  return <Row gutter={[10, 10]}>
    <Col span={24}>
      <div className="text-blue-700 text-[15px] mb-2.5 font-bold">标题</div>
      {TitleInfo(titleVal, setTitleVal, setShowEditTitle)}
    </Col>
  </Row>
}

export function EditTitleInfoStyle(
  titleVal: string,
  setTitleVal: React.Dispatch<React.SetStateAction<string>>,
  id: number,
  setRefreshListNum: Dispatch<SetStateAction<number>>,
) {

  const [showEditTitle, setShowEditTitle] = React.useState(false);
  const [showEditTitleErr, setShowEditTitleErr] = React.useState<React.ReactNode>("");

  const updateRateVal = () => {
    const req: EditTitle = {
      id,
      title: titleVal,
    }
    httpClient.post("/edit/title", req).then(res => {
      setShowEditTitleErr("");
      setShowEditTitle(false);
      setRefreshListNum(StringUtil.getRandomInt());
    }).catch(err => {
      setShowEditTitleErr(<div>
        <Alert title={`更新标题出错: ${err.message}`} type={"error"}/>
      </div>);
    })
  }

  const showEditTitleArea = <div className="mt-2.5">
    <Flex gap="small" wrap justify={"right"}>
      <Button color="cyan" variant="dashed" onClick={updateRateVal}>更新</Button>
    </Flex>
  </div>

  return <div className="p-2.5 hover:border border-red-700 border-dashed">
    <div>
      {AddTitleInfoStyle(titleVal, setTitleVal, setShowEditTitle)}
    </div>
    {showEditTitleErr}
    {showEditTitle && showEditTitleArea}
  </div>
}
