import {Layout, Menu, type MenuProps, theme} from "antd";
import type {QuestionType} from "~/type/question";
import type {TagInfo} from "~/type/tag";
import type {Catalog} from "~/type/catalog";
import type {KnowledgeInfo} from "~/type/knowledge-info";
import {ListInfo} from "~/tiku/list/list";
import React from "react";

const {Content, Sider} = Layout;

export default function Index(props: any) {
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    const questionTypeList: QuestionType[] = props.questionTypeList ?? [];
    const tagList: TagInfo[] = props.tagList ?? [];
    const catalogList: Catalog[] = props.catalogList ?? [];
    const knowledgeInfoList: KnowledgeInfo[] = props.knowledgeInfoList ?? [];

    type MenuItem = Required<MenuProps>['items'][number];
    const getLeftMenuItem = () => {
        let leftMenuItems: MenuItem[] = [];
        if (catalogList && catalogList.length > 0) {
            // @ts-ignore
            leftMenuItems = catalogList;
        } else if (knowledgeInfoList && knowledgeInfoList.length > 0) {
            // @ts-ignore
            leftMenuItems = knowledgeInfoList;
        }
        return leftMenuItems;
    }

    const [leftMenuItemSelectKey, setLeftMenuItemSelectKey] = React.useState<string>("");
    const [leftMenuItemSelectKeyPath, setLeftMenuItemSelectKeyPath] = React.useState<string[]>([]);
    const onLeftMenuClick: MenuProps["onClick"] = (e) => {
        setLeftMenuItemSelectKey(e.key);
        setLeftMenuItemSelectKeyPath(e.keyPath);
    }

    return <div>
        {/* 中间内容体 */}
        <Layout>
            {/* 左边侧边栏目录 */}
            <Sider width={400} style={{background: "blue"}}>
                <Menu
                    mode="inline"
                    defaultSelectedKeys={[leftMenuItemSelectKey]}
                    defaultOpenKeys={[]}
                    style={{height: "100%", borderInlineEnd: 0}}
                    onClick={onLeftMenuClick}
                    items={getLeftMenuItem()}
                />
            </Sider>

            {/* 右边主体内容部分 */}
            <Layout style={{padding: "0 24px 24px", height: "100%"}}>
                {/* 导航对应的实际内容 */}
                <Content
                    style={{
                        padding: 24,
                        margin: 0,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <ListInfo
                        questionTypeList={questionTypeList}
                        tagList={tagList}
                        leftMenuItemSelectKey={leftMenuItemSelectKey}
                        leftMenuItemSelectKeyPath={leftMenuItemSelectKeyPath}
                        catalogList={catalogList}
                        knowledgeInfoList={knowledgeInfoList}
                    />
                </Content>
            </Layout>
        </Layout>
    </div>
}