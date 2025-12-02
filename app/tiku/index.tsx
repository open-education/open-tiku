// 题库首页布局
import {useEffect, useRef, useState} from "react";
import type {MenuProps} from "antd";
import {Layout, Menu, theme} from "antd";
import {Outlet} from "react-router";
import {useLocation, useNavigate} from 'react-router-dom';
import type {TiKuIndexContext} from "~/type/context";
import {httpClient} from "~/util/http";
import type {Catalog} from "~/type/catalog";
import type {QuestionType} from "~/type/question";
import type {TagInfo} from "~/type/tag";
import {StringUtil} from "~/util/string";

const {Header, Content, Sider} = Layout;

export default function Index(props: any) {
    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    const location = useLocation();
    // /tiku/pep_math_senior_1
    const textbookKey = location.pathname.split("/")[2];
    const navigate = useNavigate();
    const onMenuClick: MenuProps["onClick"] = (e) => {
        navigate(`/tiku/${e.key}`)
    };

    const initTiKuIndexContent: TiKuIndexContext = {
        textbookKey: textbookKey,
        catalogKey: "",
        catalogKeyChange: 0,
        subjectList: props.subjectList,
        catalogList: [],
        questionTypeList: [],
        tagList: []
    };
    const [tiKuIndexContent, setTiKuIndexContent] = useState<TiKuIndexContext>(initTiKuIndexContent)
    const tiKuIndexContentRef = useRef(tiKuIndexContent);

    const [leftCatalogInfo, setLeftCatalogInfo] = useState({
        open: "",
        key: "",
        catalogList: []
    });
    const onCatalogClick: MenuProps["onClick"] = (e) => {
        const _tiKuIndexContent = tiKuIndexContentRef.current;
        setTiKuIndexContent({
            textbookKey: textbookKey,
            catalogKey: e.key,
            catalogKeyChange: StringUtil.getRandomInt(),
            subjectList: props.subjectList,
            catalogList: _tiKuIndexContent.catalogList,
            questionTypeList: _tiKuIndexContent.questionTypeList,
            tagList: _tiKuIndexContent.tagList
        });
    }

    useEffect(() => {
        const fetchList = async () => {
            try {
                const [catalogList, questionTypeList, tagList] = await Promise.all([
                    httpClient.get<Catalog[]>(`/config/get-catalogs/${textbookKey}`),
                    httpClient.get<QuestionType[]>(`/config/get-question-types/${textbookKey}`),
                    httpClient.get<TagInfo[]>(`/config/get-tags/${textbookKey}`)
                ]);

                return {catalogList, questionTypeList, tagList}
            } catch (err) {
                console.error("fetchList", err);
            }
        }

        fetchList().then((res: any) => {
            const catalogList = res.catalogList;

            let defaultCatalogOpenKey = "";
            let defaultCatalogKey: string = "";
            if (catalogList && catalogList.length > 0) {
                let children: Catalog[] | undefined;
                defaultCatalogOpenKey = catalogList[0].key;
                children = catalogList[0].children;
                if (children && children.length > 0) {
                    defaultCatalogKey = children[0].key;
                }
            }

            setLeftCatalogInfo({
                open: defaultCatalogOpenKey,
                key: defaultCatalogKey,
                catalogList: catalogList
            });

            initTiKuIndexContent.catalogKey = defaultCatalogKey;
            initTiKuIndexContent.catalogList = catalogList;
            initTiKuIndexContent.questionTypeList = res.questionTypeList;
            initTiKuIndexContent.tagList = res.tagList;
            initTiKuIndexContent.textbookKey = textbookKey;
            setTiKuIndexContent(initTiKuIndexContent);

            tiKuIndexContentRef.current = initTiKuIndexContent;
        });
    }, [location.key]);

    return (
        <Layout>
            {/* 顶部导航 */}
            <Header
                style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "25px",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}
            >
                <div style={{color: "white", marginRight: "10px"}}>开放题库</div>
                <Menu
                    theme="dark"
                    onClick={onMenuClick}
                    selectedKeys={[textbookKey]}
                    mode="horizontal"
                    items={props.subjectList}
                    style={{flex: 1, minWidth: 0}}
                />
            </Header>

            {/* 中间内容体 */}
            <Layout>
                {/* 左边侧边栏目录 */}
                <Sider width={200} style={{background: "blue"}}>
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={[leftCatalogInfo.key]}
                        defaultOpenKeys={[leftCatalogInfo.open]}
                        style={{height: "100%", borderInlineEnd: 0}}
                        onClick={onCatalogClick}
                        items={leftCatalogInfo.catalogList}
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
                        <Outlet context={tiKuIndexContent}/>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    )
}
