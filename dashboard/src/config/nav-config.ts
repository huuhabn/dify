import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Studio',
    items: [
      {
        title: 'Apps',
        url: '/dashboard/apps',
        icon: 'product',
        isActive: true,
        shortcut: ['a', 'p'],
        items: []
      },
      {
        title: 'Knowledge',
        url: '/dashboard/knowledge',
        icon: 'workspace',
        isActive: false,
        shortcut: ['k', 'n'],
        items: []
      },
      {
        title: 'Tools',
        url: '/dashboard/tools',
        icon: 'adjustments',
        isActive: false,
        shortcut: ['t', 'l'],
        items: []
      },
      {
        title: 'Plugins',
        url: '/dashboard/plugins',
        icon: 'code',
        isActive: false,
        shortcut: ['p', 'l'],
        items: []
      },
      {
        title: 'Explore',
        url: '/dashboard/explore',
        icon: 'sparkles',
        isActive: false,
        shortcut: ['e', 'x'],
        items: []
      }
    ]
  },
  {
    label: 'Settings',
    items: [
      {
        title: 'Account',
        url: '/dashboard/account',
        icon: 'account',
        isActive: false,
        items: []
      }
    ]
  }
];
