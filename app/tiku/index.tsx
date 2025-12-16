// 题库首页布局
import type {MenuProps} from "antd";
import {Layout, Menu} from "antd";
import type {Subject} from "~/type/guidance";
import {NavLink, Outlet} from "react-router";
import React, {useState} from "react";
import type {TiKuIndexContext} from "~/type/context";
import {StringConst} from "~/util/string";
import type {SubjectDict} from "~/util/subject-dict";

const {Header} = Layout;

export default function Index(props: any) {
  const guidance: Subject[] = props.guidance ?? [];
  const subjectDict: SubjectDict = props.subjectDict ?? {};

  // 处理顶部菜单, 嵌套比较深, 考虑方便为主
  const getMenuItems = () => {
    type MenuItem = Required<MenuProps>['items'][number];

    // first subject
    let subjectItems: MenuItem[] = [];
    for (let subject of guidance) {
      let subjectItem: MenuItem = {
        key: subject.key,
        label: subject.label,
        children: []
      }

      // second publisher
      let publisherItems: MenuItem[] = [];
      const publishers = subject.children ?? [];
      for (let publisher of publishers) {
        let publisherItem: MenuItem = {
          key: publisher.key,
          label: publisher.label,
          children: []
        }

        // third stage
        let stageItems: MenuItem[] = [];
        const stages = publisher.children ?? [];
        for (let stage of stages) {
          // textbooks
          let textbookItems: MenuItem[] = [];
          const textbooks = stage.textbookList ?? [];
          for (let textbook of textbooks) {
            textbookItems.push({
              key: textbook.key,
              label: <NavLink to={`${textbook.key}${StringConst.chapter}`}>{textbook.label}</NavLink>,
            })
          }
          // knowledge
          let knowledgeItems: MenuItem[] = [];
          const knowledgeList = stage.knowledgeList ?? [];
          for (let knowledge of knowledgeList) {
            knowledgeItems.push({
              key: knowledge.key,
              label: <NavLink to={`${knowledge.key}${StringConst.knowledge}`}>{knowledge.label}</NavLink>
            })
          }

          // append virtual
          const virtualItems: MenuItem[] = [
            {
              key: `${stage.key}${StringConst.chapter}`,
              label: StringConst.chapterDesc,
              children: textbookItems
            },
            {
              key: `${stage.key}${StringConst.knowledge}`,
              label: StringConst.knowledgeDesc,
              children: knowledgeItems
            }
          ];

          let stageItem: MenuItem = {
            key: stage.key,
            label: stage.label,
            children: []
          }
          stageItem.children = virtualItems;

          stageItems.push(stageItem);
        }

        publisherItem.children = stageItems;
        publisherItems.push(publisherItem);
      }
      subjectItem.children = publisherItems;
      subjectItems.push(subjectItem);
    }

    return subjectItems;
  }

  const [selectMenuKey, setSelectMenuKey] = useState<string>("");
  const onMenuClick: MenuProps["onClick"] = (e) => {
    setSelectMenuKey(e.key);
  };

  const [tikuIndexContent, setTikuIndexContent] = useState<TiKuIndexContext>({
    subjectDict: subjectDict,
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
        <div className="text-white mr-[10px] text-[16px]"><NavLink to="/">开放题库</NavLink></div>
        <Menu
          theme="dark"
          selectedKeys={[selectMenuKey]}
          onClick={onMenuClick}
          mode="horizontal"
          items={getMenuItems()}
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
