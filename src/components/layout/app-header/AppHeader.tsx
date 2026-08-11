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
// import { Input } from "@/components/ui/input"
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

const routeLabels: Record<string, string> = {
  '/': 'Minhas Propriedades',
  '/settings': 'Notificacoes',
};

export default function AppHeader() {
  const user = useAuthStore((state) => state.user);

  const location = useLocation();
  const pathname = location.pathname;
  const currentLabel = routeLabels[pathname] || 'Pagina';

  const { mutate: logout, isPending } = useLogout();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logout();
  };

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

          <BreadcrumbItem>
            <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className={styles.rightSection}>
        {/* <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar na sua jornada..."
            className="h-8 w-56 bg-background pl-8 text-sm"
          />
        </div> */}

        {/* <Button variant="ghost" size="icon" className="relative h-8 w-8" asChild>
          <Link href="/notificacoes">
            <Bell className="size-4" />
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              3
            </span>
            <span className="sr-only">Notificacoes</span>
          </Link>
        </Button> */}

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
            {/* <DropdownMenuItem>Ajuda</DropdownMenuItem> */}
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
