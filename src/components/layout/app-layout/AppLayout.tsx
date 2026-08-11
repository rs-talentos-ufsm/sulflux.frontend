import { Outlet } from 'react-router-dom';
import AppHeader from '../app-header/AppHeader';
import AppSidebar from '../app-sidebar/AppSidebar';

import styles from './AppLayout.module.css';
import { ThemeProvider } from '../../ui/theme/theme-provider';
import { SidebarProvider, SidebarInset } from '../../ui/sidebar/sidebar';
import { Toaster } from '../../ui/toaster/toaster';

export default function AppLayout() {
  return (
    <div className={styles.layoutWrapper}>
      <ThemeProvider defaultTheme="system" storageKey="sulflux-theme">
        <SidebarProvider>
          <AppSidebar />

          <SidebarInset>
            <AppHeader />
            <main className={styles.mainContent}>
              <Outlet />
            </main>
          </SidebarInset>
        </SidebarProvider>

        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </div>
  );
}
