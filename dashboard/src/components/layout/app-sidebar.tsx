'use client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navGroups } from '@/config/nav-config';
import { useFilteredNavGroups } from '@/hooks/use-nav';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authQueries, authMutations } from '@/services/auth/queries';
import Cookies from 'js-cookie';

const itemClass =
  'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground data-active:hover:bg-sidebar-accent [&>svg]:text-sidebar-foreground/60 data-active:[&>svg:first-child]:text-sidebar-primary';
const branchActiveClass =
  'font-medium text-sidebar-foreground [&>svg:first-child]:text-sidebar-primary';
const subItemClass =
  'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground data-active:hover:bg-sidebar-accent';
const railPadding = 'group-data-[collapsible=icon]:px-1';

export default function AppSidebar() {
  const pathname = usePathname();
  const filteredGroups = useFilteredNavGroups(navGroups);

  return (
    <Sidebar collapsible='icon' variant='inset'>
      <SidebarHeader className={railPadding}>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        {filteredGroups.map((group) => (
          <SidebarGroup key={group.label || 'ungrouped'} className={railPadding}>
            {group.label && (
              <SidebarGroupLabel className='group-data-[collapsible=icon]:pointer-events-none'>
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarMenu className='gap-0.5'>
              {group.items.map((item) => (
                <NavMainItem key={item.title} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className={railPadding}>
        <NavUser />
      </SidebarFooter>
      <SidebarRail className='hover:after:bg-transparent' />
    </Sidebar>
  );
}

function isActivePath(pathname: string, url: string) {
  return pathname === url || (url !== '/' && url !== '#' && pathname.startsWith(`${url}/`));
}

function NavMainItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const Icon = item.icon ? Icons[item.icon] : Icons.logo;
  const children = item.items ?? [];
  const closeMobile = () => setOpenMobile(false);

  if (children.length === 0) {
    const active = isActivePath(pathname, item.url);
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          render={
            <Link
              href={item.url}
              aria-label={item.title}
              aria-current={active ? 'page' : undefined}
            />
          }
          tooltip={item.title}
          isActive={active}
          className={itemClass}
          onClick={closeMobile}
        >
          <Icon />
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const hasActiveChild = children.some((child) => isActivePath(pathname, child.url));
  const branchActive = hasActiveChild && !isActivePath(pathname, item.url);

  return (
    <Collapsible defaultOpen={item.isActive || hasActiveChild} render={<SidebarMenuItem />}>
      <CollapsibleTrigger
        render={
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActivePath(pathname, item.url)}
            className={cn('group/collapsible', itemClass, branchActive && branchActiveClass)}
          />
        }
      >
        {item.icon && <Icon />}
        <span>{item.title}</span>
        <Icons.chevronRight className='ml-auto transition-transform duration-200 group-data-panel-open/collapsible:rotate-90' />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub className='gap-0.5 py-1'>
          {children.map((child) => {
            const active = isActivePath(pathname, child.url);
            return (
              <SidebarMenuSubItem key={child.title}>
                <SidebarMenuSubButton
                  render={
                    <Link
                      href={child.url}
                      aria-label={child.title}
                      aria-current={active ? 'page' : undefined}
                    />
                  }
                  isActive={active}
                  className={subItemClass}
                  onClick={closeMobile}
                >
                  <span>{child.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

function NavUser() {
  const { data: user } = useQuery(authQueries.currentUser());
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isMobile, state } = useSidebar();
  const railMenu = state === 'collapsed' && !isMobile;

  const logoutMutation = useMutation({
    ...authMutations.logout,
    onSettled: () => {
      Cookies.remove('console_token');
      queryClient.clear();
      router.push('/signin');
    }
  });

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size='lg'
                className='data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground'
              />
            }
          >
            {user && <UserAvatarProfile className='size-8 rounded-lg' showInfo user={user} />}
            <Icons.chevronsUpDown className='text-muted-foreground ml-auto size-4' />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={isMobile ? 'w-(--anchor-width) min-w-60' : 'w-64'}
            side={isMobile ? 'top' : 'right'}
            align={isMobile ? 'start' : 'end'}
            sideOffset={isMobile ? 4 : railMenu ? 16 : 8}
            alignOffset={isMobile ? 0 : -8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className='text-foreground px-1.5 py-1.5 font-normal'>
                {user && <UserAvatarProfile className='size-8 rounded-lg' showInfo user={user} />}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/dashboard/account')}>
                <Icons.account />
                Account Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                <Icons.logout aria-hidden />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
