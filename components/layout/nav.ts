import { IconBuilding, IconDashboard, IconFolder, IconSearch, IconSettings } from './icons';

export const NAV = [
  { href: '/dashboard', label: 'Matches', icon: IconDashboard },
  { href: '/grants', label: 'All grants', icon: IconSearch },
  { href: '/applications', label: 'Applications', icon: IconFolder },
  { href: '/business-profile', label: 'Business profile', icon: IconBuilding },
  { href: '/settings', label: 'Settings', icon: IconSettings },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
