import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  Heart,
  Leaf,
  Star,
} from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../../ui/sidebar/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu/dropdown-menu';

import styles from './AppSidebar.module.css';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isAlert?: boolean;
  color?: string;
}

const welcomeNav: NavItem[] = [{ title: 'Bem-vindo', href: '/', icon: Star }];

const personalNav: NavItem[] = [
  { title: 'Minhas Propriedades', href: '/properties', icon: LayoutDashboard },
  // { title: 'Documentos', href: '/documents', icon: FileText },
];

const adminNav: NavItem[] = [
  // { title: "Usuários", href: "/users", icon: User },
  // { title: "Permissões", href: "/permissions", icon: RollerCoaster },
];

// const teams = [];

export default function AppSidebar() {
  const user = useAuthStore((state) => state.user);

  const location = useLocation();
  const pathname = location.pathname;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { mutate: logout, isPending } = useLogout();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <Sidebar collapsible="icon" className={styles.sidebarBorder}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className={styles.orgTrigger}>
                  <div className={styles.orgLogo}>
                    <Leaf className={styles.icon} />
                  </div>
                  <div className={styles.textWrapper}>
                    <span className={styles.textTitle}>Sulflux</span>
                    {/* <span className={styles.textSubtitle}>Design Team</span> */}
                  </div>
                  {/* <ChevronsUpDown className={styles.iconRight} /> */}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              {/* {teams.length > 0 && (
                <DropdownMenuContent
                  className={styles.dropdownWidth}
                  align="start"
                  side="bottom"
                  sideOffset={4}
                >
                <DropdownMenuLabel>Times</DropdownMenuLabel>
                {teams.map((team) => (
                  <DropdownMenuItem key={team.name}>
                    <div
                      className={styles.teamColor}
                      style={{ backgroundColor: team.color}}
                    />
                    {team.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Plus className={styles.iconItem} />
                  Criar time
                </DropdownMenuItem>
              </DropdownMenuContent>
            )} */}
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {welcomeNav.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Boas-vindas</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {welcomeNav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >
                      <Link to={item.href}>
                        <item.icon className={styles.iconBase} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {personalNav.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Monitoramento</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {personalNav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >
                      <Link to={item.href}>
                        <item.icon className={styles.iconBase} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {adminNav.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >
                      <Link to={item.href}>
                        <item.icon className={styles.iconBase} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/settings'}>
              <Link to="/settings">
                <Settings className={styles.iconBase} />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton asChild isActive={pathname === '/health'}>
              <Link to="/health">
                <Heart className={styles.iconBase} />
                <span>Saúde</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <div className={styles.themeToggleWrapper}>
              {(
                [
                  { value: 'light', icon: Sun, label: 'Tema claro' },
                  { value: 'dark', icon: Moon, label: 'Tema escuro' },
                  { value: 'system', icon: Monitor, label: 'Tema do sistema' },
                ] as const
              ).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTheme(item.value)}
                  className={`${styles.themeButton} ${
                    mounted && theme === item.value
                      ? styles.themeButtonActive
                      : ''
                  }`}
                  aria-label={item.label}
                >
                  <item.icon className={styles.iconBase} />
                </button>
              ))}
            </div>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <div className={styles.avatarPlaceholder}>
                    <span>
                      {user?.name
                        ?.split(' ')
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase() || 'US'}
                    </span>
                  </div>
                  <div className={styles.textWrapper}>
                    <span className={styles.textTitle}>
                      {user?.name?.split(' ').slice(0, 2).join(' ') ||
                        'Usuário'}
                    </span>
                    <span className={styles.textSubtitle}>
                      {user?.email || 'Email não disponível'}
                    </span>
                  </div>
                  <ChevronDown className={styles.iconRight} />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={styles.dropdownWidth}
                align="start"
                side="top"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link to="/settings">Perfil e Conta</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className={styles.textDestructive}
                  disabled={isPending}
                  onClick={handleSubmit}
                >
                  {isPending ? 'Saindo...' : 'Sair'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
