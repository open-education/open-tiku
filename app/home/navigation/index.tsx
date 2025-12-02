// 学科导航
import type {TabsProps} from "antd";
import {Alert, Card, Space, Tabs} from "antd";
import type {Tab} from "@rc-component/tabs/lib/interface";
import type {Publisher} from "~/type/guidance";

// 显示导航
const showNavigation = (guidanceList: Publisher[]) => {
    // 如果为空则返回没有配置的提示
    if (!guidanceList || guidanceList.length === 0) {
        return (
            <Alert
                title="Warning"
                description="没有配置出版社、学科等信息"
                type="warning"
                showIcon
            />
        );
    }

    // 定义出版社-学段-学科-科目结构
    let firstGuidanceList: TabsProps["items"] = [];

    // 根据后端结构处理出版社学科等导航信息
    for (let pressInfo of guidanceList) {
        // 第一级处理出版社
        let firstPressProps: Tab = {
            key: pressInfo.key,
            label: pressInfo.label,
            children: "",
        };

        if (!pressInfo.children || pressInfo.children.length === 0) {
            firstGuidanceList.push(firstPressProps);
            continue;
        }

        // 第二级处理学段类型
        let secondStageList: TabsProps["items"] = [];
        for (let stageInfo of pressInfo.children) {
            let stageProps: Tab = {
                key: stageInfo.key,
                label: stageInfo.label,
                children: "",
            };

            if (!stageInfo.children || stageInfo.children.length === 0) {
                secondStageList.push(stageProps);
                continue;
            }

            // 第三级处理科目
            let thirdGuidanceList: TabsProps["items"] = [];
            for (let guidanceInfo of stageInfo.children) {
                let guidance: Tab = {
                    key: guidanceInfo.key,
                    label: guidanceInfo.label,
                    children: "",
                };

                if (!guidanceInfo.children || guidanceInfo.children.length === 0) {
                    thirdGuidanceList.push(guidance);
                    continue;
                }

                // 第四级别处理年级
                guidance.children = (
                    <Space wrap={true} size={16}>
                        {guidanceInfo.children.map((gradeInfo) => {
                            return (
                                <Card
                                    size="small"
                                    title={gradeInfo.label}
                                    style={{width: 200}}
                                >
                                    <p>
                                        <a
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href={`/tiku/${gradeInfo.key}`}
                                        >
                                            题库
                                        </a>
                                    </p>
                                    <p>
                                        <a
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href="https://book.pep.com.cn/1411001117191/mobile/index.html"
                                        >
                                            电子教材
                                        </a>
                                    </p>
                                </Card>
                            );
                        })}
                    </Space>
                );
                thirdGuidanceList.push(guidance);
            }

            stageProps.children = <Tabs items={thirdGuidanceList}/>;
            secondStageList.push(stageProps);
        }

        firstPressProps.children = <Tabs items={secondStageList}/>;
        firstGuidanceList.push(firstPressProps);
    }

    return <Tabs tabPlacement={"start"} items={firstGuidanceList}/>;
};

export default function Navigation(props: any) {
    return (
        <div style={{border: "1px dotted blue", paddingBottom: "20px"}}>
            <div>
                <h3 style={{color: "blue", paddingLeft: "15px"}}>学科地图</h3>
            </div>
            <div>{showNavigation(props.guidance)}</div>
        </div>
    );
}
