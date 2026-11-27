import { Outlet } from 'react-router';

// 无布局页面, 比如投诉无需登陆
export default function NoLayout() {
  return (
    <div className="p-3">
      <Outlet />
    </div>
  );
}
