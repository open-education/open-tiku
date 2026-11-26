import { useUserInfo } from '@/hooks/use-user';
import { checkAccess, filterMenuItems, getMenuMap } from '@/util/menu';
import { useMemo } from 'react';
import { useLocation } from 'react-router';

export function useCurrentMenu() {
  const { pathname } = useLocation();
  const user = useUserInfo();

  // 全量菜单映射表
  const menuMap = useMemo(() => getMenuMap(), []);

  // 当前用户过滤后的可用菜单项
  const finalMenuItems = useMemo(() => {
    return filterMenuItems(user);
  }, [user]);

  // 当前路径对应的菜单项
  const currentMenu = menuMap[pathname] || null;

  // 当前页面是否有权限访问
  const hasAccess = useMemo(() => {
    return checkAccess(user, currentMenu);
  }, [user, currentMenu]);

  return {
    currentPath: pathname,
    finalMenuItems,
    currentMenu,
    hasAccess,
  };
}
