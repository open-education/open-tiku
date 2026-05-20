import { Col, Divider, Pagination, Row, Space, Typography } from "antd";

const { Text } = Typography;

// 查看任务列表
export function TaskList(props: any) {
  return (
    <>
      <Space orientation="vertical" size={"small"} style={{ display: "flex" }}>
        <Row gutter={[10, 10]} align="middle" className="text-sm text-blue-700 font-bold">
          <Col span={3}>上传日期</Col>
          <Col span={8}>标题</Col>
          <Col span={2}>作者</Col>
          <Col span={3}>处理日期</Col>
          <Col span={2}>处理状态</Col>
          <Col span={6}>处理结果</Col>
        </Row>

        <Row gutter={[10, 10]} align="middle" className="hover:bg-blue-100">
          <Col span={3}>2026-05-20 22:51</Col>
          <Col span={8}>题型S-6.3.1.3【有理数分类的理解】第1批</Col>
          <Col span={2}>huangxb</Col>
          <Col span={3}>2026-05-20 23:06</Col>
          <Col span={2}>
            <Text type="success">成功</Text>
          </Col>
          <Col span={6}></Col>
        </Row>

        <Row gutter={[10, 10]} align="middle" className="hover:bg-blue-100">
          <Col span={3}>2026-05-20 22:51</Col>
          <Col span={8}>题型S-6.3.1.3【有理数分类的理解】第2批</Col>
          <Col span={2}>huangxb</Col>
          <Col span={3}>2026-05-20 23:06</Col>
          <Col span={2}>
            <Text type="warning">处理中 </Text>
          </Col>
          <Col span={6}></Col>
        </Row>

        <Row gutter={[10, 10]} align="middle" className="hover:bg-blue-100">
          <Col span={3}>2026-05-20 22:51</Col>
          <Col span={8}>题型S-6.3.1.3【有理数分类的理解】第4批</Col>
          <Col span={2}>huangxb</Col>
          <Col span={3}>2026-05-20 23:06</Col>
          <Col span={2}>
            <Text type="secondary">待处理</Text>
          </Col>
          <Col span={6}></Col>
        </Row>

        <Row gutter={[10, 10]} align="middle" className="hover:bg-blue-100">
          <Col span={3}>2026-05-20 22:51</Col>
          <Col span={8}>题型S-6.3.1.3【有理数分类的理解】第3批</Col>
          <Col span={2}>huangxb</Col>
          <Col span={3}>2026-05-20 23:06</Col>
          <Col span={2}>
            <Text type="danger">失败</Text>
          </Col>
          <Col span={6}>
            第几个母题解析异常，根据你的代码，showDrawerNotice 函数的返回值是 boolean 类型（false 或 true）。这里提供几种写法，根据你的需求选
          </Col>
        </Row>

        <Pagination total={10} current={1} defaultPageSize={10} />
      </Space>
    </>
  );
}
