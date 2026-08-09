import * as React from 'react';
import styles from './Sidebar.module.css';
import { Slot } from '@radix-ui/react-slot';
import { PanelLeft } from 'lucide-react';

// ui
import { TooltipProvider } from '../tooltip/tooltip';
import { Sheet, SheetContent } from '../sheet/sheet';
import { Tooltip, TooltipTrigger, TooltipContent } from '../tooltip/tooltip';

// hooks
import { useIsMobile } from '../../../hooks/useMobile';
import { useSidebar } from '../../../hooks/useSidebar';

// Constantes estruturais
const SIDEBAR_COOKIE_NAME = 'sidebar:state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

export type SidebarContextType = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

// Criando e exportando o contexto para o hook isolado (useSidebar)
export const SidebarContext = React.createContext<SidebarContextType | null>(
  null,
);

// Provider
export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);

    // Estado interno controlado por cookies ou propriedades
    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp ?? _open;

    const setOpen = React.useCallback(
      (value: boolean) => {
        if (setOpenProp) {
          setOpenProp(value);
        } else {
          _setOpen(value);
        }

        document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [setOpenProp],
    );

    const toggleSidebar = React.useCallback(() => {
      return isMobile ? setOpenMobile(!openMobile) : setOpen(!open);
    }, [isMobile, open, openMobile, setOpen]);

    // Atalho global (Ctrl + B ou Cmd + B)
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault();
          toggleSidebar();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleSidebar]);

    const state = open ? 'expanded' : 'collapsed';

    const contextValue = React.useMemo<SidebarContextType>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, toggleSidebar],
    );

    // Agrupamento de classes
    const wrapperClasses = [styles.sidebarWrapper, className]
      .filter(Boolean)
      .join(' ');

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                '--sidebar-width': SIDEBAR_WIDTH,
                '--sidebar-width-mobile': SIDEBAR_WIDTH_MOBILE,
                '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={wrapperClasses}
            data-state={state}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  },
);
SidebarProvider.displayName = 'SidebarProvider';

// Inset
export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  const insetClasses = [styles.sidebarInset, className]
    .filter(Boolean)
    .join(' ');

  return <div ref={ref} className={insetClasses} {...props} />;
});
SidebarInset.displayName = 'SidebarInset';

// Sidebar
export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    side?: 'left' | 'right';
    variant?: 'sidebar' | 'floating' | 'inset';
    collapsible?: 'offcanvas' | 'icon' | 'none';
  }
>(
  (
    {
      side = 'left',
      variant = 'sidebar',
      collapsible = 'offcanvas',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

    // 1. Estado: Barra estática (sem animações)
    if (collapsible === 'none') {
      const noneClasses = [styles.sidebarNone, className]
        .filter(Boolean)
        .join(' ');
      return (
        <div className={noneClasses} ref={ref} {...props}>
          {children}
        </div>
      );
    }

    // 2. Estado: Dispositivo Mobile (usa o componente Sheet/Modal)
    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className={styles.mobileSheetContent}
            style={
              { '--sidebar-width': SIDEBAR_WIDTH_MOBILE } as React.CSSProperties
            }
            side={side}
          >
            <div className={styles.mobileInner}>{children}</div>
          </SheetContent>
        </Sheet>
      );
    }

    // 3. Estado: Desktop (Comportamento completo)
    const wrapperClasses = [styles.sidebarDesktopWrapper, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={wrapperClasses}
        data-state={state}
        data-collapsible={state === 'collapsed' ? collapsible : ''}
        data-variant={variant}
        data-side={side}
      >
        {/* A "Lombada": div invisível que empurra o conteúdo principal (SidebarInset) para o lado */}
        <div className={styles.sidebarGap} />

        {/* A Barra Visível: fixa na tela e desliza de acordo com o estado */}
        <div className={styles.sidebarFixed} {...props}>
          <div data-sidebar="sidebar" className={styles.sidebarInner}>
            {children}
          </div>
        </div>
      </div>
    );
  },
);
Sidebar.displayName = 'Sidebar';

// Header
export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  const headerClasses = [styles.sidebarHeader, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} data-sidebar="header" className={headerClasses} {...props} />
  );
});
SidebarHeader.displayName = 'SidebarHeader';

// Menu
export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => {
  const menuClasses = [styles.sidebarMenu, className].filter(Boolean).join(' ');

  return (
    <ul ref={ref} data-sidebar="menu" className={menuClasses} {...props} />
  );
});
SidebarMenu.displayName = 'SidebarMenu';

// Menu Item
export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => {
  const menuItemClasses = [styles.sidebarMenuItem, className]
    .filter(Boolean)
    .join(' ');

  return (
    <li
      ref={ref}
      data-sidebar="menu-item"
      className={menuItemClasses}
      {...props}
    />
  );
});
SidebarMenuItem.displayName = 'SidebarMenuItem';

// Content
export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={[styles.sidebarContent, className].filter(Boolean).join(' ')}
      {...props}
    />
  );
});
SidebarContent.displayName = 'SidebarContent';

// Footer
export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={[styles.sidebarFooter, className].filter(Boolean).join(' ')}
      {...props}
    />
  );
});
SidebarFooter.displayName = 'SidebarFooter';

// Group
export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={[styles.sidebarGroup, className].filter(Boolean).join(' ')}
      {...props}
    />
  );
});
SidebarGroup.displayName = 'SidebarGroup';

// Group Content
export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={[styles.sidebarGroupContent, className]
      .filter(Boolean)
      .join(' ')}
    {...props}
  />
));
SidebarGroupContent.displayName = 'SidebarGroupContent';

// Group Label
export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={[styles.sidebarGroupLabel, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

// Menu Button
export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & {
    asChild?: boolean;
    isActive?: boolean;
    variant?: 'default' | 'outline';
    size?: 'default' | 'sm' | 'lg';
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  }
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = 'default',
      size = 'default',
      tooltip,
      className,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const { isMobile, state } = useSidebar();

    const buttonClasses = [
      styles.sidebarMenuButton,
      styles[`variant-${variant}`],
      styles[`size-${size}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={buttonClasses}
        {...props}
      />
    );

    if (!tooltip) {
      return button;
    }

    const tooltipProps =
      typeof tooltip === 'string' ? { children: tooltip } : tooltip;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== 'collapsed' || isMobile}
          {...tooltipProps}
        />
      </Tooltip>
    );
  },
);
SidebarMenuButton.displayName = 'SidebarMenuButton';

// Trigger
export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  const triggerClasses = [styles.sidebarTrigger, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      data-sidebar="trigger"
      className={triggerClasses}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft className={styles.triggerIcon} />
      <span className={styles.srOnly}>Toggle Sidebar</span>
    </button>
  );
});
SidebarTrigger.displayName = 'SidebarTrigger';
