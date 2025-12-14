import React, {type Dispatch, type SetStateAction, useCallback} from "react";
import {Alert, Button, Col, Flex, Input, Row} from "antd";
import type {EditE} from "~/type/edit";
import type {QuestionInfo} from "~/type/question";
import {httpClient} from "~/util/http";
import {StringUtil} from "~/util/string";

const {TextArea} = Input;

export function EInfo(
    eVal: string,
    setEVal: React.Dispatch<React.SetStateAction<string>>,
    setShowEditE?: React.Dispatch<React.SetStateAction<boolean>>,
) {
    const onEditEChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setEVal(e.target.value);
            if (setShowEditE) {
                setShowEditE(true);
            }
        },
        []
    );

    return <TextArea
        autoSize={{minRows: 2, maxRows: 5}}
        placeholder="请输入E选项内容, 包括 E"
        onChange={onEditEChange}
        name="E"
        value={eVal}
    />
}

export function AddEInfoStyle(
    eVal: string,
    setEVal: React.Dispatch<React.SetStateAction<string>>,
    setShowEditE?: React.Dispatch<React.SetStateAction<boolean>>,
) {
    return <Row gutter={[10, 10]}>
        <Col span={24}>
            <div className="text-blue-700 text-[15px] mb-[10px] font-bold">E</div>
            {EInfo(eVal, setEVal, setShowEditE)}
        </Col>
    </Row>
}

export function EditEInfoStyle(
    eVal: string,
    setEVal: React.Dispatch<React.SetStateAction<string>>,
    questionInfo: QuestionInfo,
    setRefreshListNum: Dispatch<SetStateAction<number>>,
) {
    const [showEditE, setShowEditE] = React.useState(false);
    const [showEditEErr, setShowEditEErr] = React.useState<React.ReactNode>("");

    const updateEVal = () => {
        const req: EditE = {
            textbookKey: questionInfo.textbookKey,
            catalogKey: questionInfo.catalogKey,
            id: questionInfo.id,
            e: eVal,
        }
        httpClient.post("/edit/e", req).then((res) => {
            setShowEditEErr("");
            setShowEditE(false);
            setRefreshListNum(StringUtil.getRandomInt());
        }).catch((err) => {
            setShowEditEErr(<div>
                <Alert title={`更新E选项出错: ${err.message}`} type={"error"}/>
            </div>);
        })
    }

    const showEditEArea = <div className="mt-2.5">
        <Flex gap="small" wrap justify={"right"}>
            <Button color="cyan" variant="dashed" onClick={updateEVal}>更新</Button>
        </Flex>
    </div>

    return <div className="p-2.5 hover:border border-red-700 border-dashed">
        <div>
            {AddEInfoStyle(eVal, setEVal, setShowEditE)}
        </div>
        {showEditEErr}
        {showEditE && showEditEArea}
    </div>
}
