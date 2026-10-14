import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  Leaf,
  Star,
  Map as MapIcon,
  Droplets,
  BarChart3,
  Bot,
  Building2,
  Tractor,
  Users,
  Briefcase,
  Plus,
  Check,
  ChevronsUpDown,
} from 'lucide-react';

import { useTheme } from '../../../hooks/useTheme';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useProperties } from '@/hooks/useProperty';
import { useTenantStore, type TenantType } from '@/store/tenantStore';
import { getUserAvatarInfo } from '@/utils/user';
import NewClientDialog from '@/components/dialogs/new-client-dialog/NewClientDialog';

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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu/dropdown-menu';

import styles from './AppSidebar.module.css';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
}

const welcomeNav: NavItem[] = [{ title: 'Bem-vindo', href: '/', icon: Star }];

const personalNav: NavItem[] = [
  { title: 'Minhas Propriedades', href: '/properties', icon: LayoutDashboard },
  { title: 'Mapa de Talhões', href: '/map', icon: MapIcon },
  { title: 'Análise de Carbono', href: '/carbon', icon: Leaf },
  { title: 'Análise Hídrica', href: '/water', icon: Droplets },
  { title: 'Relatórios', href: '/reports', icon: BarChart3 },
  { title: 'Assistente Sulflux', href: '/assistant', icon: Bot },
];

function getClientIcon(type: TenantType) {
  switch (type) {
    case 'PRODUCER':
      return Tractor;
    case 'COOPERATIVE':
      return Users;
    case 'CONSULTANCY':
      return Briefcase;
    case 'COMPANY':
    default:
      return Building2;
  }
}

function getClientTypeLabel(type: TenantType) {
  switch (type) {
    case 'PRODUCER':
      return 'Produtor Rural';
    case 'COOPERATIVE':
      return 'Cooperativa';
    case 'CONSULTANCY':
      return 'Consultoria';
    case 'COMPANY':
    default:
      return 'Empresa Agrícola';
  }
}

