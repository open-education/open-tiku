import type {MenuProps} from "antd";
import {Layout, Menu} from "antd";
import {NavLink, Outlet} from "react-router";
import React, {useState} from "react";
import type {TiKuIndexContext} from "~/type/context";
import type {Textbook} from "~/type/textbook";

const {Header} = Layout;

// 题目首页
export default function Index(props: any) {
  const textbooks: Textbook[] = props.textbooks ?? [];
  const pathMap: Map<number, Textbook[]> = props.pathMap ?? {};

  // 递归生成树节点 - 菜单列表
  const get_items = (data: Textbook[]): Required<MenuProps>['items'][number][] => {
    return data.map((item) => ({
      key: item.id,
      // 只有第5层级需要添加链接, 否则只展示静态文本, 其它层级链接本身也没有可导航的目的地页面
      label: item.pathDepth == 5 ? <NavLink to={`${item.id}`}>{item.label}</NavLink> : item.label,
      // 递归逻辑：如果存在子节点，则再次调用自身, 菜单是直接渲染的, 如果没有就使用未定义即可
      children: item.children && item.children.length > 0
        ? get_items(item.children)
        : undefined
    }));
  };

  const [selectMenuKey, setSelectMenuKey] = useState<string>("");
  const onMenuClick: MenuProps["onClick"] = (e) => {
    setSelectMenuKey(e.key);
  };

  // 题库板块整体的菜单信息链路
  const [tikuIndexContent, _] = useState<TiKuIndexContext>({
    pathMap: pathMap,
  });

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
        <div className="text-white mr-2.5 text-[16px]"><NavLink to="/">开放题库</NavLink></div>
        <Menu
          theme="dark"
          selectedKeys={[selectMenuKey]}
          onClick={onMenuClick}
          mode="horizontal"
          items={get_items(textbooks)}
          style={{flex: 1, minWidth: 0}}
        />
      </Header>

      {/* Content */}
      <Layout>
        <Outlet context={tikuIndexContent}/>
      </Layout>
    </Layout>
  )
}
