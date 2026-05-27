import { Alert, Layout, Menu, type MenuProps, Spin, theme } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { useNavigation } from "react-router";
import type { Textbook, TextbookOtherDict } from "~/type/textbook";
import { httpClient } from "~/util/http";
import { useLocation, useOutletContext } from "react-router-dom";
import type { TiKuIndexContext } from "~/type/context";
import { ListInfo } from "~/tiku/list/list";
import { StringUtil } from "~/util/string";

const { Content, Sider } = Layout;

// 教材目录和知识点
export default function Index(props: any) {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = useLocation();
  const pathname = StringUtil.getLastPart(location.pathname, "/");
  const fiveLevelId: number = Number(pathname ?? 0);

  // 从父组件中获取全局菜单字典
  const { pathMap } = useOutletContext<TiKuIndexContext>();

  // 教材目录和知识点列表
  const textbooks: Textbook[] = props.textbooks ?? [];
  const childPathMap: Map<string, Textbook[]> = props.childPathMap ?? [];

  // 5层深度时才能添加题目和查看题目列表, 但是题目类型和标签再2层深度上, 因此只要有2层深度就可以把题型类型和标签返回, 后续如果有优化再处理
  const textbookId = useMemo(() => {
    const nodes = pathMap.get(fiveLevelId.toString()) ?? [];
    return nodes.length > 2 ? nodes[1].id : 0;
  }, [fiveLevelId, pathMap]);

  // 请求错误
  const [reqError, setReqError] = useState<React.ReactNode>("");

  // 题型列表
  const [questionTypeList, setQuestionTypeList] = useState<TextbookOtherDict[]>([]);
  // 标签列表
  const [questionTagList, setQuestionTagList] = useState<TextbookOtherDict[]>([]);

  // 路由加载时获取题型和标签列表
  useEffect(() => {
    // 没有有效的教材标识则无法查询
    if (textbookId <= 0) {
      return;
    }

    // 类型是在第三级上, 需要往上找-pathMap
    httpClient
      .get<TextbookOtherDict[]>(`/other/dict/list/${textbookId}/question_type`)
      .then((res) => {
        setQuestionTypeList(res);
      })
      .catch((err) => {
        setReqError(<Alert title={`题型信息获取失败: ${err}`} type={"error"} />);
      });
    httpClient
      .get<TextbookOtherDict[]>(`/other/dict/list/${textbookId}/question_tag`)
      .then((res) => {
        setQuestionTagList(res);
      })
      .catch((err) => {
        setReqError(<Alert title={`标签信息获取失败: ${err}`} type={"error"} />);
      });
  }, []);

  // 递归生成树节点 - 菜单列表
  const get_items = (data: Textbook[]): Required<MenuProps>["items"][number][] => {
    return data.map((item) => ({
      key: item.id,
      label: item.label,
      // 递归逻辑：如果存在子节点，则再次调用自身, 菜单是直接渲染的, 如果没有就使用未定义即可
      children: item.children && item.children.length > 0 ? get_items(item.children) : undefined,
    }));
  };

  // 题型标识, 目前其它导航栏标识暂时未对应题目, 后续可能需要支持
  const [questionCateId, setQuestionCateId] = useState<string>("");
  const [cateKeyPath, setCateKeyPath] = useState<string[]>([]);
  const onLeftMenuClick: MenuProps["onClick"] = (e) => {
    setQuestionCateId(e.key);
    setCateKeyPath(e.keyPath);
  };

  // 检测是否是较小屏幕
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
      window.addEventListener("resize", checkMobile);

      return () => window.removeEventListener("resize", checkMobile);
    }, [breakpoint]);

    return { isMobile, isSSR };
  };

  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  const showLeftOrTopMenu = () => {
    const { isMobile, isSSR } = useIsMobile();
    if (isSSR) {
      return <Spin indicator={<LoadingOutlined spin />} />;
    }

    if (isMobile) {
      return (
        <Layout style={{ padding: "0 12px 12px" }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={[questionCateId]}
            defaultOpenKeys={[]}
            style={{ borderInlineEnd: 0 }}
            onClick={onLeftMenuClick}
            items={get_items(textbooks)}
          />
        </Layout>
      );
    }
    return (
      <Sider theme={"light"} width={"21%"}>
        <Menu
          mode="inline"
          defaultSelectedKeys={[questionCateId]}
          defaultOpenKeys={[]}
          style={{ borderInlineEnd: 0 }}
          onClick={onLeftMenuClick}
          items={get_items(textbooks)}
        />
      </Sider>
    );
  };

  return (
    <div>
      {/* 中间内容体 */}
      <Layout>
        {reqError}

        {isNavigating && <Spin indicator={<LoadingOutlined spin />} />}

        {/* 显示左侧或者顶部二级菜单, PC端显示左侧菜单, 其它端直接顶部显示即可 */}
        {showLeftOrTopMenu()}

        {/* 右边主体内容部分 */}
        <Layout style={{ padding: "0 12px 12px", minHeight: "100vh" }}>
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
              questionTagList={questionTagList}
              questionCateId={questionCateId}
              textbookId={textbookId}
              cateKeyPath={cateKeyPath}
              childPathMap={childPathMap}
            />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}
