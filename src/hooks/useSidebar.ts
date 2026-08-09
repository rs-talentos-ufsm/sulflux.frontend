import * as React from 'react';
import { SidebarContext } from '../components/ui/sidebar/sidebar';

export function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error(
      'useSidebar deve ser utilizado obrigatoriamente dentro de um SidebarProvider',
    );
  }

  return context;
}