export default function AppSidebar() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const pathname = location.pathname;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [newClientOpen, setNewClientOpen] = useState(false);

  const {
    clients,
    activeClientId,
    activePropertyId,
    setActiveClient,
    setActiveProperty,
  } = useTenantStore();

  const { data: propertiesData } = useProperties({ page: 1, limit: 50 });
  const properties = propertiesData?.data || [];

  const activeClient =
    clients.find((c) => c.id === activeClientId) || clients[0];
  const activeProperty = properties.find((p) => p.id === activePropertyId);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { mutate: logout, isPending } = useLogout();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logout();
  };

  const { userNamePreview, userInitials } = getUserAvatarInfo(user);
  const ActiveIcon = getClientIcon(activeClient?.type || 'COMPANY');

  return (
    <>
      <Sidebar collapsible="icon" className={styles.sidebarBorder}>
        {/* HEADER: SELETOR DE CLIENTE/EMPRESA E FAZENDA */}
        <SidebarHeader className={styles.header}>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className={styles.orgTrigger}>
                    <div
                      className={styles.orgLogo}
                      style={{
                        backgroundColor:
                          activeClient?.color || 'var(--primary)',
                      }}
                    >
                      <ActiveIcon className={styles.iconBase} />
                    </div>

                    <div className={styles.textWrapper}>
                      <span className={styles.textTitle}>
                        {activeClient?.name || 'Sulflux'}
                      </span>
                      <span className={styles.textSubtitle}>
                        {activeProperty
                          ? activeProperty.name
                          : `${properties.length} ${
                              properties.length === 1 ? 'fazenda' : 'fazendas'
                            }`}
                      </span>
                    </div>

                    <ChevronsUpDown className={styles.iconRight} />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className={styles.orgDropdownWidth}
                  align="start"
                  side="bottom"
                  sideOffset={6}
                >
                  {/* Seção 1: Produtores / Clientes / Empresas */}
                  <DropdownMenuLabel className={styles.sectionHeader}>
                    <span>Produtores & Clientes</span>
                    <span style={{ fontSize: '0.625rem', opacity: 0.7 }}>
                      {clients.length} disponíveis
                    </span>
                  </DropdownMenuLabel>

                  {clients.map((client) => {
                    const isSelected = client.id === activeClientId;
                    const ClientIcon = getClientIcon(client.type);

                    return (
                      <DropdownMenuItem
                        key={client.id}
                        onClick={() => setActiveClient(client.id)}
                        className={styles.clientItem}
                      >
                        <div className={styles.clientLeft}>
                          <div
                            className={styles.clientDot}
                            style={{
                              backgroundColor: client.color || 'var(--primary)',
                            }}
                          />
                          <ClientIcon
                            style={{
                              width: '0.875rem',
                              height: '0.875rem',
                              color: 'var(--muted-foreground)',
                              flexShrink: 0,
                            }}
                          />
                          <div className={styles.clientInfo}>
                            <span className={styles.clientName}>
                              {client.name}
                            </span>
                            <span className={styles.clientType}>
                              {getClientTypeLabel(client.type)}
                            </span>
                          </div>
                        </div>

                        {isSelected && <Check className={styles.activeCheck} />}
                      </DropdownMenuItem>
                    );
                  })}

                  <DropdownMenuItem
                    onClick={() => setNewClientOpen(true)}
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center',
                      color: 'var(--primary)',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus className={styles.iconItem} />
                    <span>Novo Produtor ou Empresa</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Seção 2: Fazendas / Propriedades do Contexto */}
                  <DropdownMenuLabel className={styles.sectionHeader}>
                    <span>Fazendas Cadastradas</span>
                    <span style={{ fontSize: '0.625rem', opacity: 0.7 }}>
                      {properties.length}
                    </span>
                  </DropdownMenuLabel>

                  {properties.length === 0 ? (
                    <div
                      style={{
                        padding: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--muted-foreground)',
                        textAlign: 'center',
                      }}
                    >
                      Nenhuma propriedade cadastrada ainda.
                    </div>
                  ) : (
                    properties.map((prop) => {
                      const isSelected = prop.id === activePropertyId;

                      return (
                        <DropdownMenuItem
                          key={prop.id}
                          onClick={() => setActiveProperty(prop.id)}
                          className={styles.farmItem}
                        >
                          <div className={styles.farmLeft}>
                            <Leaf
                              style={{
                                width: '0.875rem',
                                height: '0.875rem',
                                color:
                                  prop.status === 'ACTIVE'
                                    ? 'var(--primary)'
                                    : 'var(--muted-foreground)',
                                flexShrink: 0,
                              }}
                            />
                            <div className={styles.farmInfo}>
                              <span className={styles.farmName}>
                                {prop.name}
                              </span>
                              <span className={styles.farmDetail}>
                                {prop.location} •{' '}
                                {prop.status === 'ACTIVE'
                                  ? 'Ativa'
                                  : 'Configuração'}
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className={styles.activeCheck} />
                          )}
                        </DropdownMenuItem>
                      );
                    })
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link
                      to="/properties/new"
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                      }}
                    >
                      <Plus className={styles.iconItem} />
                      <span>Cadastrar Nova Fazenda</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      to="/properties"
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                      }}
                    >
                      <LayoutDashboard className={styles.iconItem} />
                      <span>Ver Todas as Propriedades</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
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
        </SidebarContent>

        {/* FOOTER: CONFIGURAÇÕES, TEMA E PERFIL */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/settings'}>
                <Link to="/settings">
                  <Settings className={styles.iconBase} />
                  <span>Configurações</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <div className={styles.themeToggleWrapper}>
                {(
                  [
                    { value: 'light', icon: Sun, label: 'Tema claro' },
                    { value: 'dark', icon: Moon, label: 'Tema escuro' },
                    {
                      value: 'system',
                      icon: Monitor,
                      label: 'Tema do sistema',
                    },
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
                  <SidebarMenuButton size="lg" className={styles.orgTrigger}>
                    <div className={styles.avatarPlaceholder}>
                      {userInitials}
                    </div>
                    <div className={styles.textWrapper}>
                      <span className={styles.textTitle}>
                        {userNamePreview}
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
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/settings"
                      style={{ display: 'flex', width: '100%' }}
                    >
                      Perfil e Conta
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={styles.textDestructive}
                    disabled={isPending}
                    onClick={handleSubmit}
                  >
                    {isPending ? 'Saindo...' : 'Sair da Conta'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <NewClientDialog open={newClientOpen} onOpenChange={setNewClientOpen} />
    </>
  );
}
