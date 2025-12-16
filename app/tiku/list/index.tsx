import {Layout, Menu, type MenuProps, Spin, theme} from "antd";
import type {QuestionType} from "~/type/question";
import type {TagInfo} from "~/type/tag";
import type {Catalog} from "~/type/catalog";
import type {KnowledgeInfo} from "~/type/knowledge-info";
import {ListInfo} from "~/tiku/list/list";
import React, {useEffect, useState} from "react";
import {LoadingOutlined} from "@ant-design/icons";
import {useNavigation} from "react-router";
import {HierarchicalDict} from "~/util/hierarchical-dict";

const {Content, Sider} = Layout;

export default function Index(props: any) {
  const {
    token: {colorBgContainer, borderRadiusLG},
  } = theme.useToken();

  const questionTypeList: QuestionType[] = props.questionTypeList ?? [];
  const tagList: TagInfo[] = props.tagList ?? [];
  const catalogList: Catalog[] = props.catalogList ?? [];
  const catalogDict: HierarchicalDict<Catalog> = props.catalogDict ?? new HierarchicalDict<Catalog>([]);
  const knowledgeInfoList: KnowledgeInfo[] = props.knowledgeInfoList ?? [];
  const knowledgeInfoDict: HierarchicalDict<KnowledgeInfo> = props.knowledgeInfoDict ?? new HierarchicalDict<KnowledgeInfo>([]);

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

  const useIsMobile = (breakpoint = 768) => {
    // 默认值（SSR 时使用）
    const [isMobile, setIsMobile] = useState(false);
    const [isSSR, setIsSSR] = useState(true);

    useEffect(() => {
      setIsSSR(false);
      const checkMobile = () => {
        setIsMobile(window.innerWidth < breakpoint);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);

      return () => window.removeEventListener('resize', checkMobile);
    }, [breakpoint]);

    return {isMobile, isSSR};
  };

  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  const showLeftOrTopMenu = () => {
    const {isMobile, isSSR} = useIsMobile();
    if (isSSR) {
      return <Spin indicator={<LoadingOutlined spin/>}/>
    }

    if (isMobile) {
      return <Layout style={{padding: "0 12px 12px"}}>
        <Menu
          mode="inline"
          defaultSelectedKeys={[leftMenuItemSelectKey]}
          defaultOpenKeys={[]}
          style={{borderInlineEnd: 0}}
          onClick={onLeftMenuClick}
          items={getLeftMenuItem()}
        />
      </Layout>
    }
    return <Sider
      theme={"light"}
      width={"21%"}
    >
      <Menu
        mode="inline"
        defaultSelectedKeys={[leftMenuItemSelectKey]}
        defaultOpenKeys={[]}
        style={{borderInlineEnd: 0}}
        onClick={onLeftMenuClick}
        items={getLeftMenuItem()}
      />
    </Sider>
  }

  return <div>
    {/* 中间内容体 */}
    <Layout>
      {isNavigating && <Spin indicator={<LoadingOutlined spin/>}/>}

      {/* 显示左侧或者顶部二级菜单, PC端显示左侧菜单, 其它端直接顶部显示即可 */}
      {showLeftOrTopMenu()}

      {/* 右边主体内容部分 */}
      <Layout style={{padding: "0 12px 12px", minHeight: "100vh"}}>
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
            catalogDict={catalogDict}
            knowledgeInfoDict={knowledgeInfoDict}
          />
        </Content>
      </Layout>
    </Layout>
  </div>
}