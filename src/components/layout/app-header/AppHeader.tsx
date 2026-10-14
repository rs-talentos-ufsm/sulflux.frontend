import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { SidebarTrigger } from '../../ui/sidebar/sidebar';
import { Separator } from '../../ui/separator/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../ui/breadcrumb/breadcrumb';
import { Button } from '../../ui/button/button';
import { Avatar, AvatarFallback } from '../../ui/avatar/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu/dropdown-menu';

import styles from './AppHeader.module.css';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { getUserAvatarInfo } from '@/utils/user';
import GlobalSearch from '../global-search/GlobalSearch';
import NotificationDropdown from '../notification-dropdown/NotificationDropdown';

const routeLabels: Record<string, string> = {
  properties: 'Minhas Propriedades',
  new: 'Novo Registro',
  map: 'Mapa de Talhões',
  carbon: 'Análise de Carbono',
  water: 'Balanço Hídrico',
  reports: 'Relatórios',
  documents: 'Documentos',
  assistant: 'Assistente Sulflux',
  season: 'Safras',
  settings: 'Configurações',
  field: 'Talhões',
  'field-results': 'Resultados do Talhão',
  'new-field': 'Novo Talhão',
  'monitoring-history': 'Histórico',
  'search-sicar': 'Consulta SICAR',
};

export default function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const pathname = location.pathname;

  const { mutate: logout, isPending } = useLogout();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logout();
  };

  const pathSegments = pathname.split('/').filter(Boolean);
  const isRoot = pathSegments.length === 0;

  const { userNamePreview, userInitials } = getUserAvatarInfo(user);

  return (
    <header className={styles.header}>
      <SidebarTrigger className={styles.triggerOffset} />
      <Separator orientation="vertical" className={styles.separator} />

      <Breadcrumb className={styles.breadcrumbWrapper}>
        <BreadcrumbList className={styles.breadcrumbList}>
          <BreadcrumbItem>
            <Link to="/properties" className={styles.breadcrumbLinkText}>
              Sulflux
            </Link>
          </BreadcrumbItem>

          <BreadcrumbSeparator className={styles.breadcrumbSeparator} />

          {isRoot ? (
            <BreadcrumbItem>
              <BreadcrumbPage className={styles.breadcrumbPage}>
                Visão Geral
              </BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            pathSegments.map((segment, index) => {
              const isLast = index === pathSegments.length - 1;
              const label = routeLabels[segment] || segment;
              const routeTo = `/${pathSegments.slice(0, index + 1).join('/')}`;

              return (
                <React.Fragment key={segment}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className={styles.breadcrumbPage}>
                        {label}
                      </BreadcrumbPage>
                    ) : (
                      <Link to={routeTo} className={styles.breadcrumbLinkText}>
                        {label}
                      </Link>
                    )}
                  </BreadcrumbItem>

                  {!isLast && (
                    <BreadcrumbSeparator
                      className={styles.breadcrumbSeparator}
                    />
                  )}
                </React.Fragment>
              );
            })
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className={styles.rightSection}>
        {/* Barra de Busca Global Multifacetada */}
        <GlobalSearch />

        {/* Dropdown de Notificações & Eventos */}
        <NotificationDropdown />

        {/* Menu do Usuário com Avatar e Ações */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={styles.avatarButton}>
              <Avatar className={styles.avatar}>
                <AvatarFallback className={styles.avatarFallbackText}>
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={styles.dropdownContent}
            align="end"
            sideOffset={4}
          >
            <div className={styles.userInfo}>
              <Avatar className={styles.avatar}>
                <AvatarFallback className={styles.avatarFallbackText}>
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className={styles.userTextWrapper}>
                <span className={styles.userName}>{userNamePreview}</span>
                <span className={styles.userEmail}>
                  {user?.email || 'Email não disponível'}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">Perfil e Conta</Link>
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
      </div>
    </header>
  );
}
