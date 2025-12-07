import React, {useCallback} from "react";
import {Alert, Button, Col, Flex, Input, Row} from "antd";
import type {EditMention} from "~/type/edit";
import type {QuestionInfo} from "~/type/question";
import {httpClient} from "~/util/http";

const {TextArea} = Input;

export function MentionInfo(
    mentionVal: string,
    setMentionVal: React.Dispatch<React.SetStateAction<string>>,
    setShowEditMention?: React.Dispatch<React.SetStateAction<boolean>>,
) {
    const onEditMentionChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setMentionVal(e.target.value);
            if (setShowEditMention) {
                setShowEditMention(true);
            }
        },
        []
    );

    return <TextArea
        autoSize={{minRows: 2, maxRows: 5}}
        placeholder="请输入题目补充"
        onChange={onEditMentionChange}
        name="mention"
        value={mentionVal}
    />
}

export function AddMentionInfoStyle(
    mentionVal: string,
    setMentionVal: React.Dispatch<React.SetStateAction<string>>,
    setShowEditMention?: React.Dispatch<React.SetStateAction<boolean>>,
) {
    return <Row gutter={[10, 10]}>
        <Col span={24}>
            <div className="text-blue-700 text-[15px] mb-[10px] font-bold">补充</div>
            {MentionInfo(mentionVal, setMentionVal, setShowEditMention)}
        </Col>
    </Row>
}

export function EditMentionInfoStyle(
    mentionVal: string,
    setMentionVal: React.Dispatch<React.SetStateAction<string>>,
    questionInfo: QuestionInfo,
) {
    const [showEditMention, setShowEditMention] = React.useState(false);
    const [showEditMentionErr, setShowEditMentionErr] = React.useState<React.ReactNode>("");

    const updateMentionVal = () => {
        const req: EditMention = {
            textbookKey: questionInfo.textbookKey,
            catalogKey: questionInfo.catalogKey,
            id: questionInfo.id,
            mention: mentionVal,
        }
        httpClient.post("/edit/mention", req).then(res => {
            setShowEditMentionErr("");
            setShowEditMention(false);
        }).catch(err => {
            setShowEditMentionErr(<div>
                <Alert title={`更新标记出错: ${err.message}`} type="error"/>
            </div>);
        })
    }

    const showEditMentionArea = <div className="mt-2.5">
        <Flex gap="small" wrap justify={"right"}>
            <Button color="cyan" variant="dashed" onClick={updateMentionVal}>更新</Button>
        </Flex>
    </div>

    return <div className="p-2.5 hover:border border-red-700 border-dashed">
        <div>
            {AddMentionInfoStyle(mentionVal, setMentionVal, setShowEditMention)}
        </div>
        {showEditMentionErr}
        {showEditMention && showEditMentionArea}
    </div>
}
