'use client';

import { useMemo } from 'react';
import type { NavItem, NavGroup } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { authQueries } from '@/services/auth/queries';

export function useFilteredNavItems(items: NavItem[]) {
  const { data: user } = useQuery(authQueries.currentUser());
  const { data: workspacesData } = useQuery(authQueries.workspaces());

  const currentWorkspace = workspacesData?.workspaces.find((w) => w.current) || workspacesData?.workspaces[0];

  const accessContext = useMemo(() => {
    return {
      user,
      workspace: currentWorkspace,
      role: currentWorkspace?.role,
      hasWorkspace: !!currentWorkspace
    };
  }, [user, currentWorkspace]);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (!item.access) return true;
        if (item.access.requireOrg && !accessContext.hasWorkspace) return false;
        if (item.access.role && accessContext.role !== item.access.role) return false;
        return true;
      })
      .map((item) => {
        if (item.items && item.items.length > 0) {
          const filteredChildren = item.items.filter((childItem) => {
            if (!childItem.access) return true;
            if (childItem.access.requireOrg && !accessContext.hasWorkspace) return false;
            if (childItem.access.role && accessContext.role !== childItem.access.role) return false;
            return true;
          });
          return {
            ...item,
            items: filteredChildren
          };
        }
        return item;
      });
  }, [items, accessContext]);

  return filteredItems;
}

export function useFilteredNavGroups(groups: NavGroup[]) {
  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const filteredItems = useFilteredNavItems(allItems);

  return useMemo(() => {
    const filteredSet = new Set(filteredItems.map((item) => item.title));
    return groups
      .map((group) => ({
        ...group,
        items: filteredItems.filter((item) =>
          group.items.some((gi) => gi.title === item.title && filteredSet.has(gi.title))
        )
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, filteredItems]);
}
