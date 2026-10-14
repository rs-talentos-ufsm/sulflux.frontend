import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type TenantType = 'PRODUCER' | 'COMPANY' | 'CONSULTANCY' | 'COOPERATIVE';

export interface ClientOrg {
  id: string;
  name: string;
  type: TenantType;
  document?: string;
  color?: string;
}

interface TenantState {
  clients: ClientOrg[];
  activeClientId: string;
  activePropertyId: string | null;
  setActiveClient: (clientId: string) => void;
  setActiveProperty: (propertyId: string | null) => void;
  addClient: (client: Omit<ClientOrg, 'id'>) => void;
}

const DEFAULT_CLIENTS: ClientOrg[] = [
  {
    id: 'org-default',
    name: 'Grupo Agro Dorneles',
    type: 'COMPANY',
    document: '04.123.456/0001-89',
    color: 'var(--primary, #10b981)',
  },
  {
    id: 'org-coop',
    name: 'Cooperativa Agro Sulflux',
    type: 'COOPERATIVE',
    document: '12.987.654/0001-32',
    color: '#0284c7',
  },
  {
    id: 'org-consultoria',
    name: 'Consultoria AgroSustentável',
    type: 'CONSULTANCY',
    document: '23.456.789/0001-11',
    color: '#8b5cf6',
  },
  {
    id: 'org-produtor-indiv',
    name: 'Fernando Dorneles (Produtor)',
    type: 'PRODUCER',
    document: '123.456.789-00',
    color: '#f59e0b',
  },
];

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      clients: DEFAULT_CLIENTS,
      activeClientId: 'org-default',
      activePropertyId: null,

      setActiveClient: (clientId: string) =>
        set((state) => ({
          activeClientId: clientId,
          // Se mudou de cliente/empresa, reseta a fazenda ativa para não misturar contextos
          activePropertyId:
            state.activeClientId === clientId ? state.activePropertyId : null,
        })),

      setActiveProperty: (propertyId: string | null) =>
        set({ activePropertyId: propertyId }),

      addClient: (clientData) =>
        set((state) => {
          const newClient: ClientOrg = {
            ...clientData,
            id: `org-${Date.now()}`,
          };
          return {
            clients: [...state.clients, newClient],
            activeClientId: newClient.id,
            activePropertyId: null,
          };
        }),
    }),
    {
      name: '@sulflux:tenant-state',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
