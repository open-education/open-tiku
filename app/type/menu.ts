import type { UserRoleType } from '@/type/enum';
import type { LucideIcon } from 'lucide-react';

// 菜单项配置
export interface OpsMenu {
  title: string;
  url: string;
  icon: LucideIcon;
  login: boolean;
  role: UserRoleType;
  items?: OpsMenuItem[];
}

export interface OpsMenuItem {
  title: string;
  url: string;
  login: boolean;
  role: UserRoleType;
}
