# 主题

## 1. 基础大背景与全局主文字

--background：控制整个网页的最底层大背景如 body 的底色

--foreground：控制全站默认的普通文本, 正文颜色

## 2. 区块与弹窗容器

--card：控制独立区块容器如 Card 卡片组件, 内容面板, 列表项底色

--card-foreground：控制卡片组件内部的标题和正文文字颜色

--popover：控制所有悬浮层容器如 Dialog 弹窗、Dropdown 下拉菜单, Tooltip 气泡提示的底色

--popover-foreground：控制悬浮层, 弹窗内部的文字颜色

## 3. 系统主题色交互

--primary：控制系统的品牌主色调如: 默认强强调按钮 Button, 高亮选中的 Tabs, 核心复选框的背景色

--primary-foreground：控制品牌主色背景之上的文字颜色通常是反差极大的白色或全黑, 确保能看清

## 4. 次要交互与柔和对比

--secondary：控制次要行动组件如次要按钮 Button variant="secondary" 的背景色

--secondary-foreground：控制次要组件内部的文字颜色

--muted：控制需要刻意淡化, 沉下去的背景如表格的表头背景 thead, 禁用状态下的输入框, 或者需要和主背景隔离开的装饰条

--muted-foreground：控制次要, 辅助性文字如副标题, 创建时间, 表单底部的灰色提示词等

## 5. 悬浮高亮与危险操作

--accent：控制鼠标悬浮 Hover 或聚焦 Focus 时的突显背景色如菜单项在鼠标划过时的灰色底, 列表行悬浮变色

--accent-foreground：控制悬浮高亮状态下的文字颜色

--destructive：控制危险/破坏性操作如"删除", "注销"等按钮 variant="destructive" 的红色底色, 或表单校验报错时的警告色

## 6. 表单, 线框与焦点

--border：控制系统内所有常规分割线和组件边框如卡片边框, 表格横线, Divider 分割线

--input：专门控制表单输入框 Input, Textarea 的边框线颜色

--ring：控制元素被聚焦 Focus或选中时, 外围那一圈发光的"键盘导航焦点环/光晕", 常用于无障碍可访问性交互

## 7. 图表系列色

--chart-1 ~ --chart-5：专门用于控制 Shadcn UI 中由 Recharts 渲染的数据图表颜色如折线图, 柱状图, 饼图的 5 种自适应自备颜色系列

## 8. 全局圆角配置

--radius：控制全站组件的基础圆角大小, 按钮, 卡片, 弹窗的圆角都会基于这个值进行等比例自动缩放计算
