import { Button, Col, Divider, Flex, Pagination, Row } from "antd";
import { useState } from "react";
import { NavLink } from "react-router";

// 试卷列表
export default function Index(props: any) {
  const testList = [
    {
      id: 1,
      title: "这是第一套试卷",
    },
    {
      id: 2,
      title: "这是第一套试卷",
    },
  ];

  // 分页信息
  const [pageNo, setPageNo] = useState<number>(1);
  const [testListResTotal, setTestListResTotal] = useState<number>(testList.length);
  const onPageChange = (page: number) => {
    setPageNo(page);
  };

  return (
    <div className="p-2.5 min-h-screen">
      {/* 操作区域 */}
      <Row gutter={[10, 10]} align={"middle"}>
        <Col span={24}>
          <Flex gap="small" wrap>
            <div className="inline-block leading-8.75 mr-2.5">快速入口:</div>

            <div className="inline-block leading-8.75 mr-2.5">
              <NavLink to="add">我要组卷</NavLink>
            </div>
          </Flex>
        </Col>
      </Row>

      <Divider size="small" />

      {/* 已有试卷列表 */}
      <div className="mt-2.5">
        {testList.map((item) => {
          return (
            <div key={item.id} className="mt-2">
              <NavLink to={item.id.toString()}>{item.title}</NavLink>
            </div>
          );
        })}
      </div>

      <Divider size="small" />

      {/* 分页 */}
      <div className="mt-2.5">
        <Pagination total={testListResTotal} current={pageNo} defaultPageSize={10} onChange={onPageChange} />
      </div>
    </div>
  );
}
