// 网站首页

import {Layout, Menu, theme} from "antd";
import {Outlet} from "react-router";
import Navigation from "./navigation";

const {Header, Content, Footer} = Layout;

const items = [
    {
        key: 1,
        label: "题库",
    },
    {
        key: 2,
        label: "组卷",
    },
    {
        key: 3,
        label: "真题",
    },
    {
        key: 20,
        label: "文档",
    },
];

export default function HomeIndex(props: any) {
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    return (
        <Layout>
            <Header
                style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "25px",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                }}
            >
                <div className="text-white mr-2">开放题库</div>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={["2"]}
                    items={items}
                    style={{flex: 1, minWidth: 0}}
                />
            </Header>

            <Content className="p-10">
                <div
                    style={{
                        background: colorBgContainer,
                        minHeight: 280,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <div>
                        <Navigation guidance={props.guidance}/>
                    </div>

                    <div>
                        <Outlet/>
                    </div>
                </div>
            </Content>

            <Footer className="text-center">
                Ant Design ©{new Date().getFullYear()} Created by Ant UED
            </Footer>
        </Layout>
    );
}
