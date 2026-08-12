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
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar/avatar';
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

// Dicionário mapeando cada segmento isolado da URL para seu respectivo rótulo
const routeLabels: Record<string, string> = {
  properties: 'Minhas Propriedades',
  new: 'Nova Propriedade',
  details: 'Detalhes da Propriedade',
  settings: 'Notificações',
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

  // Separa o pathname em um array removendo barras vazias
  // Ex: '/properties/new' -> ['properties', 'new']
  const pathSegments = pathname.split('/').filter(Boolean);
  const isRoot = pathSegments.length === 0;

  return (
    <header className={styles.header}>
      <SidebarTrigger className={styles.triggerOffset} />
      <Separator orientation="vertical" className={styles.separator} />

      <Breadcrumb className={styles.breadcrumbWrapper}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span className={styles.mutedText}>Sulflux</span>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          {/* Caso esteja na raiz, força a renderização de "Minhas Propriedades" */}
          {isRoot ? (
            <BreadcrumbItem>
              <BreadcrumbPage>Minhas Propriedades</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            // Itera sobre os fragmentos para construir o pão de migalhas
            pathSegments.map((segment, index) => {
              const isLast = index === pathSegments.length - 1;
              const label = routeLabels[segment] || segment;

              return (
                <React.Fragment key={segment}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{label}</BreadcrumbPage>
                    ) : (
                      <span className={styles.mutedText}>{label}</span>
                    )}
                  </BreadcrumbItem>

                  {/* Só renderiza o separador se não for o último item */}
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className={styles.rightSection}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={styles.avatarButton}>
              <Avatar className={styles.avatar}>
                <AvatarImage
                  src="/placeholder.svg"
                  alt={`Foto do ${user?.name?.split(' ').slice(0, 2).join(' ') || 'Usuário'}`}
                />
                <AvatarFallback className={styles.avatarFallbackText}>
                  {user?.name
                    ?.split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'US'}
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
              <Avatar>
                <AvatarFallback className={styles.avatarFallbackText}>
                  {user?.name
                    ?.split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'US'}
                </AvatarFallback>
              </Avatar>
              <div className={styles.userTextWrapper}>
                <span className={styles.userName}>
                  {user?.name?.split(' ').slice(0, 2).join(' ') || 'Usuário'}
                </span>
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
              {isPending ? 'Saindo...' : 'Sair'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
