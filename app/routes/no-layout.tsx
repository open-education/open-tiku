import { Outlet } from 'react-router';

// 无布局页面, 比如特定的编辑添加页面等
export default function NoLayout() {
  return (
    <div className="p-3">
      <Outlet />
    </div>
  );
}
